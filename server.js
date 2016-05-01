var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var morgan = require('morgan')
var validUrl = require('valid-url');
var q = require('q');

var bodyParser = require('body-parser');
var iconv  = require('iconv-lite');
var app = express();

var moment = require('moment');
    moment.locale('fr', {
      months : "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
      monthsShort : "jan_fév_mars_avr_mai_juin_juil_août_sept_oct_nov_déc".split("_"),
      weekdays : "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
      weekdaysShort : "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
      weekdaysMin : "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
      longDateFormat : {LT : "HH:mm", LTS : "HH:mm:ss", L : "DD/MM/YYYY", LL : "D MMMM YYYY", LLL : "D MMMM YYYY LT", LLLL : "dddd D MMMM YYYY LT"},
      calendar : {sameDay: "[Aujourd'hui à] LT", nextDay: '[Demain à] LT', nextWeek: 'dddd [à] LT', lastDay: '[Hier à] LT', lastWeek: 'dddd [dernier à] LT', sameElse: 'L'},
      relativeTime : {future : "dans %s", past : "il y a %s", s : "quelques secondes", m : "une minute", mm : "%d minutes", h : "une heure", hh : "%d heures", d : "un jour", dd : "%d jours", M : "un mois", MM : "%d mois", y : "une année", yy : "%d années"},
      ordinalParse : /\d{1,2}(er|ème)/,
      ordinal : function (number) {return number + (number === 1 ? 'er' : 'ème'); },
      meridiemParse: /PD|MD/,
      isPM: function (input) {return input.charAt(0) === 'M'; },
      meridiem : function (hours, minutes, isLower) {return hours < 12 ? 'PD' : 'MD'; },
      week : {dow : 1, doy : 4}
    });

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.use(express.static(__dirname + '/public'));

var validateUri = function(suspect) {
  return validUrl.isUri(suspect) && suspect.search('https://www.leboncoin.fr/') === 0;
};

var parseDate = function(string) {
  var bits = string.split(/\s*,\s*/);

  var isToday = false;
  var isYesterday = false;
  var date = new Date();

  if (bits.length !== 2) {
    return {
      ISOString: '',
      label: ''
    };
  }

  // Yay hardcoded values
  if (bits[0] === "Aujourd'hui") {
    isToday = true;
  } else if (bits[0] === "Hier") {
    isYesterday = true;
    date.setDate(date.getDate() - 1);
  } else {
    date = moment(bits[0], 'D MMM').toDate();
  }

  var timeBits = bits[1].split(/\s*:\s*/);
  date.setHours(timeBits[0]);
  date.setMinutes(timeBits[1]);

  return {
    ISOString: date.toISOString(),
    label: string,
    relativeLabel: moment(date).from(moment())
  };
};

var detailedCache = {};

var getDetailPromiseForId = function(url) {
  var deferred = q.defer();

  if (detailedCache[url] !== undefined) {
    // setTimeout(function() {deferred.resolve();}, 1);
    return detailedCache[url];
  }

  console.log('Requesting ' + url);
  request({ encoding: null, method: 'GET', url: url}, function(error, response, html){
    if (error) {
      console.log(url + ' request failed');
      console.log('Reason: ' + error + ' ' + response);
      q.reject(error);
      return;
    }

    var utf8String = iconv.decode(new Buffer(html), "ISO-8859-1");
    var $ = cheerio.load(utf8String);

    detailedCache[url] = {
      address: $('.line_city .value').text(),
      url: url
    };

    deferred.resolve(detailedCache[url]);
  });

  return deferred.promise;
};

var getListPromiseForURL = function(url) {
  var deferred = q.defer();

  console.log('Requesting ' + url);
  request({ encoding: null, method: 'GET', url: url}, function(error, response, html){
    if (error) {
      console.log(url + ' request failed');
      console.log('Reason: ' + error + ' ' + response);
      q.reject(error);
      return;
    }

    var results = [];
    var utf8String = iconv.decode(new Buffer(html), "ISO-8859-1");
    var $ = cheerio.load(utf8String);

    $('.mainList .list_item').filter(function() {
      var element = $(this);

      var dateElement = element.find('.item_absolute p');
      dateElement.find('.emergency').remove(); // removes the "Urgent" element...

      results.push({
        thumbnail: element.find('.item_imagePic .lazyload').attr('data-imgsrc'),
        title: element.find('.item_infos .item_title').text().replace(/^\s+|\s+$/g,''),
        url: 'http:' + element.attr('href'),
        imageCount: +element.find('.item_imageNumber span').text(),
        id: element.attr('href').split(/^.*\/(\d+)\.htm.*$/)[1],
        location: element.find('.item_supp').eq(1).text().replace(/^\s+|\s+$/g,'').replace(/(\s|\n|\r)*\/(.|\n|\r)*$/, ''),
        price: element.find('.item_price').text().replace(/^\s+|\s+$/g,''),
        lastUpdate: parseDate(dateElement.text().replace(/^\s+|\s+$/g,''))
      });
    });

    var json = {url: url, results: results};
    deferred.resolve(json);
  });

  return deferred.promise;
};

var redneckCache = undefined;

app.post('/summaries', function(req, res) {
  var urls = req.body.urls;
  var errors = [];

  if (!urls || urls.length === 0) {
    res.status(400).json({message: 'No urls found in the request'});
  }

  if (redneckCache !== undefined) {
    res.json({data: redneckCache});
    return;
  }

  var promises = urls
    .filter(validateUri)
    .map(getListPromiseForURL);

  q.all(promises).then(
    function(results) {
      // redneckCache = results;
      res.json({data: results});
    },
    function(reason) {res.status(503).json({message: reason});}
  );
});

app.post('/details', function(req, res) {
  var urls = req.body.urls;

  if (!urls || urls.length === 0) {
    res.status(400).json({message: 'No ids found in the request'});
  }

  var promises = urls
    .map(getDetailPromiseForId);

  q.all(promises).then(
    function(results) {res.json({data: results});},
    function(reason) {res.status(503).json({message: reason});}
  );


});

app.listen('8081');

console.log('Magic happens on port 8081');

exports = module.exports = app;

