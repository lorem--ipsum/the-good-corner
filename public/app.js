(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = null;
    hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("components/App.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _qwest = require('qwest');

var _qwest2 = _interopRequireDefault(_qwest);

var _Card = require('./Card.jsx');

var _Card2 = _interopRequireDefault(_Card);

var _Banner = require('./Banner.jsx');

var _Banner2 = _interopRequireDefault(_Banner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this, props));

    _this.state = {
      items: []
    };
    return _this;
  }

  _createClass(App, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // var queries = this.props.queries;

      var queries = ['https://www.leboncoin.fr/locations/offres/bretagne/finistere/?th=1&mrs=600&mre=950&ret=1', 'https://www.leboncoin.fr/motos/offres/bretagne/finistere/29/?th=1&pe=7&ccs=600'];

      if (!queries || queries.length === 0) {
        this.state.items = [];
        return;
      }

      var that = this;

      _qwest2.default.post('/results', { queries: queries }).then(function (xhr, response) {
        that.setState({
          items: response.data.reduce(function (a, b) {
            return a.concat(b.results);
          }, []).map(function (item) {
            item.lastUpdate.date = new Date(item.lastUpdate.ISOString);
            return item;
          }).sort(function (a, b) {
            return b.lastUpdate.date.getTime() - a.lastUpdate.date.getTime();
          })
        });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'content' },
        _react2.default.createElement(_Banner2.default, { queries: this.state.queries }),
        _react2.default.createElement(
          'div',
          { className: 'items' },
          _react2.default.createElement(
            'div',
            { className: 'prout' },
            this.state.items.map(function (item, i) {
              return _react2.default.createElement(_Card2.default, { item: item, key: i });
            })
          )
        ),
        _react2.default.createElement('div', { className: 'footer' })
      );
    }
  }]);

  return App;
}(_react2.default.Component);

exports.default = App;
});

;require.register("components/Banner.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Banner = function (_React$Component) {
  _inherits(Banner, _React$Component);

  function Banner(props) {
    _classCallCheck(this, Banner);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Banner).call(this, props));

    _this.state = {
      isOpen: false
    };
    return _this;
  }

  _createClass(Banner, [{
    key: 'toggle',
    value: function toggle() {
      this.setState({ isOpen: !this.state.isOpen });
    }
  }, {
    key: 'render',
    value: function render() {
      var drawerClasses = ['drawer'];

      if (this.state.isOpen) {
        drawerClasses.push('open');
      } else {
        drawerClasses.push('closed');
      }

      return _react2.default.createElement(
        'div',
        { className: 'banner' },
        _react2.default.createElement(
          'div',
          { className: 'row header' },
          _react2.default.createElement('div', { className: 'col-20' }),
          _react2.default.createElement(
            'div',
            { className: 'col-60 center light' },
            'The Good Corner'
          ),
          _react2.default.createElement(
            'div',
            { className: 'col-20 right' },
            _react2.default.createElement('i', { className: this.state.isOpen ? 'fa fa-remove' : 'fa fa-gear', onClick: this.toggle.bind(this) })
          )
        ),
        _react2.default.createElement(
          'div',
          { className: drawerClasses.join(' ') },
          _react2.default.createElement('textarea', null),
          _react2.default.createElement(
            'div',
            { className: 'row buttons' },
            _react2.default.createElement(
              'div',
              { className: 'col-100 right' },
              _react2.default.createElement(
                'button',
                { className: 'secondary' },
                'Cancel'
              ),
              _react2.default.createElement(
                'button',
                { className: 'primary' },
                'Save'
              )
            )
          )
        )
      );
    }
  }]);

  return Banner;
}(_react2.default.Component);

exports.default = Banner;
});

;require.register("components/Card.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Card = function (_React$Component) {
  _inherits(Card, _React$Component);

  function Card(props) {
    _classCallCheck(this, Card);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Card).call(this, props));
  }

  _createClass(Card, [{
    key: 'render',
    value: function render() {
      var thumbnailClasses = ['thumbnail'];
      if (!this.props.item.thumbnail) {
        thumbnailClasses.push('empty');
      }

      var lastUpdate = this.props.item.lastUpdate;

      return _react2.default.createElement(
        'div',
        { className: 'card' },
        _react2.default.createElement(
          'div',
          { className: 'row' },
          _react2.default.createElement(
            'div',
            { className: 'col-20 middle' },
            _react2.default.createElement(
              'div',
              { className: thumbnailClasses.join(' ') },
              _react2.default.createElement('img', { src: this.props.item.thumbnail })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'col-80 infos' },
            _react2.default.createElement(
              'div',
              { className: 'row' },
              _react2.default.createElement(
                'div',
                { className: 'col-50' },
                _react2.default.createElement(
                  'div',
                  { className: 'location' },
                  this.props.item.location
                )
              ),
              _react2.default.createElement(
                'div',
                { className: 'col-50 right' },
                _react2.default.createElement(
                  'div',
                  { className: 'last-update' },
                  _react2.default.createElement(
                    'div',
                    { className: 'absolute' },
                    lastUpdate.label
                  ),
                  _react2.default.createElement(
                    'div',
                    { className: 'relative' },
                    lastUpdate.relativeLabel
                  )
                )
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'title' },
              this.props.item.title
            ),
            _react2.default.createElement(
              'div',
              { className: 'row price-and-actions' },
              _react2.default.createElement(
                'div',
                { className: 'col-50' },
                _react2.default.createElement(
                  'div',
                  { className: 'price' },
                  _react2.default.createElement(
                    'span',
                    null,
                    this.props.item.price
                  )
                )
              ),
              _react2.default.createElement(
                'div',
                { className: 'col-50 right' },
                _react2.default.createElement(
                  'a',
                  { target: '_blank', className: 'link', href: this.props.item.url },
                  _react2.default.createElement('i', { className: 'fa fa-external-link' })
                )
              )
            )
          )
        )
      );
    }
  }]);

  return Card;
}(_react2.default.Component);

exports.default = Card;
});

;require.register("initialize.js", function(exports, require, module) {
'use strict';

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _App = require('./components/App.jsx');

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener('DOMContentLoaded', function () {
  _reactDom2.default.render(_react2.default.createElement(_App2.default, null), document.querySelector('#app'));
});
});

require.alias("react/react.js", "react");
require.alias("qwest/src/qwest.js", "qwest");
require.alias("pinkyswear/pinkyswear.js", "pinkyswear");
require.alias("jquery-param/jquery-param.js", "jquery-param");
require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map