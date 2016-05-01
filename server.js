var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var morgan = require('morgan')
var q = require('q');

var moment = require('moment');
    moment.locale('fr', {
      months : "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
      monthsShort : "jan_fév_mars_avr_mai_juin_juil_août_sept_oct_nov_déc".split("_"),
      weekdays : "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
      weekdaysShort : "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
      weekdaysMin : "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
      longDateFormat : {
        LT : "HH:mm",
        LTS : "HH:mm:ss",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd D MMMM YYYY LT"
      },
      calendar : {
        sameDay: "[Aujourd'hui à] LT",
        nextDay: '[Demain à] LT',
        nextWeek: 'dddd [à] LT',
        lastDay: '[Hier à] LT',
        lastWeek: 'dddd [dernier à] LT',
        sameElse: 'L'
      },
      relativeTime : {
        future : "dans %s",
        past : "il y a %s",
        s : "quelques secondes",
        m : "une minute",
        mm : "%d minutes",
        h : "une heure",
        hh : "%d heures",
        d : "un jour",
        dd : "%d jours",
        M : "un mois",
        MM : "%d mois",
        y : "une année",
        yy : "%d années"
      },
      ordinalParse : /\d{1,2}(er|ème)/,
      ordinal : function (number) {
        return number + (number === 1 ? 'er' : 'ème');
      },
      meridiemParse: /PD|MD/,
      isPM: function (input) {
        return input.charAt(0) === 'M';
      },
      // in case the meridiem units are not separated around 12, then implement
      // this function (look at locale/id.js for an example)
      // meridiemHour : function (hour, meridiem) {
      //     return /* 0-23 hour, given meridiem token and hour 1-12 */
      // },
      meridiem : function (hours, minutes, isLower) {
        return hours < 12 ? 'PD' : 'MD';
      },
      week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
      }
    });

var bodyParser = require('body-parser');
var iconv  = require('iconv-lite');
var app = express();

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.use(express.static(__dirname + '/public'));

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

var getPromiseForURL = function(url) {
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

      results.push({
        thumbnail: element.find('.item_imagePic .lazyload').attr('data-imgsrc'),
        title: element.find('.item_infos .item_title').text().replace(/^\s+|\s+$/g,''),
        url: element.attr('href'),
        location: element.find('.item_supp').eq(1).text().replace(/^\s+|\s+$/g,'').replace(/(\s|\n|\r)*\/(.|\n|\r)*$/, ''),
        price: element.find('.item_price').text().replace(/^\s+|\s+$/g,''),
        lastUpdate: parseDate(element.find('.item_absolute p').text().replace(/^\s+|\s+$/g,''))
      });
    });

    var json = {url: url, results: results};
    deferred.resolve(json);
  });

  return deferred.promise;
};

var redneckCache = undefined;

app.post('/results', function(req, res) {
  var queries = req.body.queries;
  var errors = [];

  if (!queries || queries.length === 0) {
    res.status(400).json({message: 'No queries found in the request'});
  }

  if (redneckCache !== undefined) {
    res.json({data: redneckCache});
    return;
  }

  q.all(queries.map(getPromiseForURL)).then(
    function(results) {
      redneckCache = results;
      res.json({data: results});
    },
    function(reason) {res.status(503).json({message: reason});}
  );
});

app.listen('8081');

console.log('Magic happens on port 8081');

exports = module.exports = app;

