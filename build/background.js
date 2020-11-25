/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@tgiardina/sniff/dist/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/@tgiardina/sniff/dist/index.js ***!
  \*****************************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export initWsSniffer [provided] [no usage info] [missing usage info prevents renaming] */
/*! export sniffHttp [provided] [no usage info] [missing usage info prevents renaming] */
/*! export sniffWs [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sniffWs = exports.initWsSniffer = exports.sniffHttp = void 0;
var sniff_http_1 = __webpack_require__(/*! ./sniff-http */ "./node_modules/@tgiardina/sniff/dist/sniff-http/index.js");
Object.defineProperty(exports, "sniffHttp", ({
  enumerable: true,
  get: function () {
    return sniff_http_1.sniffHttp;
  },
}));
var sniff_ws_1 = __webpack_require__(/*! ./sniff-ws */ "./node_modules/@tgiardina/sniff/dist/sniff-ws/index.js");
Object.defineProperty(exports, "initWsSniffer", ({
  enumerable: true,
  get: function () {
    return sniff_ws_1.initWsSniffer;
  },
}));
Object.defineProperty(exports, "sniffWs", ({
  enumerable: true,
  get: function () {
    return sniff_ws_1.sniffWs;
  },
}));


/***/ }),

/***/ "./node_modules/@tgiardina/sniff/dist/sniff-http/index.js":
/*!****************************************************************!*\
  !*** ./node_modules/@tgiardina/sniff/dist/sniff-http/index.js ***!
  \****************************************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export sniffHttp [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sniffHttp = void 0;
function sniffHttp(callback) {
  browser.webRequest.onBeforeRequest.addListener(
    function (details) {
      var filter = browser.webRequest.filterResponseData(details.requestId);
      var decoder = new TextDecoder("utf-8");
      var encoder = new TextEncoder();
      var data = [];
      filter.ondata = function (event) {
        data.push(decoder.decode(event.data, { stream: true }));
      };
      filter.onstop = function () {
        try {
          data.push(decoder.decode());
          var json = data.join("");
          callback({
            data: json,
            srcUrl: details.originUrl,
            targetUrl: details.url,
            tabId: details.tabId,
          });
          filter.write(encoder.encode(json));
          filter.close();
        } catch (err) {
          console.log("sniffHttp thre " + err);
        }
      };
    },
    { urls: ["<all_urls>"], types: ["xmlhttprequest"] },
    ["blocking"]
  );
}
exports.sniffHttp = sniffHttp;


/***/ }),

/***/ "./node_modules/@tgiardina/sniff/dist/sniff-ws/background.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@tgiardina/sniff/dist/sniff-ws/background.js ***!
  \*******************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__ */
/*! CommonJS bailout: this is used directly at 3:3-7 */
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.default = function (callback) {
  chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === "gdonkey-ws-sniffer") {
      port.onMessage.addListener(function (msg, meta) {
        meta.sender = meta.sender;
        if (!meta.sender.tab)
          throw new Error("Incorrectly set tabs permission");
        callback(__assign({ tabId: meta.sender.tab.id }, msg));
      });
    }
  });
};


/***/ }),

/***/ "./node_modules/@tgiardina/sniff/dist/sniff-ws/content.js":
/*!****************************************************************!*\
  !*** ./node_modules/@tgiardina/sniff/dist/sniff-ws/content.js ***!
  \****************************************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * https://stackoverflow.com/questions/9515704/insert-code-into-the-page-context-using-a-content-script
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
// @ts-nocheck
exports.default = function () {
  var sniffer =
    "(" +
    function () {
      var OgWebSocket = window.WebSocket;
      var callWebSocket = OgWebSocket.apply.bind(OgWebSocket);
      var wsAddListener = OgWebSocket.prototype.addEventListener;
      wsAddListener = wsAddListener.call.bind(wsAddListener);
      window.WebSocket = function WebSocket(url, protocols) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          args[_i - 2] = arguments[_i];
        }
        var ws;
        if (!(this instanceof WebSocket)) {
          ws = callWebSocket(this, args);
        } else if (arguments.length === 1) {
          ws = new OgWebSocket(url);
        } else if (arguments.length >= 2) {
          ws = new OgWebSocket(url, protocols);
        } else {
          ws = new OgWebSocket();
        }
        wsAddListener(ws, "message", function (event) {
          window.postMessage({
            id: "gdonkey-injected-ws-sniffer",
            json: event.data,
            targetUrl: url,
          });
        });
        return ws;
      }.bind();
      window.WebSocket.prototype = OgWebSocket.prototype;
      window.WebSocket.prototype.constructor = window.WebSocket;
      var wsSend = OgWebSocket.prototype.send;
      wsSend = wsSend.apply.bind(wsSend);
      OgWebSocket.prototype.send = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return wsSend(this, args);
      };
    } +
    ")()";
  var port = browser.runtime.connect({ name: "gdonkey-ws-sniffer" });
  window.addEventListener("message", function (event) {
    if (event.data.id === "gdonkey-injected-ws-sniffer") {
      port.postMessage({
        data: event.data.json,
        srcUrl: window.location.href,
        targetUrl: event.data.targetUrl,
      });
    }
  });
  var script = document.createElement("script");
  script.textContent = sniffer;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
};


/***/ }),

/***/ "./node_modules/@tgiardina/sniff/dist/sniff-ws/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/@tgiardina/sniff/dist/sniff-ws/index.js ***!
  \**************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 3:3-7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initWsSniffer = exports.sniffWs = void 0;
var background_1 = __webpack_require__(/*! ./background */ "./node_modules/@tgiardina/sniff/dist/sniff-ws/background.js");
Object.defineProperty(exports, "sniffWs", ({
  enumerable: true,
  get: function () {
    return __importDefault(background_1).default;
  },
}));
var content_1 = __webpack_require__(/*! ./content */ "./node_modules/@tgiardina/sniff/dist/sniff-ws/content.js");
Object.defineProperty(exports, "initWsSniffer", ({
  enumerable: true,
  get: function () {
    return __importDefault(content_1).default;
  },
}));


/***/ }),

/***/ "./node_modules/balanced-match/index.js":
/*!**********************************************!*\
  !*** ./node_modules/balanced-match/index.js ***!
  \**********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 2:0-14 */
/***/ ((module) => {

"use strict";

module.exports = balanced;
function balanced(a, b, str) {
  if (a instanceof RegExp) a = maybeMatch(a, str);
  if (b instanceof RegExp) b = maybeMatch(b, str);

  var r = range(a, b, str);

  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}

function maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}

balanced.range = range;
function range(a, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;

  if (ai >= 0 && bi > 0) {
    begs = [];
    left = str.length;

    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length == 1) {
        result = [ begs.pop(), bi ];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }

        bi = str.indexOf(b, i + 1);
      }

      i = ai < bi && ai >= 0 ? ai : bi;
    }

    if (begs.length) {
      result = [ left, right ];
    }
  }

  return result;
}


/***/ }),

/***/ "./node_modules/brace-expansion/index.js":
/*!***********************************************!*\
  !*** ./node_modules/brace-expansion/index.js ***!
  \***********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 4:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var concatMap = __webpack_require__(/*! concat-map */ "./node_modules/concat-map/index.js");
var balanced = __webpack_require__(/*! balanced-match */ "./node_modules/balanced-match/index.js");

module.exports = expandTop;

var escSlash = '\0SLASH'+Math.random()+'\0';
var escOpen = '\0OPEN'+Math.random()+'\0';
var escClose = '\0CLOSE'+Math.random()+'\0';
var escComma = '\0COMMA'+Math.random()+'\0';
var escPeriod = '\0PERIOD'+Math.random()+'\0';

function numeric(str) {
  return parseInt(str, 10) == str
    ? parseInt(str, 10)
    : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.split('\\\\').join(escSlash)
            .split('\\{').join(escOpen)
            .split('\\}').join(escClose)
            .split('\\,').join(escComma)
            .split('\\.').join(escPeriod);
}

function unescapeBraces(str) {
  return str.split(escSlash).join('\\')
            .split(escOpen).join('{')
            .split(escClose).join('}')
            .split(escComma).join(',')
            .split(escPeriod).join('.');
}


// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function parseCommaParts(str) {
  if (!str)
    return [''];

  var parts = [];
  var m = balanced('{', '}', str);

  if (!m)
    return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length-1] += '{' + body + '}';
  var postParts = parseCommaParts(post);
  if (post.length) {
    p[p.length-1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function expandTop(str) {
  if (!str)
    return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function identity(e) {
  return e;
}

function embrace(str) {
  return '{' + str + '}';
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}

function expand(str, isTop) {
  var expansions = [];

  var m = balanced('{', '}', str);
  if (!m || /\$$/.test(m.pre)) return [str];

  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  var isSequence = isNumericSequence || isAlphaSequence;
  var isOptions = m.body.indexOf(',') >= 0;
  if (!isSequence && !isOptions) {
    // {a},b}
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + escClose + m.post;
      return expand(str);
    }
    return [str];
  }

  var n;
  if (isSequence) {
    n = m.body.split(/\.\./);
  } else {
    n = parseCommaParts(m.body);
    if (n.length === 1) {
      // x{{a,b}}y ==> x{a}y x{b}y
      n = expand(n[0], false).map(embrace);
      if (n.length === 1) {
        var post = m.post.length
          ? expand(m.post, false)
          : [''];
        return post.map(function(p) {
          return m.pre + n[0] + p;
        });
      }
    }
  }

  // at this point, n is the parts, and we know it's not a comma set
  // with a single entry.

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length
    ? expand(m.post, false)
    : [''];

  var N;

  if (isSequence) {
    var x = numeric(n[0]);
    var y = numeric(n[1]);
    var width = Math.max(n[0].length, n[1].length)
    var incr = n.length == 3
      ? Math.abs(numeric(n[2]))
      : 1;
    var test = lte;
    var reverse = y < x;
    if (reverse) {
      incr *= -1;
      test = gte;
    }
    var pad = n.some(isPadded);

    N = [];

    for (var i = x; test(i, y); i += incr) {
      var c;
      if (isAlphaSequence) {
        c = String.fromCharCode(i);
        if (c === '\\')
          c = '';
      } else {
        c = String(i);
        if (pad) {
          var need = width - c.length;
          if (need > 0) {
            var z = new Array(need + 1).join('0');
            if (i < 0)
              c = '-' + z + c.slice(1);
            else
              c = z + c;
          }
        }
      }
      N.push(c);
    }
  } else {
    N = concatMap(n, function(el) { return expand(el, false) });
  }

  for (var j = 0; j < N.length; j++) {
    for (var k = 0; k < post.length; k++) {
      var expansion = pre + N[j] + post[k];
      if (!isTop || isSequence || expansion)
        expansions.push(expansion);
    }
  }

  return expansions;
}



/***/ }),

/***/ "./node_modules/concat-map/index.js":
/*!******************************************!*\
  !*** ./node_modules/concat-map/index.js ***!
  \******************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 1:0-14 */
/***/ ((module) => {

module.exports = function (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (isArray(x)) res.push.apply(res, x);
        else res.push(x);
    }
    return res;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};


/***/ }),

/***/ "./node_modules/minimatch/minimatch.js":
/*!*********************************************!*\
  !*** ./node_modules/minimatch/minimatch.js ***!
  \*********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 1:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = minimatch
minimatch.Minimatch = Minimatch

var path = { sep: '/' }
try {
  path = __webpack_require__(/*! path */ "./node_modules/path-browserify/index.js")
} catch (er) {}

var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
var expand = __webpack_require__(/*! brace-expansion */ "./node_modules/brace-expansion/index.js")

var plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
}

// any single thing other than /
// don't need to escape / when using new RegExp()
var qmark = '[^/]'

// * => any number of characters
var star = qmark + '*?'

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?'

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?'

// characters that need to be escaped in RegExp.
var reSpecials = charSet('().*{}+?[]^$\\!')

// "abc" -> { a:true, b:true, c:true }
function charSet (s) {
  return s.split('').reduce(function (set, c) {
    set[c] = true
    return set
  }, {})
}

// normalizes slashes.
var slashSplit = /\/+/

minimatch.filter = filter
function filter (pattern, options) {
  options = options || {}
  return function (p, i, list) {
    return minimatch(p, pattern, options)
  }
}

function ext (a, b) {
  a = a || {}
  b = b || {}
  var t = {}
  Object.keys(b).forEach(function (k) {
    t[k] = b[k]
  })
  Object.keys(a).forEach(function (k) {
    t[k] = a[k]
  })
  return t
}

minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return minimatch

  var orig = minimatch

  var m = function minimatch (p, pattern, options) {
    return orig.minimatch(p, pattern, ext(def, options))
  }

  m.Minimatch = function Minimatch (pattern, options) {
    return new orig.Minimatch(pattern, ext(def, options))
  }

  return m
}

Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return Minimatch
  return minimatch.defaults(def).Minimatch
}

function minimatch (p, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false
  }

  // "" only matches ""
  if (pattern.trim() === '') return p === ''

  return new Minimatch(pattern, options).match(p)
}

function Minimatch (pattern, options) {
  if (!(this instanceof Minimatch)) {
    return new Minimatch(pattern, options)
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}
  pattern = pattern.trim()

  // windows support: need to use /, not \
  if (path.sep !== '/') {
    pattern = pattern.split(path.sep).join('/')
  }

  this.options = options
  this.set = []
  this.pattern = pattern
  this.regexp = null
  this.negate = false
  this.comment = false
  this.empty = false

  // make the set of regexps etc.
  this.make()
}

Minimatch.prototype.debug = function () {}

Minimatch.prototype.make = make
function make () {
  // don't do it more than once.
  if (this._made) return

  var pattern = this.pattern
  var options = this.options

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    this.comment = true
    return
  }
  if (!pattern) {
    this.empty = true
    return
  }

  // step 1: figure out negation, etc.
  this.parseNegate()

  // step 2: expand braces
  var set = this.globSet = this.braceExpand()

  if (options.debug) this.debug = console.error

  this.debug(this.pattern, set)

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(slashSplit)
  })

  this.debug(this.pattern, set)

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this)
  }, this)

  this.debug(this.pattern, set)

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return s.indexOf(false) === -1
  })

  this.debug(this.pattern, set)

  this.set = set
}

Minimatch.prototype.parseNegate = parseNegate
function parseNegate () {
  var pattern = this.pattern
  var negate = false
  var options = this.options
  var negateOffset = 0

  if (options.nonegate) return

  for (var i = 0, l = pattern.length
    ; i < l && pattern.charAt(i) === '!'
    ; i++) {
    negate = !negate
    negateOffset++
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset)
  this.negate = negate
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = function (pattern, options) {
  return braceExpand(pattern, options)
}

Minimatch.prototype.braceExpand = braceExpand

function braceExpand (pattern, options) {
  if (!options) {
    if (this instanceof Minimatch) {
      options = this.options
    } else {
      options = {}
    }
  }

  pattern = typeof pattern === 'undefined'
    ? this.pattern : pattern

  if (typeof pattern === 'undefined') {
    throw new TypeError('undefined pattern')
  }

  if (options.nobrace ||
    !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  return expand(pattern)
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
Minimatch.prototype.parse = parse
var SUBPARSE = {}
function parse (pattern, isSub) {
  if (pattern.length > 1024 * 64) {
    throw new TypeError('pattern is too long')
  }

  var options = this.options

  // shortcuts
  if (!options.noglobstar && pattern === '**') return GLOBSTAR
  if (pattern === '') return ''

  var re = ''
  var hasMagic = !!options.nocase
  var escaping = false
  // ? => one single character
  var patternListStack = []
  var negativeLists = []
  var stateChar
  var inClass = false
  var reClassStart = -1
  var classStart = -1
  // . and .. never match anything that doesn't start with .,
  // even when options.dot is set.
  var patternStart = pattern.charAt(0) === '.' ? '' // anything
  // not (start or / followed by . or .. followed by / or end)
  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
  : '(?!\\.)'
  var self = this

  function clearStateChar () {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case '*':
          re += star
          hasMagic = true
        break
        case '?':
          re += qmark
          hasMagic = true
        break
        default:
          re += '\\' + stateChar
        break
      }
      self.debug('clearStateChar %j %j', stateChar, re)
      stateChar = false
    }
  }

  for (var i = 0, len = pattern.length, c
    ; (i < len) && (c = pattern.charAt(i))
    ; i++) {
    this.debug('%s\t%s %s %j', pattern, i, re, c)

    // skip over any that are escaped.
    if (escaping && reSpecials[c]) {
      re += '\\' + c
      escaping = false
      continue
    }

    switch (c) {
      case '/':
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false

      case '\\':
        clearStateChar()
        escaping = true
      continue

      // the various stateChar values
      // for the "extglob" stuff.
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c)

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class')
          if (c === '!' && i === classStart + 1) c = '^'
          re += c
          continue
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar)
        clearStateChar()
        stateChar = c
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar()
      continue

      case '(':
        if (inClass) {
          re += '('
          continue
        }

        if (!stateChar) {
          re += '\\('
          continue
        }

        patternListStack.push({
          type: stateChar,
          start: i - 1,
          reStart: re.length,
          open: plTypes[stateChar].open,
          close: plTypes[stateChar].close
        })
        // negation is (?:(?!js)[^/]*)
        re += stateChar === '!' ? '(?:(?!(?:' : '(?:'
        this.debug('plType %j %j', stateChar, re)
        stateChar = false
      continue

      case ')':
        if (inClass || !patternListStack.length) {
          re += '\\)'
          continue
        }

        clearStateChar()
        hasMagic = true
        var pl = patternListStack.pop()
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        re += pl.close
        if (pl.type === '!') {
          negativeLists.push(pl)
        }
        pl.reEnd = re.length
      continue

      case '|':
        if (inClass || !patternListStack.length || escaping) {
          re += '\\|'
          escaping = false
          continue
        }

        clearStateChar()
        re += '|'
      continue

      // these are mostly the same in regexp and glob
      case '[':
        // swallow any state-tracking char before the [
        clearStateChar()

        if (inClass) {
          re += '\\' + c
          continue
        }

        inClass = true
        classStart = i
        reClassStart = re.length
        re += c
      continue

      case ']':
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c
          escaping = false
          continue
        }

        // handle the case where we left a class open.
        // "[z-a]" is valid, equivalent to "\[z-a\]"
        if (inClass) {
          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          var cs = pattern.substring(classStart + 1, i)
          try {
            RegExp('[' + cs + ']')
          } catch (er) {
            // not a valid class!
            var sp = this.parse(cs, SUBPARSE)
            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]'
            hasMagic = hasMagic || sp[1]
            inClass = false
            continue
          }
        }

        // finish up the class.
        hasMagic = true
        inClass = false
        re += c
      continue

      default:
        // swallow any state char that wasn't consumed
        clearStateChar()

        if (escaping) {
          // no need
          escaping = false
        } else if (reSpecials[c]
          && !(c === '^' && inClass)) {
          re += '\\'
        }

        re += c

    } // switch
  } // for

  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    cs = pattern.substr(classStart + 1)
    sp = this.parse(cs, SUBPARSE)
    re = re.substr(0, reClassStart) + '\\[' + sp[0]
    hasMagic = hasMagic || sp[1]
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + pl.open.length)
    this.debug('setting tail', re, pl)
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = '\\'
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + '|'
    })

    this.debug('tail=%j\n   %s', tail, tail, pl, re)
    var t = pl.type === '*' ? star
      : pl.type === '?' ? qmark
      : '\\' + pl.type

    hasMagic = true
    re = re.slice(0, pl.reStart) + t + '\\(' + tail
  }

  // handle trailing things that only matter at the very end.
  clearStateChar()
  if (escaping) {
    // trailing \\
    re += '\\\\'
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false
  switch (re.charAt(0)) {
    case '.':
    case '[':
    case '(': addPatternStart = true
  }

  // Hack to work around lack of negative lookbehind in JS
  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
  // like 'a.xyz.yz' doesn't match.  So, the first negative
  // lookahead, has to look ALL the way ahead, to the end of
  // the pattern.
  for (var n = negativeLists.length - 1; n > -1; n--) {
    var nl = negativeLists[n]

    var nlBefore = re.slice(0, nl.reStart)
    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8)
    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd)
    var nlAfter = re.slice(nl.reEnd)

    nlLast += nlAfter

    // Handle nested stuff like *(*.js|!(*.json)), where open parens
    // mean that we should *not* include the ) in the bit that is considered
    // "after" the negated section.
    var openParensBefore = nlBefore.split('(').length - 1
    var cleanAfter = nlAfter
    for (i = 0; i < openParensBefore; i++) {
      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '')
    }
    nlAfter = cleanAfter

    var dollar = ''
    if (nlAfter === '' && isSub !== SUBPARSE) {
      dollar = '$'
    }
    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast
    re = newRe
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== '' && hasMagic) {
    re = '(?=.)' + re
  }

  if (addPatternStart) {
    re = patternStart + re
  }

  // parsing just a piece of a larger pattern.
  if (isSub === SUBPARSE) {
    return [re, hasMagic]
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return globUnescape(pattern)
  }

  var flags = options.nocase ? 'i' : ''
  try {
    var regExp = new RegExp('^' + re + '$', flags)
  } catch (er) {
    // If it was an invalid regular expression, then it can't match
    // anything.  This trick looks for a character after the end of
    // the string, which is of course impossible, except in multi-line
    // mode, but it's not a /m regex.
    return new RegExp('$.')
  }

  regExp._glob = pattern
  regExp._src = re

  return regExp
}

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options || {}).makeRe()
}

Minimatch.prototype.makeRe = makeRe
function makeRe () {
  if (this.regexp || this.regexp === false) return this.regexp

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set

  if (!set.length) {
    this.regexp = false
    return this.regexp
  }
  var options = this.options

  var twoStar = options.noglobstar ? star
    : options.dot ? twoStarDot
    : twoStarNoDot
  var flags = options.nocase ? 'i' : ''

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return (p === GLOBSTAR) ? twoStar
      : (typeof p === 'string') ? regExpEscape(p)
      : p._src
    }).join('\\\/')
  }).join('|')

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = '^(?:' + re + ')$'

  // can match anything, as long as it's not this.
  if (this.negate) re = '^(?!' + re + ').*$'

  try {
    this.regexp = new RegExp(re, flags)
  } catch (ex) {
    this.regexp = false
  }
  return this.regexp
}

minimatch.match = function (list, pattern, options) {
  options = options || {}
  var mm = new Minimatch(pattern, options)
  list = list.filter(function (f) {
    return mm.match(f)
  })
  if (mm.options.nonull && !list.length) {
    list.push(pattern)
  }
  return list
}

Minimatch.prototype.match = match
function match (f, partial) {
  this.debug('match', f, this.pattern)
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false
  if (this.empty) return f === ''

  if (f === '/' && partial) return true

  var options = this.options

  // windows: need to use /, not \
  if (path.sep !== '/') {
    f = f.split(path.sep).join('/')
  }

  // treat the test path as a set of pathparts.
  f = f.split(slashSplit)
  this.debug(this.pattern, 'split', f)

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set
  this.debug(this.pattern, 'set', set)

  // Find the basename of the path by looking for the last non-empty segment
  var filename
  var i
  for (i = f.length - 1; i >= 0; i--) {
    filename = f[i]
    if (filename) break
  }

  for (i = 0; i < set.length; i++) {
    var pattern = set[i]
    var file = f
    if (options.matchBase && pattern.length === 1) {
      file = [filename]
    }
    var hit = this.matchOne(file, pattern, partial)
    if (hit) {
      if (options.flipNegate) return true
      return !this.negate
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false
  return this.negate
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options

  this.debug('matchOne',
    { 'this': this, file: file, pattern: pattern })

  this.debug('matchOne', file.length, pattern.length)

  for (var fi = 0,
      pi = 0,
      fl = file.length,
      pl = pattern.length
      ; (fi < fl) && (pi < pl)
      ; fi++, pi++) {
    this.debug('matchOne loop')
    var p = pattern[pi]
    var f = file[fi]

    this.debug(pattern, p, f)

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false

    if (p === GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f])

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi
      var pr = pi + 1
      if (pr === pl) {
        this.debug('** at the end')
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for (; fi < fl; fi++) {
          if (file[fi] === '.' || file[fi] === '..' ||
            (!options.dot && file[fi].charAt(0) === '.')) return false
        }
        return true
      }

      // ok, let's see if we can swallow whatever we can.
      while (fr < fl) {
        var swallowee = file[fr]

        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee)

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee)
          // found a match.
          return true
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === '.' || swallowee === '..' ||
            (!options.dot && swallowee.charAt(0) === '.')) {
            this.debug('dot detected!', file, fr, pattern, pr)
            break
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue')
          fr++
        }
      }

      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug('\n>>> no match, partial?', file, fr, pattern, pr)
        if (fr === fl) return true
      }
      return false
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit
    if (typeof p === 'string') {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase()
      } else {
        hit = f === p
      }
      this.debug('string match', p, f, hit)
    } else {
      hit = f.match(p)
      this.debug('pattern match', p, f, hit)
    }

    if (!hit) return false
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = (fi === fl - 1) && (file[fi] === '')
    return emptyFileEnd
  }

  // should be unreachable.
  throw new Error('wtf?')
}

// replace stuff like \* with *
function globUnescape (s) {
  return s.replace(/\\(.)/g, '$1')
}

function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}


/***/ }),

/***/ "./node_modules/path-browserify/index.js":
/*!***********************************************!*\
  !*** ./node_modules/path-browserify/index.js ***!
  \***********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 529:0-14 */
/***/ ((module) => {

"use strict";
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;


/***/ }),

/***/ "./src/background.ts":
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:23-27 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var minimatch_1 = __importDefault(__webpack_require__(/*! minimatch */ "./node_modules/minimatch/minimatch.js"));
var sniff_1 = __webpack_require__(/*! @tgiardina/sniff */ "./node_modules/@tgiardina/sniff/dist/index.js");
var Protocol;
(function (Protocol) {
    Protocol[Protocol["Any"] = 0] = "Any";
    Protocol[Protocol["Http"] = 1] = "Http";
    Protocol[Protocol["Ws"] = 2] = "Ws";
})(Protocol || (Protocol = {}));
function getProtocol() {
    var protocolString = "any";
    var protocol;
    if (!protocolString || protocolString === "any") {
        protocol = Protocol.Any;
    }
    else if (protocolString === "http") {
        protocol = Protocol.Http;
    }
    else if (protocolString === "ws") {
        protocol = Protocol.Ws;
    }
    else {
        throw new Error("Invalid Protocol \"" + protocolString + "\". Please choose \"any\", \"http\", or \"ws\"");
    }
    return protocol;
}
function isMatch(url, urls) {
    if (!urls || urls.length)
        return true;
    try {
        urls = urls.replace("[", "");
        urls = urls.replace("]", "");
        urls = urls.replace(/"/g, "");
        urls = urls.replace(/'/g, "");
        urls = urls.replace(/ /g, "");
        var split = urls.split(",");
        for (var _i = 0, split_1 = split; _i < split_1.length; _i++) {
            var urlRegex = split_1[_i];
            if (minimatch_1.default(url, urlRegex))
                return true;
        }
        return false;
    }
    catch (err) {
        throw new Error("Invalid urls \"" + urls + "\". Must be of format \"[\"url1\", \"url2\"]\"");
    }
}
function sniff(protocol, msg) {
    var _isMatch = isMatch(msg.srcUrl, "[\"http://www.gpokr.com*\"]") &&
        isMatch(msg.targetUrl, "[\"http://www.gpokr.com/api/gpokr/table/events*\"]");
    if (_isMatch)
        console.log(msg.srcUrl + " received " + protocol + " message from " + msg.targetUrl + ":\n" + msg.data);
}
console.log("Successfully loaded!");
console.log("Open a new tab to start sniffing traffic.");
var protocol = getProtocol();
if (protocol === Protocol.Any || protocol === Protocol.Http) {
    sniff_1.sniffHttp(function (msg) { return sniff("http", msg); });
}
if (protocol === Protocol.Any || protocol === Protocol.Ws) {
    sniff_1.sniffWs(function (msg) { return sniff("ws", msg); });
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/background.ts");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kZWJ1Z2dlci8uL25vZGVfbW9kdWxlcy9AdGdpYXJkaW5hL3NuaWZmL2Rpc3QvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZGVidWdnZXIvLi9ub2RlX21vZHVsZXMvQHRnaWFyZGluYS9zbmlmZi9kaXN0L3NuaWZmLWh0dHAvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZGVidWdnZXIvLi9ub2RlX21vZHVsZXMvQHRnaWFyZGluYS9zbmlmZi9kaXN0L3NuaWZmLXdzL2JhY2tncm91bmQuanMiLCJ3ZWJwYWNrOi8vZGVidWdnZXIvLi9ub2RlX21vZHVsZXMvQHRnaWFyZGluYS9zbmlmZi9kaXN0L3NuaWZmLXdzL2NvbnRlbnQuanMiLCJ3ZWJwYWNrOi8vZGVidWdnZXIvLi9ub2RlX21vZHVsZXMvQHRnaWFyZGluYS9zbmlmZi9kaXN0L3NuaWZmLXdzL2luZGV4LmpzIiwid2VicGFjazovL2RlYnVnZ2VyLy4vbm9kZV9tb2R1bGVzL2JhbGFuY2VkLW1hdGNoL2luZGV4LmpzIiwid2VicGFjazovL2RlYnVnZ2VyLy4vbm9kZV9tb2R1bGVzL2JyYWNlLWV4cGFuc2lvbi9pbmRleC5qcyIsIndlYnBhY2s6Ly9kZWJ1Z2dlci8uL25vZGVfbW9kdWxlcy9jb25jYXQtbWFwL2luZGV4LmpzIiwid2VicGFjazovL2RlYnVnZ2VyLy4vbm9kZV9tb2R1bGVzL21pbmltYXRjaC9taW5pbWF0Y2guanMiLCJ3ZWJwYWNrOi8vZGVidWdnZXIvLi9ub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwid2VicGFjazovL2RlYnVnZ2VyLy4vc3JjL2JhY2tncm91bmQudHMiLCJ3ZWJwYWNrOi8vZGVidWdnZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZGVidWdnZXIvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQWE7QUFDYiw4Q0FBNkMsQ0FBQyxjQUFjLEVBQUM7QUFDN0QsZUFB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QTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxLQUFLO0FBQ0wsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLLElBQUk7QUFDVCxLQUFLLEdBQUc7QUFDUixLQUFLLEtBQUs7QUFDVixLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2YsS0FBSyxJQUFJLEVBQUUsSUFBSTtBQUNmO0FBQ0E7QUFDQSxLQUFLLElBQUksT0FBTyxJQUFJO0FBQ3BCLEtBQUssRUFBRSxPQUFPLEVBQUU7QUFDaEI7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFzQixJQUFJO0FBQzFCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsSUFBSTtBQUN4QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7QUFDTCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxLQUFLO0FBQ0wsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLElBQUk7QUFDdkM7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLEVBQUUsRUFBRSxLQUFLO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxRQUFRO0FBQ2hEOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLHNCQUFzQjtBQUNyQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSw2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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxxQkFBcUI7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1Qyw2QkFBb0I7QUFDM0QsK0JBQStCLG9EQUF1QjtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQywyQkFBMkIsRUFBRTtBQUNuRTtBQUNBO0FBQ0Esb0NBQW9DLHlCQUF5QixFQUFFO0FBQy9EOzs7Ozs7O1VDakVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7VUNyQkE7VUFDQTtVQUNBO1VBQ0EiLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5zbmlmZldzID0gZXhwb3J0cy5pbml0V3NTbmlmZmVyID0gZXhwb3J0cy5zbmlmZkh0dHAgPSB2b2lkIDA7XG52YXIgc25pZmZfaHR0cF8xID0gcmVxdWlyZShcIi4vc25pZmYtaHR0cFwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInNuaWZmSHR0cFwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBzbmlmZl9odHRwXzEuc25pZmZIdHRwO1xuICB9LFxufSk7XG52YXIgc25pZmZfd3NfMSA9IHJlcXVpcmUoXCIuL3NuaWZmLXdzXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiaW5pdFdzU25pZmZlclwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBzbmlmZl93c18xLmluaXRXc1NuaWZmZXI7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInNuaWZmV3NcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gc25pZmZfd3NfMS5zbmlmZldzO1xuICB9LFxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc25pZmZIdHRwID0gdm9pZCAwO1xuZnVuY3Rpb24gc25pZmZIdHRwKGNhbGxiYWNrKSB7XG4gIGJyb3dzZXIud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QuYWRkTGlzdGVuZXIoXG4gICAgZnVuY3Rpb24gKGRldGFpbHMpIHtcbiAgICAgIHZhciBmaWx0ZXIgPSBicm93c2VyLndlYlJlcXVlc3QuZmlsdGVyUmVzcG9uc2VEYXRhKGRldGFpbHMucmVxdWVzdElkKTtcbiAgICAgIHZhciBkZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKFwidXRmLThcIik7XG4gICAgICB2YXIgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgICAgdmFyIGRhdGEgPSBbXTtcbiAgICAgIGZpbHRlci5vbmRhdGEgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZGF0YS5wdXNoKGRlY29kZXIuZGVjb2RlKGV2ZW50LmRhdGEsIHsgc3RyZWFtOiB0cnVlIH0pKTtcbiAgICAgIH07XG4gICAgICBmaWx0ZXIub25zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGRhdGEucHVzaChkZWNvZGVyLmRlY29kZSgpKTtcbiAgICAgICAgICB2YXIganNvbiA9IGRhdGEuam9pbihcIlwiKTtcbiAgICAgICAgICBjYWxsYmFjayh7XG4gICAgICAgICAgICBkYXRhOiBqc29uLFxuICAgICAgICAgICAgc3JjVXJsOiBkZXRhaWxzLm9yaWdpblVybCxcbiAgICAgICAgICAgIHRhcmdldFVybDogZGV0YWlscy51cmwsXG4gICAgICAgICAgICB0YWJJZDogZGV0YWlscy50YWJJZCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBmaWx0ZXIud3JpdGUoZW5jb2Rlci5lbmNvZGUoanNvbikpO1xuICAgICAgICAgIGZpbHRlci5jbG9zZSgpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInNuaWZmSHR0cCB0aHJlIFwiICsgZXJyKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9LFxuICAgIHsgdXJsczogW1wiPGFsbF91cmxzPlwiXSwgdHlwZXM6IFtcInhtbGh0dHByZXF1ZXN0XCJdIH0sXG4gICAgW1wiYmxvY2tpbmdcIl1cbiAgKTtcbn1cbmV4cG9ydHMuc25pZmZIdHRwID0gc25pZmZIdHRwO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hc3NpZ24gPVxuICAodGhpcyAmJiB0aGlzLl9fYXNzaWduKSB8fFxuICBmdW5jdGlvbiAoKSB7XG4gICAgX19hc3NpZ24gPVxuICAgICAgT2JqZWN0LmFzc2lnbiB8fFxuICAgICAgZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICBmb3IgKHZhciBwIGluIHMpXG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICAgIH07XG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgY2hyb21lLnJ1bnRpbWUub25Db25uZWN0LmFkZExpc3RlbmVyKGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgaWYgKHBvcnQubmFtZSA9PT0gXCJnZG9ua2V5LXdzLXNuaWZmZXJcIikge1xuICAgICAgcG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKG1zZywgbWV0YSkge1xuICAgICAgICBtZXRhLnNlbmRlciA9IG1ldGEuc2VuZGVyO1xuICAgICAgICBpZiAoIW1ldGEuc2VuZGVyLnRhYilcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbmNvcnJlY3RseSBzZXQgdGFicyBwZXJtaXNzaW9uXCIpO1xuICAgICAgICBjYWxsYmFjayhfX2Fzc2lnbih7IHRhYklkOiBtZXRhLnNlbmRlci50YWIuaWQgfSwgbXNnKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy85NTE1NzA0L2luc2VydC1jb2RlLWludG8tdGhlLXBhZ2UtY29udGV4dC11c2luZy1hLWNvbnRlbnQtc2NyaXB0XG4gKi9cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIEB0cy1ub2NoZWNrXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzbmlmZmVyID1cbiAgICBcIihcIiArXG4gICAgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIE9nV2ViU29ja2V0ID0gd2luZG93LldlYlNvY2tldDtcbiAgICAgIHZhciBjYWxsV2ViU29ja2V0ID0gT2dXZWJTb2NrZXQuYXBwbHkuYmluZChPZ1dlYlNvY2tldCk7XG4gICAgICB2YXIgd3NBZGRMaXN0ZW5lciA9IE9nV2ViU29ja2V0LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyO1xuICAgICAgd3NBZGRMaXN0ZW5lciA9IHdzQWRkTGlzdGVuZXIuY2FsbC5iaW5kKHdzQWRkTGlzdGVuZXIpO1xuICAgICAgd2luZG93LldlYlNvY2tldCA9IGZ1bmN0aW9uIFdlYlNvY2tldCh1cmwsIHByb3RvY29scykge1xuICAgICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDI7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgIGFyZ3NbX2kgLSAyXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHdzO1xuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgV2ViU29ja2V0KSkge1xuICAgICAgICAgIHdzID0gY2FsbFdlYlNvY2tldCh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgd3MgPSBuZXcgT2dXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICB3cyA9IG5ldyBPZ1dlYlNvY2tldCh1cmwsIHByb3RvY29scyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd3MgPSBuZXcgT2dXZWJTb2NrZXQoKTtcbiAgICAgICAgfVxuICAgICAgICB3c0FkZExpc3RlbmVyKHdzLCBcIm1lc3NhZ2VcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIGlkOiBcImdkb25rZXktaW5qZWN0ZWQtd3Mtc25pZmZlclwiLFxuICAgICAgICAgICAganNvbjogZXZlbnQuZGF0YSxcbiAgICAgICAgICAgIHRhcmdldFVybDogdXJsLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHdzO1xuICAgICAgfS5iaW5kKCk7XG4gICAgICB3aW5kb3cuV2ViU29ja2V0LnByb3RvdHlwZSA9IE9nV2ViU29ja2V0LnByb3RvdHlwZTtcbiAgICAgIHdpbmRvdy5XZWJTb2NrZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gd2luZG93LldlYlNvY2tldDtcbiAgICAgIHZhciB3c1NlbmQgPSBPZ1dlYlNvY2tldC5wcm90b3R5cGUuc2VuZDtcbiAgICAgIHdzU2VuZCA9IHdzU2VuZC5hcHBseS5iaW5kKHdzU2VuZCk7XG4gICAgICBPZ1dlYlNvY2tldC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdzU2VuZCh0aGlzLCBhcmdzKTtcbiAgICAgIH07XG4gICAgfSArXG4gICAgXCIpKClcIjtcbiAgdmFyIHBvcnQgPSBicm93c2VyLnJ1bnRpbWUuY29ubmVjdCh7IG5hbWU6IFwiZ2RvbmtleS13cy1zbmlmZmVyXCIgfSk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQuZGF0YS5pZCA9PT0gXCJnZG9ua2V5LWluamVjdGVkLXdzLXNuaWZmZXJcIikge1xuICAgICAgcG9ydC5wb3N0TWVzc2FnZSh7XG4gICAgICAgIGRhdGE6IGV2ZW50LmRhdGEuanNvbixcbiAgICAgICAgc3JjVXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgdGFyZ2V0VXJsOiBldmVudC5kYXRhLnRhcmdldFVybCxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG4gIHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICBzY3JpcHQudGV4dENvbnRlbnQgPSBzbmlmZmVyO1xuICAoZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gIHNjcmlwdC5yZW1vdmUoKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPVxuICAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHxcbiAgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiBtb2QgJiYgbW9kLl9fZXNNb2R1bGUgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xuICB9O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5pbml0V3NTbmlmZmVyID0gZXhwb3J0cy5zbmlmZldzID0gdm9pZCAwO1xudmFyIGJhY2tncm91bmRfMSA9IHJlcXVpcmUoXCIuL2JhY2tncm91bmRcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJzbmlmZldzXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9faW1wb3J0RGVmYXVsdChiYWNrZ3JvdW5kXzEpLmRlZmF1bHQ7XG4gIH0sXG59KTtcbnZhciBjb250ZW50XzEgPSByZXF1aXJlKFwiLi9jb250ZW50XCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiaW5pdFdzU25pZmZlclwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfX2ltcG9ydERlZmF1bHQoY29udGVudF8xKS5kZWZhdWx0O1xuICB9LFxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGJhbGFuY2VkO1xuZnVuY3Rpb24gYmFsYW5jZWQoYSwgYiwgc3RyKSB7XG4gIGlmIChhIGluc3RhbmNlb2YgUmVnRXhwKSBhID0gbWF5YmVNYXRjaChhLCBzdHIpO1xuICBpZiAoYiBpbnN0YW5jZW9mIFJlZ0V4cCkgYiA9IG1heWJlTWF0Y2goYiwgc3RyKTtcblxuICB2YXIgciA9IHJhbmdlKGEsIGIsIHN0cik7XG5cbiAgcmV0dXJuIHIgJiYge1xuICAgIHN0YXJ0OiByWzBdLFxuICAgIGVuZDogclsxXSxcbiAgICBwcmU6IHN0ci5zbGljZSgwLCByWzBdKSxcbiAgICBib2R5OiBzdHIuc2xpY2UoclswXSArIGEubGVuZ3RoLCByWzFdKSxcbiAgICBwb3N0OiBzdHIuc2xpY2UoclsxXSArIGIubGVuZ3RoKVxuICB9O1xufVxuXG5mdW5jdGlvbiBtYXliZU1hdGNoKHJlZywgc3RyKSB7XG4gIHZhciBtID0gc3RyLm1hdGNoKHJlZyk7XG4gIHJldHVybiBtID8gbVswXSA6IG51bGw7XG59XG5cbmJhbGFuY2VkLnJhbmdlID0gcmFuZ2U7XG5mdW5jdGlvbiByYW5nZShhLCBiLCBzdHIpIHtcbiAgdmFyIGJlZ3MsIGJlZywgbGVmdCwgcmlnaHQsIHJlc3VsdDtcbiAgdmFyIGFpID0gc3RyLmluZGV4T2YoYSk7XG4gIHZhciBiaSA9IHN0ci5pbmRleE9mKGIsIGFpICsgMSk7XG4gIHZhciBpID0gYWk7XG5cbiAgaWYgKGFpID49IDAgJiYgYmkgPiAwKSB7XG4gICAgYmVncyA9IFtdO1xuICAgIGxlZnQgPSBzdHIubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGkgPj0gMCAmJiAhcmVzdWx0KSB7XG4gICAgICBpZiAoaSA9PSBhaSkge1xuICAgICAgICBiZWdzLnB1c2goaSk7XG4gICAgICAgIGFpID0gc3RyLmluZGV4T2YoYSwgaSArIDEpO1xuICAgICAgfSBlbHNlIGlmIChiZWdzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIHJlc3VsdCA9IFsgYmVncy5wb3AoKSwgYmkgXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJlZyA9IGJlZ3MucG9wKCk7XG4gICAgICAgIGlmIChiZWcgPCBsZWZ0KSB7XG4gICAgICAgICAgbGVmdCA9IGJlZztcbiAgICAgICAgICByaWdodCA9IGJpO1xuICAgICAgICB9XG5cbiAgICAgICAgYmkgPSBzdHIuaW5kZXhPZihiLCBpICsgMSk7XG4gICAgICB9XG5cbiAgICAgIGkgPSBhaSA8IGJpICYmIGFpID49IDAgPyBhaSA6IGJpO1xuICAgIH1cblxuICAgIGlmIChiZWdzLmxlbmd0aCkge1xuICAgICAgcmVzdWx0ID0gWyBsZWZ0LCByaWdodCBdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iLCJ2YXIgY29uY2F0TWFwID0gcmVxdWlyZSgnY29uY2F0LW1hcCcpO1xudmFyIGJhbGFuY2VkID0gcmVxdWlyZSgnYmFsYW5jZWQtbWF0Y2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBhbmRUb3A7XG5cbnZhciBlc2NTbGFzaCA9ICdcXDBTTEFTSCcrTWF0aC5yYW5kb20oKSsnXFwwJztcbnZhciBlc2NPcGVuID0gJ1xcME9QRU4nK01hdGgucmFuZG9tKCkrJ1xcMCc7XG52YXIgZXNjQ2xvc2UgPSAnXFwwQ0xPU0UnK01hdGgucmFuZG9tKCkrJ1xcMCc7XG52YXIgZXNjQ29tbWEgPSAnXFwwQ09NTUEnK01hdGgucmFuZG9tKCkrJ1xcMCc7XG52YXIgZXNjUGVyaW9kID0gJ1xcMFBFUklPRCcrTWF0aC5yYW5kb20oKSsnXFwwJztcblxuZnVuY3Rpb24gbnVtZXJpYyhzdHIpIHtcbiAgcmV0dXJuIHBhcnNlSW50KHN0ciwgMTApID09IHN0clxuICAgID8gcGFyc2VJbnQoc3RyLCAxMClcbiAgICA6IHN0ci5jaGFyQ29kZUF0KDApO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVCcmFjZXMoc3RyKSB7XG4gIHJldHVybiBzdHIuc3BsaXQoJ1xcXFxcXFxcJykuam9pbihlc2NTbGFzaClcbiAgICAgICAgICAgIC5zcGxpdCgnXFxcXHsnKS5qb2luKGVzY09wZW4pXG4gICAgICAgICAgICAuc3BsaXQoJ1xcXFx9Jykuam9pbihlc2NDbG9zZSlcbiAgICAgICAgICAgIC5zcGxpdCgnXFxcXCwnKS5qb2luKGVzY0NvbW1hKVxuICAgICAgICAgICAgLnNwbGl0KCdcXFxcLicpLmpvaW4oZXNjUGVyaW9kKTtcbn1cblxuZnVuY3Rpb24gdW5lc2NhcGVCcmFjZXMoc3RyKSB7XG4gIHJldHVybiBzdHIuc3BsaXQoZXNjU2xhc2gpLmpvaW4oJ1xcXFwnKVxuICAgICAgICAgICAgLnNwbGl0KGVzY09wZW4pLmpvaW4oJ3snKVxuICAgICAgICAgICAgLnNwbGl0KGVzY0Nsb3NlKS5qb2luKCd9JylcbiAgICAgICAgICAgIC5zcGxpdChlc2NDb21tYSkuam9pbignLCcpXG4gICAgICAgICAgICAuc3BsaXQoZXNjUGVyaW9kKS5qb2luKCcuJyk7XG59XG5cblxuLy8gQmFzaWNhbGx5IGp1c3Qgc3RyLnNwbGl0KFwiLFwiKSwgYnV0IGhhbmRsaW5nIGNhc2VzXG4vLyB3aGVyZSB3ZSBoYXZlIG5lc3RlZCBicmFjZWQgc2VjdGlvbnMsIHdoaWNoIHNob3VsZCBiZVxuLy8gdHJlYXRlZCBhcyBpbmRpdmlkdWFsIG1lbWJlcnMsIGxpa2Uge2Ese2IsY30sZH1cbmZ1bmN0aW9uIHBhcnNlQ29tbWFQYXJ0cyhzdHIpIHtcbiAgaWYgKCFzdHIpXG4gICAgcmV0dXJuIFsnJ107XG5cbiAgdmFyIHBhcnRzID0gW107XG4gIHZhciBtID0gYmFsYW5jZWQoJ3snLCAnfScsIHN0cik7XG5cbiAgaWYgKCFtKVxuICAgIHJldHVybiBzdHIuc3BsaXQoJywnKTtcblxuICB2YXIgcHJlID0gbS5wcmU7XG4gIHZhciBib2R5ID0gbS5ib2R5O1xuICB2YXIgcG9zdCA9IG0ucG9zdDtcbiAgdmFyIHAgPSBwcmUuc3BsaXQoJywnKTtcblxuICBwW3AubGVuZ3RoLTFdICs9ICd7JyArIGJvZHkgKyAnfSc7XG4gIHZhciBwb3N0UGFydHMgPSBwYXJzZUNvbW1hUGFydHMocG9zdCk7XG4gIGlmIChwb3N0Lmxlbmd0aCkge1xuICAgIHBbcC5sZW5ndGgtMV0gKz0gcG9zdFBhcnRzLnNoaWZ0KCk7XG4gICAgcC5wdXNoLmFwcGx5KHAsIHBvc3RQYXJ0cyk7XG4gIH1cblxuICBwYXJ0cy5wdXNoLmFwcGx5KHBhcnRzLCBwKTtcblxuICByZXR1cm4gcGFydHM7XG59XG5cbmZ1bmN0aW9uIGV4cGFuZFRvcChzdHIpIHtcbiAgaWYgKCFzdHIpXG4gICAgcmV0dXJuIFtdO1xuXG4gIC8vIEkgZG9uJ3Qga25vdyB3aHkgQmFzaCA0LjMgZG9lcyB0aGlzLCBidXQgaXQgZG9lcy5cbiAgLy8gQW55dGhpbmcgc3RhcnRpbmcgd2l0aCB7fSB3aWxsIGhhdmUgdGhlIGZpcnN0IHR3byBieXRlcyBwcmVzZXJ2ZWRcbiAgLy8gYnV0ICpvbmx5KiBhdCB0aGUgdG9wIGxldmVsLCBzbyB7fSxhfWIgd2lsbCBub3QgZXhwYW5kIHRvIGFueXRoaW5nLFxuICAvLyBidXQgYXt9LGJ9YyB3aWxsIGJlIGV4cGFuZGVkIHRvIFthfWMsYWJjXS5cbiAgLy8gT25lIGNvdWxkIGFyZ3VlIHRoYXQgdGhpcyBpcyBhIGJ1ZyBpbiBCYXNoLCBidXQgc2luY2UgdGhlIGdvYWwgb2ZcbiAgLy8gdGhpcyBtb2R1bGUgaXMgdG8gbWF0Y2ggQmFzaCdzIHJ1bGVzLCB3ZSBlc2NhcGUgYSBsZWFkaW5nIHt9XG4gIGlmIChzdHIuc3Vic3RyKDAsIDIpID09PSAne30nKSB7XG4gICAgc3RyID0gJ1xcXFx7XFxcXH0nICsgc3RyLnN1YnN0cigyKTtcbiAgfVxuXG4gIHJldHVybiBleHBhbmQoZXNjYXBlQnJhY2VzKHN0ciksIHRydWUpLm1hcCh1bmVzY2FwZUJyYWNlcyk7XG59XG5cbmZ1bmN0aW9uIGlkZW50aXR5KGUpIHtcbiAgcmV0dXJuIGU7XG59XG5cbmZ1bmN0aW9uIGVtYnJhY2Uoc3RyKSB7XG4gIHJldHVybiAneycgKyBzdHIgKyAnfSc7XG59XG5mdW5jdGlvbiBpc1BhZGRlZChlbCkge1xuICByZXR1cm4gL14tPzBcXGQvLnRlc3QoZWwpO1xufVxuXG5mdW5jdGlvbiBsdGUoaSwgeSkge1xuICByZXR1cm4gaSA8PSB5O1xufVxuZnVuY3Rpb24gZ3RlKGksIHkpIHtcbiAgcmV0dXJuIGkgPj0geTtcbn1cblxuZnVuY3Rpb24gZXhwYW5kKHN0ciwgaXNUb3ApIHtcbiAgdmFyIGV4cGFuc2lvbnMgPSBbXTtcblxuICB2YXIgbSA9IGJhbGFuY2VkKCd7JywgJ30nLCBzdHIpO1xuICBpZiAoIW0gfHwgL1xcJCQvLnRlc3QobS5wcmUpKSByZXR1cm4gW3N0cl07XG5cbiAgdmFyIGlzTnVtZXJpY1NlcXVlbmNlID0gL14tP1xcZCtcXC5cXC4tP1xcZCsoPzpcXC5cXC4tP1xcZCspPyQvLnRlc3QobS5ib2R5KTtcbiAgdmFyIGlzQWxwaGFTZXF1ZW5jZSA9IC9eW2EtekEtWl1cXC5cXC5bYS16QS1aXSg/OlxcLlxcLi0/XFxkKyk/JC8udGVzdChtLmJvZHkpO1xuICB2YXIgaXNTZXF1ZW5jZSA9IGlzTnVtZXJpY1NlcXVlbmNlIHx8IGlzQWxwaGFTZXF1ZW5jZTtcbiAgdmFyIGlzT3B0aW9ucyA9IG0uYm9keS5pbmRleE9mKCcsJykgPj0gMDtcbiAgaWYgKCFpc1NlcXVlbmNlICYmICFpc09wdGlvbnMpIHtcbiAgICAvLyB7YX0sYn1cbiAgICBpZiAobS5wb3N0Lm1hdGNoKC8sLipcXH0vKSkge1xuICAgICAgc3RyID0gbS5wcmUgKyAneycgKyBtLmJvZHkgKyBlc2NDbG9zZSArIG0ucG9zdDtcbiAgICAgIHJldHVybiBleHBhbmQoc3RyKTtcbiAgICB9XG4gICAgcmV0dXJuIFtzdHJdO1xuICB9XG5cbiAgdmFyIG47XG4gIGlmIChpc1NlcXVlbmNlKSB7XG4gICAgbiA9IG0uYm9keS5zcGxpdCgvXFwuXFwuLyk7XG4gIH0gZWxzZSB7XG4gICAgbiA9IHBhcnNlQ29tbWFQYXJ0cyhtLmJvZHkpO1xuICAgIGlmIChuLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy8geHt7YSxifX15ID09PiB4e2F9eSB4e2J9eVxuICAgICAgbiA9IGV4cGFuZChuWzBdLCBmYWxzZSkubWFwKGVtYnJhY2UpO1xuICAgICAgaWYgKG4ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHZhciBwb3N0ID0gbS5wb3N0Lmxlbmd0aFxuICAgICAgICAgID8gZXhwYW5kKG0ucG9zdCwgZmFsc2UpXG4gICAgICAgICAgOiBbJyddO1xuICAgICAgICByZXR1cm4gcG9zdC5tYXAoZnVuY3Rpb24ocCkge1xuICAgICAgICAgIHJldHVybiBtLnByZSArIG5bMF0gKyBwO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBhdCB0aGlzIHBvaW50LCBuIGlzIHRoZSBwYXJ0cywgYW5kIHdlIGtub3cgaXQncyBub3QgYSBjb21tYSBzZXRcbiAgLy8gd2l0aCBhIHNpbmdsZSBlbnRyeS5cblxuICAvLyBubyBuZWVkIHRvIGV4cGFuZCBwcmUsIHNpbmNlIGl0IGlzIGd1YXJhbnRlZWQgdG8gYmUgZnJlZSBvZiBicmFjZS1zZXRzXG4gIHZhciBwcmUgPSBtLnByZTtcbiAgdmFyIHBvc3QgPSBtLnBvc3QubGVuZ3RoXG4gICAgPyBleHBhbmQobS5wb3N0LCBmYWxzZSlcbiAgICA6IFsnJ107XG5cbiAgdmFyIE47XG5cbiAgaWYgKGlzU2VxdWVuY2UpIHtcbiAgICB2YXIgeCA9IG51bWVyaWMoblswXSk7XG4gICAgdmFyIHkgPSBudW1lcmljKG5bMV0pO1xuICAgIHZhciB3aWR0aCA9IE1hdGgubWF4KG5bMF0ubGVuZ3RoLCBuWzFdLmxlbmd0aClcbiAgICB2YXIgaW5jciA9IG4ubGVuZ3RoID09IDNcbiAgICAgID8gTWF0aC5hYnMobnVtZXJpYyhuWzJdKSlcbiAgICAgIDogMTtcbiAgICB2YXIgdGVzdCA9IGx0ZTtcbiAgICB2YXIgcmV2ZXJzZSA9IHkgPCB4O1xuICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICBpbmNyICo9IC0xO1xuICAgICAgdGVzdCA9IGd0ZTtcbiAgICB9XG4gICAgdmFyIHBhZCA9IG4uc29tZShpc1BhZGRlZCk7XG5cbiAgICBOID0gW107XG5cbiAgICBmb3IgKHZhciBpID0geDsgdGVzdChpLCB5KTsgaSArPSBpbmNyKSB7XG4gICAgICB2YXIgYztcbiAgICAgIGlmIChpc0FscGhhU2VxdWVuY2UpIHtcbiAgICAgICAgYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoaSk7XG4gICAgICAgIGlmIChjID09PSAnXFxcXCcpXG4gICAgICAgICAgYyA9ICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYyA9IFN0cmluZyhpKTtcbiAgICAgICAgaWYgKHBhZCkge1xuICAgICAgICAgIHZhciBuZWVkID0gd2lkdGggLSBjLmxlbmd0aDtcbiAgICAgICAgICBpZiAobmVlZCA+IDApIHtcbiAgICAgICAgICAgIHZhciB6ID0gbmV3IEFycmF5KG5lZWQgKyAxKS5qb2luKCcwJyk7XG4gICAgICAgICAgICBpZiAoaSA8IDApXG4gICAgICAgICAgICAgIGMgPSAnLScgKyB6ICsgYy5zbGljZSgxKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgYyA9IHogKyBjO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgTi5wdXNoKGMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBOID0gY29uY2F0TWFwKG4sIGZ1bmN0aW9uKGVsKSB7IHJldHVybiBleHBhbmQoZWwsIGZhbHNlKSB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGogPSAwOyBqIDwgTi5sZW5ndGg7IGorKykge1xuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgcG9zdC5sZW5ndGg7IGsrKykge1xuICAgICAgdmFyIGV4cGFuc2lvbiA9IHByZSArIE5bal0gKyBwb3N0W2tdO1xuICAgICAgaWYgKCFpc1RvcCB8fCBpc1NlcXVlbmNlIHx8IGV4cGFuc2lvbilcbiAgICAgICAgZXhwYW5zaW9ucy5wdXNoKGV4cGFuc2lvbik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGV4cGFuc2lvbnM7XG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHhzLCBmbikge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB4ID0gZm4oeHNbaV0sIGkpO1xuICAgICAgICBpZiAoaXNBcnJheSh4KSkgcmVzLnB1c2guYXBwbHkocmVzLCB4KTtcbiAgICAgICAgZWxzZSByZXMucHVzaCh4KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IG1pbmltYXRjaFxubWluaW1hdGNoLk1pbmltYXRjaCA9IE1pbmltYXRjaFxuXG52YXIgcGF0aCA9IHsgc2VwOiAnLycgfVxudHJ5IHtcbiAgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxufSBjYXRjaCAoZXIpIHt9XG5cbnZhciBHTE9CU1RBUiA9IG1pbmltYXRjaC5HTE9CU1RBUiA9IE1pbmltYXRjaC5HTE9CU1RBUiA9IHt9XG52YXIgZXhwYW5kID0gcmVxdWlyZSgnYnJhY2UtZXhwYW5zaW9uJylcblxudmFyIHBsVHlwZXMgPSB7XG4gICchJzogeyBvcGVuOiAnKD86KD8hKD86JywgY2xvc2U6ICcpKVteL10qPyknfSxcbiAgJz8nOiB7IG9wZW46ICcoPzonLCBjbG9zZTogJyk/JyB9LFxuICAnKyc6IHsgb3BlbjogJyg/OicsIGNsb3NlOiAnKSsnIH0sXG4gICcqJzogeyBvcGVuOiAnKD86JywgY2xvc2U6ICcpKicgfSxcbiAgJ0AnOiB7IG9wZW46ICcoPzonLCBjbG9zZTogJyknIH1cbn1cblxuLy8gYW55IHNpbmdsZSB0aGluZyBvdGhlciB0aGFuIC9cbi8vIGRvbid0IG5lZWQgdG8gZXNjYXBlIC8gd2hlbiB1c2luZyBuZXcgUmVnRXhwKClcbnZhciBxbWFyayA9ICdbXi9dJ1xuXG4vLyAqID0+IGFueSBudW1iZXIgb2YgY2hhcmFjdGVyc1xudmFyIHN0YXIgPSBxbWFyayArICcqPydcblxuLy8gKiogd2hlbiBkb3RzIGFyZSBhbGxvd2VkLiAgQW55dGhpbmcgZ29lcywgZXhjZXB0IC4uIGFuZCAuXG4vLyBub3QgKF4gb3IgLyBmb2xsb3dlZCBieSBvbmUgb3IgdHdvIGRvdHMgZm9sbG93ZWQgYnkgJCBvciAvKSxcbi8vIGZvbGxvd2VkIGJ5IGFueXRoaW5nLCBhbnkgbnVtYmVyIG9mIHRpbWVzLlxudmFyIHR3b1N0YXJEb3QgPSAnKD86KD8hKD86XFxcXFxcL3xeKSg/OlxcXFwuezEsMn0pKCR8XFxcXFxcLykpLikqPydcblxuLy8gbm90IGEgXiBvciAvIGZvbGxvd2VkIGJ5IGEgZG90LFxuLy8gZm9sbG93ZWQgYnkgYW55dGhpbmcsIGFueSBudW1iZXIgb2YgdGltZXMuXG52YXIgdHdvU3Rhck5vRG90ID0gJyg/Oig/ISg/OlxcXFxcXC98XilcXFxcLikuKSo/J1xuXG4vLyBjaGFyYWN0ZXJzIHRoYXQgbmVlZCB0byBiZSBlc2NhcGVkIGluIFJlZ0V4cC5cbnZhciByZVNwZWNpYWxzID0gY2hhclNldCgnKCkuKnt9Kz9bXV4kXFxcXCEnKVxuXG4vLyBcImFiY1wiIC0+IHsgYTp0cnVlLCBiOnRydWUsIGM6dHJ1ZSB9XG5mdW5jdGlvbiBjaGFyU2V0IChzKSB7XG4gIHJldHVybiBzLnNwbGl0KCcnKS5yZWR1Y2UoZnVuY3Rpb24gKHNldCwgYykge1xuICAgIHNldFtjXSA9IHRydWVcbiAgICByZXR1cm4gc2V0XG4gIH0sIHt9KVxufVxuXG4vLyBub3JtYWxpemVzIHNsYXNoZXMuXG52YXIgc2xhc2hTcGxpdCA9IC9cXC8rL1xuXG5taW5pbWF0Y2guZmlsdGVyID0gZmlsdGVyXG5mdW5jdGlvbiBmaWx0ZXIgKHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgcmV0dXJuIGZ1bmN0aW9uIChwLCBpLCBsaXN0KSB7XG4gICAgcmV0dXJuIG1pbmltYXRjaChwLCBwYXR0ZXJuLCBvcHRpb25zKVxuICB9XG59XG5cbmZ1bmN0aW9uIGV4dCAoYSwgYikge1xuICBhID0gYSB8fCB7fVxuICBiID0gYiB8fCB7fVxuICB2YXIgdCA9IHt9XG4gIE9iamVjdC5rZXlzKGIpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICB0W2tdID0gYltrXVxuICB9KVxuICBPYmplY3Qua2V5cyhhKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgdFtrXSA9IGFba11cbiAgfSlcbiAgcmV0dXJuIHRcbn1cblxubWluaW1hdGNoLmRlZmF1bHRzID0gZnVuY3Rpb24gKGRlZikge1xuICBpZiAoIWRlZiB8fCAhT2JqZWN0LmtleXMoZGVmKS5sZW5ndGgpIHJldHVybiBtaW5pbWF0Y2hcblxuICB2YXIgb3JpZyA9IG1pbmltYXRjaFxuXG4gIHZhciBtID0gZnVuY3Rpb24gbWluaW1hdGNoIChwLCBwYXR0ZXJuLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9yaWcubWluaW1hdGNoKHAsIHBhdHRlcm4sIGV4dChkZWYsIG9wdGlvbnMpKVxuICB9XG5cbiAgbS5NaW5pbWF0Y2ggPSBmdW5jdGlvbiBNaW5pbWF0Y2ggKHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IG9yaWcuTWluaW1hdGNoKHBhdHRlcm4sIGV4dChkZWYsIG9wdGlvbnMpKVxuICB9XG5cbiAgcmV0dXJuIG1cbn1cblxuTWluaW1hdGNoLmRlZmF1bHRzID0gZnVuY3Rpb24gKGRlZikge1xuICBpZiAoIWRlZiB8fCAhT2JqZWN0LmtleXMoZGVmKS5sZW5ndGgpIHJldHVybiBNaW5pbWF0Y2hcbiAgcmV0dXJuIG1pbmltYXRjaC5kZWZhdWx0cyhkZWYpLk1pbmltYXRjaFxufVxuXG5mdW5jdGlvbiBtaW5pbWF0Y2ggKHAsIHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBwYXR0ZXJuICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2dsb2IgcGF0dGVybiBzdHJpbmcgcmVxdWlyZWQnKVxuICB9XG5cbiAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge31cblxuICAvLyBzaG9ydGN1dDogY29tbWVudHMgbWF0Y2ggbm90aGluZy5cbiAgaWYgKCFvcHRpb25zLm5vY29tbWVudCAmJiBwYXR0ZXJuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyBcIlwiIG9ubHkgbWF0Y2hlcyBcIlwiXG4gIGlmIChwYXR0ZXJuLnRyaW0oKSA9PT0gJycpIHJldHVybiBwID09PSAnJ1xuXG4gIHJldHVybiBuZXcgTWluaW1hdGNoKHBhdHRlcm4sIG9wdGlvbnMpLm1hdGNoKHApXG59XG5cbmZ1bmN0aW9uIE1pbmltYXRjaCAocGF0dGVybiwgb3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgTWluaW1hdGNoKSkge1xuICAgIHJldHVybiBuZXcgTWluaW1hdGNoKHBhdHRlcm4sIG9wdGlvbnMpXG4gIH1cblxuICBpZiAodHlwZW9mIHBhdHRlcm4gIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZ2xvYiBwYXR0ZXJuIHN0cmluZyByZXF1aXJlZCcpXG4gIH1cblxuICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fVxuICBwYXR0ZXJuID0gcGF0dGVybi50cmltKClcblxuICAvLyB3aW5kb3dzIHN1cHBvcnQ6IG5lZWQgdG8gdXNlIC8sIG5vdCBcXFxuICBpZiAocGF0aC5zZXAgIT09ICcvJykge1xuICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnNwbGl0KHBhdGguc2VwKS5qb2luKCcvJylcbiAgfVxuXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgdGhpcy5zZXQgPSBbXVxuICB0aGlzLnBhdHRlcm4gPSBwYXR0ZXJuXG4gIHRoaXMucmVnZXhwID0gbnVsbFxuICB0aGlzLm5lZ2F0ZSA9IGZhbHNlXG4gIHRoaXMuY29tbWVudCA9IGZhbHNlXG4gIHRoaXMuZW1wdHkgPSBmYWxzZVxuXG4gIC8vIG1ha2UgdGhlIHNldCBvZiByZWdleHBzIGV0Yy5cbiAgdGhpcy5tYWtlKClcbn1cblxuTWluaW1hdGNoLnByb3RvdHlwZS5kZWJ1ZyA9IGZ1bmN0aW9uICgpIHt9XG5cbk1pbmltYXRjaC5wcm90b3R5cGUubWFrZSA9IG1ha2VcbmZ1bmN0aW9uIG1ha2UgKCkge1xuICAvLyBkb24ndCBkbyBpdCBtb3JlIHRoYW4gb25jZS5cbiAgaWYgKHRoaXMuX21hZGUpIHJldHVyblxuXG4gIHZhciBwYXR0ZXJuID0gdGhpcy5wYXR0ZXJuXG4gIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zXG5cbiAgLy8gZW1wdHkgcGF0dGVybnMgYW5kIGNvbW1lbnRzIG1hdGNoIG5vdGhpbmcuXG4gIGlmICghb3B0aW9ucy5ub2NvbW1lbnQgJiYgcGF0dGVybi5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgIHRoaXMuY29tbWVudCA9IHRydWVcbiAgICByZXR1cm5cbiAgfVxuICBpZiAoIXBhdHRlcm4pIHtcbiAgICB0aGlzLmVtcHR5ID0gdHJ1ZVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gc3RlcCAxOiBmaWd1cmUgb3V0IG5lZ2F0aW9uLCBldGMuXG4gIHRoaXMucGFyc2VOZWdhdGUoKVxuXG4gIC8vIHN0ZXAgMjogZXhwYW5kIGJyYWNlc1xuICB2YXIgc2V0ID0gdGhpcy5nbG9iU2V0ID0gdGhpcy5icmFjZUV4cGFuZCgpXG5cbiAgaWYgKG9wdGlvbnMuZGVidWcpIHRoaXMuZGVidWcgPSBjb25zb2xlLmVycm9yXG5cbiAgdGhpcy5kZWJ1Zyh0aGlzLnBhdHRlcm4sIHNldClcblxuICAvLyBzdGVwIDM6IG5vdyB3ZSBoYXZlIGEgc2V0LCBzbyB0dXJuIGVhY2ggb25lIGludG8gYSBzZXJpZXMgb2YgcGF0aC1wb3J0aW9uXG4gIC8vIG1hdGNoaW5nIHBhdHRlcm5zLlxuICAvLyBUaGVzZSB3aWxsIGJlIHJlZ2V4cHMsIGV4Y2VwdCBpbiB0aGUgY2FzZSBvZiBcIioqXCIsIHdoaWNoIGlzXG4gIC8vIHNldCB0byB0aGUgR0xPQlNUQVIgb2JqZWN0IGZvciBnbG9ic3RhciBiZWhhdmlvcixcbiAgLy8gYW5kIHdpbGwgbm90IGNvbnRhaW4gYW55IC8gY2hhcmFjdGVyc1xuICBzZXQgPSB0aGlzLmdsb2JQYXJ0cyA9IHNldC5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gcy5zcGxpdChzbGFzaFNwbGl0KVxuICB9KVxuXG4gIHRoaXMuZGVidWcodGhpcy5wYXR0ZXJuLCBzZXQpXG5cbiAgLy8gZ2xvYiAtLT4gcmVnZXhwc1xuICBzZXQgPSBzZXQubWFwKGZ1bmN0aW9uIChzLCBzaSwgc2V0KSB7XG4gICAgcmV0dXJuIHMubWFwKHRoaXMucGFyc2UsIHRoaXMpXG4gIH0sIHRoaXMpXG5cbiAgdGhpcy5kZWJ1Zyh0aGlzLnBhdHRlcm4sIHNldClcblxuICAvLyBmaWx0ZXIgb3V0IGV2ZXJ5dGhpbmcgdGhhdCBkaWRuJ3QgY29tcGlsZSBwcm9wZXJseS5cbiAgc2V0ID0gc2V0LmZpbHRlcihmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBzLmluZGV4T2YoZmFsc2UpID09PSAtMVxuICB9KVxuXG4gIHRoaXMuZGVidWcodGhpcy5wYXR0ZXJuLCBzZXQpXG5cbiAgdGhpcy5zZXQgPSBzZXRcbn1cblxuTWluaW1hdGNoLnByb3RvdHlwZS5wYXJzZU5lZ2F0ZSA9IHBhcnNlTmVnYXRlXG5mdW5jdGlvbiBwYXJzZU5lZ2F0ZSAoKSB7XG4gIHZhciBwYXR0ZXJuID0gdGhpcy5wYXR0ZXJuXG4gIHZhciBuZWdhdGUgPSBmYWxzZVxuICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1xuICB2YXIgbmVnYXRlT2Zmc2V0ID0gMFxuXG4gIGlmIChvcHRpb25zLm5vbmVnYXRlKSByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IHBhdHRlcm4ubGVuZ3RoXG4gICAgOyBpIDwgbCAmJiBwYXR0ZXJuLmNoYXJBdChpKSA9PT0gJyEnXG4gICAgOyBpKyspIHtcbiAgICBuZWdhdGUgPSAhbmVnYXRlXG4gICAgbmVnYXRlT2Zmc2V0KytcbiAgfVxuXG4gIGlmIChuZWdhdGVPZmZzZXQpIHRoaXMucGF0dGVybiA9IHBhdHRlcm4uc3Vic3RyKG5lZ2F0ZU9mZnNldClcbiAgdGhpcy5uZWdhdGUgPSBuZWdhdGVcbn1cblxuLy8gQnJhY2UgZXhwYW5zaW9uOlxuLy8gYXtiLGN9ZCAtPiBhYmQgYWNkXG4vLyBhe2IsfWMgLT4gYWJjIGFjXG4vLyBhezAuLjN9ZCAtPiBhMGQgYTFkIGEyZCBhM2Rcbi8vIGF7Yixje2QsZX1mfWcgLT4gYWJnIGFjZGZnIGFjZWZnXG4vLyBhe2IsY31ke2UsZn1nIC0+IGFiZGVnIGFjZGVnIGFiZGVnIGFiZGZnXG4vL1xuLy8gSW52YWxpZCBzZXRzIGFyZSBub3QgZXhwYW5kZWQuXG4vLyBhezIuLn1iIC0+IGF7Mi4ufWJcbi8vIGF7Yn1jIC0+IGF7Yn1jXG5taW5pbWF0Y2guYnJhY2VFeHBhbmQgPSBmdW5jdGlvbiAocGF0dGVybiwgb3B0aW9ucykge1xuICByZXR1cm4gYnJhY2VFeHBhbmQocGF0dGVybiwgb3B0aW9ucylcbn1cblxuTWluaW1hdGNoLnByb3RvdHlwZS5icmFjZUV4cGFuZCA9IGJyYWNlRXhwYW5kXG5cbmZ1bmN0aW9uIGJyYWNlRXhwYW5kIChwYXR0ZXJuLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucykge1xuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgTWluaW1hdGNoKSB7XG4gICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zXG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cbiAgfVxuXG4gIHBhdHRlcm4gPSB0eXBlb2YgcGF0dGVybiA9PT0gJ3VuZGVmaW5lZCdcbiAgICA/IHRoaXMucGF0dGVybiA6IHBhdHRlcm5cblxuICBpZiAodHlwZW9mIHBhdHRlcm4gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndW5kZWZpbmVkIHBhdHRlcm4nKVxuICB9XG5cbiAgaWYgKG9wdGlvbnMubm9icmFjZSB8fFxuICAgICFwYXR0ZXJuLm1hdGNoKC9cXHsuKlxcfS8pKSB7XG4gICAgLy8gc2hvcnRjdXQuIG5vIG5lZWQgdG8gZXhwYW5kLlxuICAgIHJldHVybiBbcGF0dGVybl1cbiAgfVxuXG4gIHJldHVybiBleHBhbmQocGF0dGVybilcbn1cblxuLy8gcGFyc2UgYSBjb21wb25lbnQgb2YgdGhlIGV4cGFuZGVkIHNldC5cbi8vIEF0IHRoaXMgcG9pbnQsIG5vIHBhdHRlcm4gbWF5IGNvbnRhaW4gXCIvXCIgaW4gaXRcbi8vIHNvIHdlJ3JlIGdvaW5nIHRvIHJldHVybiBhIDJkIGFycmF5LCB3aGVyZSBlYWNoIGVudHJ5IGlzIHRoZSBmdWxsXG4vLyBwYXR0ZXJuLCBzcGxpdCBvbiAnLycsIGFuZCB0aGVuIHR1cm5lZCBpbnRvIGEgcmVndWxhciBleHByZXNzaW9uLlxuLy8gQSByZWdleHAgaXMgbWFkZSBhdCB0aGUgZW5kIHdoaWNoIGpvaW5zIGVhY2ggYXJyYXkgd2l0aCBhblxuLy8gZXNjYXBlZCAvLCBhbmQgYW5vdGhlciBmdWxsIG9uZSB3aGljaCBqb2lucyBlYWNoIHJlZ2V4cCB3aXRoIHwuXG4vL1xuLy8gRm9sbG93aW5nIHRoZSBsZWFkIG9mIEJhc2ggNC4xLCBub3RlIHRoYXQgXCIqKlwiIG9ubHkgaGFzIHNwZWNpYWwgbWVhbmluZ1xuLy8gd2hlbiBpdCBpcyB0aGUgKm9ubHkqIHRoaW5nIGluIGEgcGF0aCBwb3J0aW9uLiAgT3RoZXJ3aXNlLCBhbnkgc2VyaWVzXG4vLyBvZiAqIGlzIGVxdWl2YWxlbnQgdG8gYSBzaW5nbGUgKi4gIEdsb2JzdGFyIGJlaGF2aW9yIGlzIGVuYWJsZWQgYnlcbi8vIGRlZmF1bHQsIGFuZCBjYW4gYmUgZGlzYWJsZWQgYnkgc2V0dGluZyBvcHRpb25zLm5vZ2xvYnN0YXIuXG5NaW5pbWF0Y2gucHJvdG90eXBlLnBhcnNlID0gcGFyc2VcbnZhciBTVUJQQVJTRSA9IHt9XG5mdW5jdGlvbiBwYXJzZSAocGF0dGVybiwgaXNTdWIpIHtcbiAgaWYgKHBhdHRlcm4ubGVuZ3RoID4gMTAyNCAqIDY0KSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncGF0dGVybiBpcyB0b28gbG9uZycpXG4gIH1cblxuICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1xuXG4gIC8vIHNob3J0Y3V0c1xuICBpZiAoIW9wdGlvbnMubm9nbG9ic3RhciAmJiBwYXR0ZXJuID09PSAnKionKSByZXR1cm4gR0xPQlNUQVJcbiAgaWYgKHBhdHRlcm4gPT09ICcnKSByZXR1cm4gJydcblxuICB2YXIgcmUgPSAnJ1xuICB2YXIgaGFzTWFnaWMgPSAhIW9wdGlvbnMubm9jYXNlXG4gIHZhciBlc2NhcGluZyA9IGZhbHNlXG4gIC8vID8gPT4gb25lIHNpbmdsZSBjaGFyYWN0ZXJcbiAgdmFyIHBhdHRlcm5MaXN0U3RhY2sgPSBbXVxuICB2YXIgbmVnYXRpdmVMaXN0cyA9IFtdXG4gIHZhciBzdGF0ZUNoYXJcbiAgdmFyIGluQ2xhc3MgPSBmYWxzZVxuICB2YXIgcmVDbGFzc1N0YXJ0ID0gLTFcbiAgdmFyIGNsYXNzU3RhcnQgPSAtMVxuICAvLyAuIGFuZCAuLiBuZXZlciBtYXRjaCBhbnl0aGluZyB0aGF0IGRvZXNuJ3Qgc3RhcnQgd2l0aCAuLFxuICAvLyBldmVuIHdoZW4gb3B0aW9ucy5kb3QgaXMgc2V0LlxuICB2YXIgcGF0dGVyblN0YXJ0ID0gcGF0dGVybi5jaGFyQXQoMCkgPT09ICcuJyA/ICcnIC8vIGFueXRoaW5nXG4gIC8vIG5vdCAoc3RhcnQgb3IgLyBmb2xsb3dlZCBieSAuIG9yIC4uIGZvbGxvd2VkIGJ5IC8gb3IgZW5kKVxuICA6IG9wdGlvbnMuZG90ID8gJyg/ISg/Ol58XFxcXFxcLylcXFxcLnsxLDJ9KD86JHxcXFxcXFwvKSknXG4gIDogJyg/IVxcXFwuKSdcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZnVuY3Rpb24gY2xlYXJTdGF0ZUNoYXIgKCkge1xuICAgIGlmIChzdGF0ZUNoYXIpIHtcbiAgICAgIC8vIHdlIGhhZCBzb21lIHN0YXRlLXRyYWNraW5nIGNoYXJhY3RlclxuICAgICAgLy8gdGhhdCB3YXNuJ3QgY29uc3VtZWQgYnkgdGhpcyBwYXNzLlxuICAgICAgc3dpdGNoIChzdGF0ZUNoYXIpIHtcbiAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgcmUgKz0gc3RhclxuICAgICAgICAgIGhhc01hZ2ljID0gdHJ1ZVxuICAgICAgICBicmVha1xuICAgICAgICBjYXNlICc/JzpcbiAgICAgICAgICByZSArPSBxbWFya1xuICAgICAgICAgIGhhc01hZ2ljID0gdHJ1ZVxuICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJlICs9ICdcXFxcJyArIHN0YXRlQ2hhclxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgc2VsZi5kZWJ1ZygnY2xlYXJTdGF0ZUNoYXIgJWogJWonLCBzdGF0ZUNoYXIsIHJlKVxuICAgICAgc3RhdGVDaGFyID0gZmFsc2VcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGF0dGVybi5sZW5ndGgsIGNcbiAgICA7IChpIDwgbGVuKSAmJiAoYyA9IHBhdHRlcm4uY2hhckF0KGkpKVxuICAgIDsgaSsrKSB7XG4gICAgdGhpcy5kZWJ1ZygnJXNcXHQlcyAlcyAlaicsIHBhdHRlcm4sIGksIHJlLCBjKVxuXG4gICAgLy8gc2tpcCBvdmVyIGFueSB0aGF0IGFyZSBlc2NhcGVkLlxuICAgIGlmIChlc2NhcGluZyAmJiByZVNwZWNpYWxzW2NdKSB7XG4gICAgICByZSArPSAnXFxcXCcgKyBjXG4gICAgICBlc2NhcGluZyA9IGZhbHNlXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIHN3aXRjaCAoYykge1xuICAgICAgY2FzZSAnLyc6XG4gICAgICAgIC8vIGNvbXBsZXRlbHkgbm90IGFsbG93ZWQsIGV2ZW4gZXNjYXBlZC5cbiAgICAgICAgLy8gU2hvdWxkIGFscmVhZHkgYmUgcGF0aC1zcGxpdCBieSBub3cuXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICBjYXNlICdcXFxcJzpcbiAgICAgICAgY2xlYXJTdGF0ZUNoYXIoKVxuICAgICAgICBlc2NhcGluZyA9IHRydWVcbiAgICAgIGNvbnRpbnVlXG5cbiAgICAgIC8vIHRoZSB2YXJpb3VzIHN0YXRlQ2hhciB2YWx1ZXNcbiAgICAgIC8vIGZvciB0aGUgXCJleHRnbG9iXCIgc3R1ZmYuXG4gICAgICBjYXNlICc/JzpcbiAgICAgIGNhc2UgJyonOlxuICAgICAgY2FzZSAnKyc6XG4gICAgICBjYXNlICdAJzpcbiAgICAgIGNhc2UgJyEnOlxuICAgICAgICB0aGlzLmRlYnVnKCclc1xcdCVzICVzICVqIDwtLSBzdGF0ZUNoYXInLCBwYXR0ZXJuLCBpLCByZSwgYylcblxuICAgICAgICAvLyBhbGwgb2YgdGhvc2UgYXJlIGxpdGVyYWxzIGluc2lkZSBhIGNsYXNzLCBleGNlcHQgdGhhdFxuICAgICAgICAvLyB0aGUgZ2xvYiBbIWFdIG1lYW5zIFteYV0gaW4gcmVnZXhwXG4gICAgICAgIGlmIChpbkNsYXNzKSB7XG4gICAgICAgICAgdGhpcy5kZWJ1ZygnICBpbiBjbGFzcycpXG4gICAgICAgICAgaWYgKGMgPT09ICchJyAmJiBpID09PSBjbGFzc1N0YXJ0ICsgMSkgYyA9ICdeJ1xuICAgICAgICAgIHJlICs9IGNcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgd2UgYWxyZWFkeSBoYXZlIGEgc3RhdGVDaGFyLCB0aGVuIGl0IG1lYW5zXG4gICAgICAgIC8vIHRoYXQgdGhlcmUgd2FzIHNvbWV0aGluZyBsaWtlICoqIG9yICs/IGluIHRoZXJlLlxuICAgICAgICAvLyBIYW5kbGUgdGhlIHN0YXRlQ2hhciwgdGhlbiBwcm9jZWVkIHdpdGggdGhpcyBvbmUuXG4gICAgICAgIHNlbGYuZGVidWcoJ2NhbGwgY2xlYXJTdGF0ZUNoYXIgJWonLCBzdGF0ZUNoYXIpXG4gICAgICAgIGNsZWFyU3RhdGVDaGFyKClcbiAgICAgICAgc3RhdGVDaGFyID0gY1xuICAgICAgICAvLyBpZiBleHRnbG9iIGlzIGRpc2FibGVkLCB0aGVuICsoYXNkZnxmb28pIGlzbid0IGEgdGhpbmcuXG4gICAgICAgIC8vIGp1c3QgY2xlYXIgdGhlIHN0YXRlY2hhciAqbm93KiwgcmF0aGVyIHRoYW4gZXZlbiBkaXZpbmcgaW50b1xuICAgICAgICAvLyB0aGUgcGF0dGVybkxpc3Qgc3R1ZmYuXG4gICAgICAgIGlmIChvcHRpb25zLm5vZXh0KSBjbGVhclN0YXRlQ2hhcigpXG4gICAgICBjb250aW51ZVxuXG4gICAgICBjYXNlICcoJzpcbiAgICAgICAgaWYgKGluQ2xhc3MpIHtcbiAgICAgICAgICByZSArPSAnKCdcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzdGF0ZUNoYXIpIHtcbiAgICAgICAgICByZSArPSAnXFxcXCgnXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIHBhdHRlcm5MaXN0U3RhY2sucHVzaCh7XG4gICAgICAgICAgdHlwZTogc3RhdGVDaGFyLFxuICAgICAgICAgIHN0YXJ0OiBpIC0gMSxcbiAgICAgICAgICByZVN0YXJ0OiByZS5sZW5ndGgsXG4gICAgICAgICAgb3BlbjogcGxUeXBlc1tzdGF0ZUNoYXJdLm9wZW4sXG4gICAgICAgICAgY2xvc2U6IHBsVHlwZXNbc3RhdGVDaGFyXS5jbG9zZVxuICAgICAgICB9KVxuICAgICAgICAvLyBuZWdhdGlvbiBpcyAoPzooPyFqcylbXi9dKilcbiAgICAgICAgcmUgKz0gc3RhdGVDaGFyID09PSAnIScgPyAnKD86KD8hKD86JyA6ICcoPzonXG4gICAgICAgIHRoaXMuZGVidWcoJ3BsVHlwZSAlaiAlaicsIHN0YXRlQ2hhciwgcmUpXG4gICAgICAgIHN0YXRlQ2hhciA9IGZhbHNlXG4gICAgICBjb250aW51ZVxuXG4gICAgICBjYXNlICcpJzpcbiAgICAgICAgaWYgKGluQ2xhc3MgfHwgIXBhdHRlcm5MaXN0U3RhY2subGVuZ3RoKSB7XG4gICAgICAgICAgcmUgKz0gJ1xcXFwpJ1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBjbGVhclN0YXRlQ2hhcigpXG4gICAgICAgIGhhc01hZ2ljID0gdHJ1ZVxuICAgICAgICB2YXIgcGwgPSBwYXR0ZXJuTGlzdFN0YWNrLnBvcCgpXG4gICAgICAgIC8vIG5lZ2F0aW9uIGlzICg/Oig/IWpzKVteL10qKVxuICAgICAgICAvLyBUaGUgb3RoZXJzIGFyZSAoPzo8cGF0dGVybj4pPHR5cGU+XG4gICAgICAgIHJlICs9IHBsLmNsb3NlXG4gICAgICAgIGlmIChwbC50eXBlID09PSAnIScpIHtcbiAgICAgICAgICBuZWdhdGl2ZUxpc3RzLnB1c2gocGwpXG4gICAgICAgIH1cbiAgICAgICAgcGwucmVFbmQgPSByZS5sZW5ndGhcbiAgICAgIGNvbnRpbnVlXG5cbiAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBpZiAoaW5DbGFzcyB8fCAhcGF0dGVybkxpc3RTdGFjay5sZW5ndGggfHwgZXNjYXBpbmcpIHtcbiAgICAgICAgICByZSArPSAnXFxcXHwnXG4gICAgICAgICAgZXNjYXBpbmcgPSBmYWxzZVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBjbGVhclN0YXRlQ2hhcigpXG4gICAgICAgIHJlICs9ICd8J1xuICAgICAgY29udGludWVcblxuICAgICAgLy8gdGhlc2UgYXJlIG1vc3RseSB0aGUgc2FtZSBpbiByZWdleHAgYW5kIGdsb2JcbiAgICAgIGNhc2UgJ1snOlxuICAgICAgICAvLyBzd2FsbG93IGFueSBzdGF0ZS10cmFja2luZyBjaGFyIGJlZm9yZSB0aGUgW1xuICAgICAgICBjbGVhclN0YXRlQ2hhcigpXG5cbiAgICAgICAgaWYgKGluQ2xhc3MpIHtcbiAgICAgICAgICByZSArPSAnXFxcXCcgKyBjXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIGluQ2xhc3MgPSB0cnVlXG4gICAgICAgIGNsYXNzU3RhcnQgPSBpXG4gICAgICAgIHJlQ2xhc3NTdGFydCA9IHJlLmxlbmd0aFxuICAgICAgICByZSArPSBjXG4gICAgICBjb250aW51ZVxuXG4gICAgICBjYXNlICddJzpcbiAgICAgICAgLy8gIGEgcmlnaHQgYnJhY2tldCBzaGFsbCBsb3NlIGl0cyBzcGVjaWFsXG4gICAgICAgIC8vICBtZWFuaW5nIGFuZCByZXByZXNlbnQgaXRzZWxmIGluXG4gICAgICAgIC8vICBhIGJyYWNrZXQgZXhwcmVzc2lvbiBpZiBpdCBvY2N1cnNcbiAgICAgICAgLy8gIGZpcnN0IGluIHRoZSBsaXN0LiAgLS0gUE9TSVguMiAyLjguMy4yXG4gICAgICAgIGlmIChpID09PSBjbGFzc1N0YXJ0ICsgMSB8fCAhaW5DbGFzcykge1xuICAgICAgICAgIHJlICs9ICdcXFxcJyArIGNcbiAgICAgICAgICBlc2NhcGluZyA9IGZhbHNlXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGhhbmRsZSB0aGUgY2FzZSB3aGVyZSB3ZSBsZWZ0IGEgY2xhc3Mgb3Blbi5cbiAgICAgICAgLy8gXCJbei1hXVwiIGlzIHZhbGlkLCBlcXVpdmFsZW50IHRvIFwiXFxbei1hXFxdXCJcbiAgICAgICAgaWYgKGluQ2xhc3MpIHtcbiAgICAgICAgICAvLyBzcGxpdCB3aGVyZSB0aGUgbGFzdCBbIHdhcywgbWFrZSBzdXJlIHdlIGRvbid0IGhhdmVcbiAgICAgICAgICAvLyBhbiBpbnZhbGlkIHJlLiBpZiBzbywgcmUtd2FsayB0aGUgY29udGVudHMgb2YgdGhlXG4gICAgICAgICAgLy8gd291bGQtYmUgY2xhc3MgdG8gcmUtdHJhbnNsYXRlIGFueSBjaGFyYWN0ZXJzIHRoYXRcbiAgICAgICAgICAvLyB3ZXJlIHBhc3NlZCB0aHJvdWdoIGFzLWlzXG4gICAgICAgICAgLy8gVE9ETzogSXQgd291bGQgcHJvYmFibHkgYmUgZmFzdGVyIHRvIGRldGVybWluZSB0aGlzXG4gICAgICAgICAgLy8gd2l0aG91dCBhIHRyeS9jYXRjaCBhbmQgYSBuZXcgUmVnRXhwLCBidXQgaXQncyB0cmlja3lcbiAgICAgICAgICAvLyB0byBkbyBzYWZlbHkuICBGb3Igbm93LCB0aGlzIGlzIHNhZmUgYW5kIHdvcmtzLlxuICAgICAgICAgIHZhciBjcyA9IHBhdHRlcm4uc3Vic3RyaW5nKGNsYXNzU3RhcnQgKyAxLCBpKVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBSZWdFeHAoJ1snICsgY3MgKyAnXScpXG4gICAgICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgICAgIC8vIG5vdCBhIHZhbGlkIGNsYXNzIVxuICAgICAgICAgICAgdmFyIHNwID0gdGhpcy5wYXJzZShjcywgU1VCUEFSU0UpXG4gICAgICAgICAgICByZSA9IHJlLnN1YnN0cigwLCByZUNsYXNzU3RhcnQpICsgJ1xcXFxbJyArIHNwWzBdICsgJ1xcXFxdJ1xuICAgICAgICAgICAgaGFzTWFnaWMgPSBoYXNNYWdpYyB8fCBzcFsxXVxuICAgICAgICAgICAgaW5DbGFzcyA9IGZhbHNlXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpbmlzaCB1cCB0aGUgY2xhc3MuXG4gICAgICAgIGhhc01hZ2ljID0gdHJ1ZVxuICAgICAgICBpbkNsYXNzID0gZmFsc2VcbiAgICAgICAgcmUgKz0gY1xuICAgICAgY29udGludWVcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gc3dhbGxvdyBhbnkgc3RhdGUgY2hhciB0aGF0IHdhc24ndCBjb25zdW1lZFxuICAgICAgICBjbGVhclN0YXRlQ2hhcigpXG5cbiAgICAgICAgaWYgKGVzY2FwaW5nKSB7XG4gICAgICAgICAgLy8gbm8gbmVlZFxuICAgICAgICAgIGVzY2FwaW5nID0gZmFsc2VcbiAgICAgICAgfSBlbHNlIGlmIChyZVNwZWNpYWxzW2NdXG4gICAgICAgICAgJiYgIShjID09PSAnXicgJiYgaW5DbGFzcykpIHtcbiAgICAgICAgICByZSArPSAnXFxcXCdcbiAgICAgICAgfVxuXG4gICAgICAgIHJlICs9IGNcblxuICAgIH0gLy8gc3dpdGNoXG4gIH0gLy8gZm9yXG5cbiAgLy8gaGFuZGxlIHRoZSBjYXNlIHdoZXJlIHdlIGxlZnQgYSBjbGFzcyBvcGVuLlxuICAvLyBcIlthYmNcIiBpcyB2YWxpZCwgZXF1aXZhbGVudCB0byBcIlxcW2FiY1wiXG4gIGlmIChpbkNsYXNzKSB7XG4gICAgLy8gc3BsaXQgd2hlcmUgdGhlIGxhc3QgWyB3YXMsIGFuZCBlc2NhcGUgaXRcbiAgICAvLyB0aGlzIGlzIGEgaHVnZSBwaXRhLiAgV2Ugbm93IGhhdmUgdG8gcmUtd2Fsa1xuICAgIC8vIHRoZSBjb250ZW50cyBvZiB0aGUgd291bGQtYmUgY2xhc3MgdG8gcmUtdHJhbnNsYXRlXG4gICAgLy8gYW55IGNoYXJhY3RlcnMgdGhhdCB3ZXJlIHBhc3NlZCB0aHJvdWdoIGFzLWlzXG4gICAgY3MgPSBwYXR0ZXJuLnN1YnN0cihjbGFzc1N0YXJ0ICsgMSlcbiAgICBzcCA9IHRoaXMucGFyc2UoY3MsIFNVQlBBUlNFKVxuICAgIHJlID0gcmUuc3Vic3RyKDAsIHJlQ2xhc3NTdGFydCkgKyAnXFxcXFsnICsgc3BbMF1cbiAgICBoYXNNYWdpYyA9IGhhc01hZ2ljIHx8IHNwWzFdXG4gIH1cblxuICAvLyBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgd2UgaGFkIGEgKyggdGhpbmcgYXQgdGhlICplbmQqXG4gIC8vIG9mIHRoZSBwYXR0ZXJuLlxuICAvLyBlYWNoIHBhdHRlcm4gbGlzdCBzdGFjayBhZGRzIDMgY2hhcnMsIGFuZCB3ZSBuZWVkIHRvIGdvIHRocm91Z2hcbiAgLy8gYW5kIGVzY2FwZSBhbnkgfCBjaGFycyB0aGF0IHdlcmUgcGFzc2VkIHRocm91Z2ggYXMtaXMgZm9yIHRoZSByZWdleHAuXG4gIC8vIEdvIHRocm91Z2ggYW5kIGVzY2FwZSB0aGVtLCB0YWtpbmcgY2FyZSBub3QgdG8gZG91YmxlLWVzY2FwZSBhbnlcbiAgLy8gfCBjaGFycyB0aGF0IHdlcmUgYWxyZWFkeSBlc2NhcGVkLlxuICBmb3IgKHBsID0gcGF0dGVybkxpc3RTdGFjay5wb3AoKTsgcGw7IHBsID0gcGF0dGVybkxpc3RTdGFjay5wb3AoKSkge1xuICAgIHZhciB0YWlsID0gcmUuc2xpY2UocGwucmVTdGFydCArIHBsLm9wZW4ubGVuZ3RoKVxuICAgIHRoaXMuZGVidWcoJ3NldHRpbmcgdGFpbCcsIHJlLCBwbClcbiAgICAvLyBtYXliZSBzb21lIGV2ZW4gbnVtYmVyIG9mIFxcLCB0aGVuIG1heWJlIDEgXFwsIGZvbGxvd2VkIGJ5IGEgfFxuICAgIHRhaWwgPSB0YWlsLnJlcGxhY2UoLygoPzpcXFxcezJ9KXswLDY0fSkoXFxcXD8pXFx8L2csIGZ1bmN0aW9uIChfLCAkMSwgJDIpIHtcbiAgICAgIGlmICghJDIpIHtcbiAgICAgICAgLy8gdGhlIHwgaXNuJ3QgYWxyZWFkeSBlc2NhcGVkLCBzbyBlc2NhcGUgaXQuXG4gICAgICAgICQyID0gJ1xcXFwnXG4gICAgICB9XG5cbiAgICAgIC8vIG5lZWQgdG8gZXNjYXBlIGFsbCB0aG9zZSBzbGFzaGVzICphZ2FpbiosIHdpdGhvdXQgZXNjYXBpbmcgdGhlXG4gICAgICAvLyBvbmUgdGhhdCB3ZSBuZWVkIGZvciBlc2NhcGluZyB0aGUgfCBjaGFyYWN0ZXIuICBBcyBpdCB3b3JrcyBvdXQsXG4gICAgICAvLyBlc2NhcGluZyBhbiBldmVuIG51bWJlciBvZiBzbGFzaGVzIGNhbiBiZSBkb25lIGJ5IHNpbXBseSByZXBlYXRpbmdcbiAgICAgIC8vIGl0IGV4YWN0bHkgYWZ0ZXIgaXRzZWxmLiAgVGhhdCdzIHdoeSB0aGlzIHRyaWNrIHdvcmtzLlxuICAgICAgLy9cbiAgICAgIC8vIEkgYW0gc29ycnkgdGhhdCB5b3UgaGF2ZSB0byBzZWUgdGhpcy5cbiAgICAgIHJldHVybiAkMSArICQxICsgJDIgKyAnfCdcbiAgICB9KVxuXG4gICAgdGhpcy5kZWJ1ZygndGFpbD0lalxcbiAgICVzJywgdGFpbCwgdGFpbCwgcGwsIHJlKVxuICAgIHZhciB0ID0gcGwudHlwZSA9PT0gJyonID8gc3RhclxuICAgICAgOiBwbC50eXBlID09PSAnPycgPyBxbWFya1xuICAgICAgOiAnXFxcXCcgKyBwbC50eXBlXG5cbiAgICBoYXNNYWdpYyA9IHRydWVcbiAgICByZSA9IHJlLnNsaWNlKDAsIHBsLnJlU3RhcnQpICsgdCArICdcXFxcKCcgKyB0YWlsXG4gIH1cblxuICAvLyBoYW5kbGUgdHJhaWxpbmcgdGhpbmdzIHRoYXQgb25seSBtYXR0ZXIgYXQgdGhlIHZlcnkgZW5kLlxuICBjbGVhclN0YXRlQ2hhcigpXG4gIGlmIChlc2NhcGluZykge1xuICAgIC8vIHRyYWlsaW5nIFxcXFxcbiAgICByZSArPSAnXFxcXFxcXFwnXG4gIH1cblxuICAvLyBvbmx5IG5lZWQgdG8gYXBwbHkgdGhlIG5vZG90IHN0YXJ0IGlmIHRoZSByZSBzdGFydHMgd2l0aFxuICAvLyBzb21ldGhpbmcgdGhhdCBjb3VsZCBjb25jZWl2YWJseSBjYXB0dXJlIGEgZG90XG4gIHZhciBhZGRQYXR0ZXJuU3RhcnQgPSBmYWxzZVxuICBzd2l0Y2ggKHJlLmNoYXJBdCgwKSkge1xuICAgIGNhc2UgJy4nOlxuICAgIGNhc2UgJ1snOlxuICAgIGNhc2UgJygnOiBhZGRQYXR0ZXJuU3RhcnQgPSB0cnVlXG4gIH1cblxuICAvLyBIYWNrIHRvIHdvcmsgYXJvdW5kIGxhY2sgb2YgbmVnYXRpdmUgbG9va2JlaGluZCBpbiBKU1xuICAvLyBBIHBhdHRlcm4gbGlrZTogKi4hKHgpLiEoeXx6KSBuZWVkcyB0byBlbnN1cmUgdGhhdCBhIG5hbWVcbiAgLy8gbGlrZSAnYS54eXoueXonIGRvZXNuJ3QgbWF0Y2guICBTbywgdGhlIGZpcnN0IG5lZ2F0aXZlXG4gIC8vIGxvb2thaGVhZCwgaGFzIHRvIGxvb2sgQUxMIHRoZSB3YXkgYWhlYWQsIHRvIHRoZSBlbmQgb2ZcbiAgLy8gdGhlIHBhdHRlcm4uXG4gIGZvciAodmFyIG4gPSBuZWdhdGl2ZUxpc3RzLmxlbmd0aCAtIDE7IG4gPiAtMTsgbi0tKSB7XG4gICAgdmFyIG5sID0gbmVnYXRpdmVMaXN0c1tuXVxuXG4gICAgdmFyIG5sQmVmb3JlID0gcmUuc2xpY2UoMCwgbmwucmVTdGFydClcbiAgICB2YXIgbmxGaXJzdCA9IHJlLnNsaWNlKG5sLnJlU3RhcnQsIG5sLnJlRW5kIC0gOClcbiAgICB2YXIgbmxMYXN0ID0gcmUuc2xpY2UobmwucmVFbmQgLSA4LCBubC5yZUVuZClcbiAgICB2YXIgbmxBZnRlciA9IHJlLnNsaWNlKG5sLnJlRW5kKVxuXG4gICAgbmxMYXN0ICs9IG5sQWZ0ZXJcblxuICAgIC8vIEhhbmRsZSBuZXN0ZWQgc3R1ZmYgbGlrZSAqKCouanN8ISgqLmpzb24pKSwgd2hlcmUgb3BlbiBwYXJlbnNcbiAgICAvLyBtZWFuIHRoYXQgd2Ugc2hvdWxkICpub3QqIGluY2x1ZGUgdGhlICkgaW4gdGhlIGJpdCB0aGF0IGlzIGNvbnNpZGVyZWRcbiAgICAvLyBcImFmdGVyXCIgdGhlIG5lZ2F0ZWQgc2VjdGlvbi5cbiAgICB2YXIgb3BlblBhcmVuc0JlZm9yZSA9IG5sQmVmb3JlLnNwbGl0KCcoJykubGVuZ3RoIC0gMVxuICAgIHZhciBjbGVhbkFmdGVyID0gbmxBZnRlclxuICAgIGZvciAoaSA9IDA7IGkgPCBvcGVuUGFyZW5zQmVmb3JlOyBpKyspIHtcbiAgICAgIGNsZWFuQWZ0ZXIgPSBjbGVhbkFmdGVyLnJlcGxhY2UoL1xcKVsrKj9dPy8sICcnKVxuICAgIH1cbiAgICBubEFmdGVyID0gY2xlYW5BZnRlclxuXG4gICAgdmFyIGRvbGxhciA9ICcnXG4gICAgaWYgKG5sQWZ0ZXIgPT09ICcnICYmIGlzU3ViICE9PSBTVUJQQVJTRSkge1xuICAgICAgZG9sbGFyID0gJyQnXG4gICAgfVxuICAgIHZhciBuZXdSZSA9IG5sQmVmb3JlICsgbmxGaXJzdCArIG5sQWZ0ZXIgKyBkb2xsYXIgKyBubExhc3RcbiAgICByZSA9IG5ld1JlXG4gIH1cblxuICAvLyBpZiB0aGUgcmUgaXMgbm90IFwiXCIgYXQgdGhpcyBwb2ludCwgdGhlbiB3ZSBuZWVkIHRvIG1ha2Ugc3VyZVxuICAvLyBpdCBkb2Vzbid0IG1hdGNoIGFnYWluc3QgYW4gZW1wdHkgcGF0aCBwYXJ0LlxuICAvLyBPdGhlcndpc2UgYS8qIHdpbGwgbWF0Y2ggYS8sIHdoaWNoIGl0IHNob3VsZCBub3QuXG4gIGlmIChyZSAhPT0gJycgJiYgaGFzTWFnaWMpIHtcbiAgICByZSA9ICcoPz0uKScgKyByZVxuICB9XG5cbiAgaWYgKGFkZFBhdHRlcm5TdGFydCkge1xuICAgIHJlID0gcGF0dGVyblN0YXJ0ICsgcmVcbiAgfVxuXG4gIC8vIHBhcnNpbmcganVzdCBhIHBpZWNlIG9mIGEgbGFyZ2VyIHBhdHRlcm4uXG4gIGlmIChpc1N1YiA9PT0gU1VCUEFSU0UpIHtcbiAgICByZXR1cm4gW3JlLCBoYXNNYWdpY11cbiAgfVxuXG4gIC8vIHNraXAgdGhlIHJlZ2V4cCBmb3Igbm9uLW1hZ2ljYWwgcGF0dGVybnNcbiAgLy8gdW5lc2NhcGUgYW55dGhpbmcgaW4gaXQsIHRob3VnaCwgc28gdGhhdCBpdCdsbCBiZVxuICAvLyBhbiBleGFjdCBtYXRjaCBhZ2FpbnN0IGEgZmlsZSBldGMuXG4gIGlmICghaGFzTWFnaWMpIHtcbiAgICByZXR1cm4gZ2xvYlVuZXNjYXBlKHBhdHRlcm4pXG4gIH1cblxuICB2YXIgZmxhZ3MgPSBvcHRpb25zLm5vY2FzZSA/ICdpJyA6ICcnXG4gIHRyeSB7XG4gICAgdmFyIHJlZ0V4cCA9IG5ldyBSZWdFeHAoJ14nICsgcmUgKyAnJCcsIGZsYWdzKVxuICB9IGNhdGNoIChlcikge1xuICAgIC8vIElmIGl0IHdhcyBhbiBpbnZhbGlkIHJlZ3VsYXIgZXhwcmVzc2lvbiwgdGhlbiBpdCBjYW4ndCBtYXRjaFxuICAgIC8vIGFueXRoaW5nLiAgVGhpcyB0cmljayBsb29rcyBmb3IgYSBjaGFyYWN0ZXIgYWZ0ZXIgdGhlIGVuZCBvZlxuICAgIC8vIHRoZSBzdHJpbmcsIHdoaWNoIGlzIG9mIGNvdXJzZSBpbXBvc3NpYmxlLCBleGNlcHQgaW4gbXVsdGktbGluZVxuICAgIC8vIG1vZGUsIGJ1dCBpdCdzIG5vdCBhIC9tIHJlZ2V4LlxuICAgIHJldHVybiBuZXcgUmVnRXhwKCckLicpXG4gIH1cblxuICByZWdFeHAuX2dsb2IgPSBwYXR0ZXJuXG4gIHJlZ0V4cC5fc3JjID0gcmVcblxuICByZXR1cm4gcmVnRXhwXG59XG5cbm1pbmltYXRjaC5tYWtlUmUgPSBmdW5jdGlvbiAocGF0dGVybiwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IE1pbmltYXRjaChwYXR0ZXJuLCBvcHRpb25zIHx8IHt9KS5tYWtlUmUoKVxufVxuXG5NaW5pbWF0Y2gucHJvdG90eXBlLm1ha2VSZSA9IG1ha2VSZVxuZnVuY3Rpb24gbWFrZVJlICgpIHtcbiAgaWYgKHRoaXMucmVnZXhwIHx8IHRoaXMucmVnZXhwID09PSBmYWxzZSkgcmV0dXJuIHRoaXMucmVnZXhwXG5cbiAgLy8gYXQgdGhpcyBwb2ludCwgdGhpcy5zZXQgaXMgYSAyZCBhcnJheSBvZiBwYXJ0aWFsXG4gIC8vIHBhdHRlcm4gc3RyaW5ncywgb3IgXCIqKlwiLlxuICAvL1xuICAvLyBJdCdzIGJldHRlciB0byB1c2UgLm1hdGNoKCkuICBUaGlzIGZ1bmN0aW9uIHNob3VsZG4ndFxuICAvLyBiZSB1c2VkLCByZWFsbHksIGJ1dCBpdCdzIHByZXR0eSBjb252ZW5pZW50IHNvbWV0aW1lcyxcbiAgLy8gd2hlbiB5b3UganVzdCB3YW50IHRvIHdvcmsgd2l0aCBhIHJlZ2V4LlxuICB2YXIgc2V0ID0gdGhpcy5zZXRcblxuICBpZiAoIXNldC5sZW5ndGgpIHtcbiAgICB0aGlzLnJlZ2V4cCA9IGZhbHNlXG4gICAgcmV0dXJuIHRoaXMucmVnZXhwXG4gIH1cbiAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcblxuICB2YXIgdHdvU3RhciA9IG9wdGlvbnMubm9nbG9ic3RhciA/IHN0YXJcbiAgICA6IG9wdGlvbnMuZG90ID8gdHdvU3RhckRvdFxuICAgIDogdHdvU3Rhck5vRG90XG4gIHZhciBmbGFncyA9IG9wdGlvbnMubm9jYXNlID8gJ2knIDogJydcblxuICB2YXIgcmUgPSBzZXQubWFwKGZ1bmN0aW9uIChwYXR0ZXJuKSB7XG4gICAgcmV0dXJuIHBhdHRlcm4ubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICByZXR1cm4gKHAgPT09IEdMT0JTVEFSKSA/IHR3b1N0YXJcbiAgICAgIDogKHR5cGVvZiBwID09PSAnc3RyaW5nJykgPyByZWdFeHBFc2NhcGUocClcbiAgICAgIDogcC5fc3JjXG4gICAgfSkuam9pbignXFxcXFxcLycpXG4gIH0pLmpvaW4oJ3wnKVxuXG4gIC8vIG11c3QgbWF0Y2ggZW50aXJlIHBhdHRlcm5cbiAgLy8gZW5kaW5nIGluIGEgKiBvciAqKiB3aWxsIG1ha2UgaXQgbGVzcyBzdHJpY3QuXG4gIHJlID0gJ14oPzonICsgcmUgKyAnKSQnXG5cbiAgLy8gY2FuIG1hdGNoIGFueXRoaW5nLCBhcyBsb25nIGFzIGl0J3Mgbm90IHRoaXMuXG4gIGlmICh0aGlzLm5lZ2F0ZSkgcmUgPSAnXig/IScgKyByZSArICcpLiokJ1xuXG4gIHRyeSB7XG4gICAgdGhpcy5yZWdleHAgPSBuZXcgUmVnRXhwKHJlLCBmbGFncylcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICB0aGlzLnJlZ2V4cCA9IGZhbHNlXG4gIH1cbiAgcmV0dXJuIHRoaXMucmVnZXhwXG59XG5cbm1pbmltYXRjaC5tYXRjaCA9IGZ1bmN0aW9uIChsaXN0LCBwYXR0ZXJuLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gIHZhciBtbSA9IG5ldyBNaW5pbWF0Y2gocGF0dGVybiwgb3B0aW9ucylcbiAgbGlzdCA9IGxpc3QuZmlsdGVyKGZ1bmN0aW9uIChmKSB7XG4gICAgcmV0dXJuIG1tLm1hdGNoKGYpXG4gIH0pXG4gIGlmIChtbS5vcHRpb25zLm5vbnVsbCAmJiAhbGlzdC5sZW5ndGgpIHtcbiAgICBsaXN0LnB1c2gocGF0dGVybilcbiAgfVxuICByZXR1cm4gbGlzdFxufVxuXG5NaW5pbWF0Y2gucHJvdG90eXBlLm1hdGNoID0gbWF0Y2hcbmZ1bmN0aW9uIG1hdGNoIChmLCBwYXJ0aWFsKSB7XG4gIHRoaXMuZGVidWcoJ21hdGNoJywgZiwgdGhpcy5wYXR0ZXJuKVxuICAvLyBzaG9ydC1jaXJjdWl0IGluIHRoZSBjYXNlIG9mIGJ1c3RlZCB0aGluZ3MuXG4gIC8vIGNvbW1lbnRzLCBldGMuXG4gIGlmICh0aGlzLmNvbW1lbnQpIHJldHVybiBmYWxzZVxuICBpZiAodGhpcy5lbXB0eSkgcmV0dXJuIGYgPT09ICcnXG5cbiAgaWYgKGYgPT09ICcvJyAmJiBwYXJ0aWFsKSByZXR1cm4gdHJ1ZVxuXG4gIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zXG5cbiAgLy8gd2luZG93czogbmVlZCB0byB1c2UgLywgbm90IFxcXG4gIGlmIChwYXRoLnNlcCAhPT0gJy8nKSB7XG4gICAgZiA9IGYuc3BsaXQocGF0aC5zZXApLmpvaW4oJy8nKVxuICB9XG5cbiAgLy8gdHJlYXQgdGhlIHRlc3QgcGF0aCBhcyBhIHNldCBvZiBwYXRocGFydHMuXG4gIGYgPSBmLnNwbGl0KHNsYXNoU3BsaXQpXG4gIHRoaXMuZGVidWcodGhpcy5wYXR0ZXJuLCAnc3BsaXQnLCBmKVxuXG4gIC8vIGp1c3QgT05FIG9mIHRoZSBwYXR0ZXJuIHNldHMgaW4gdGhpcy5zZXQgbmVlZHMgdG8gbWF0Y2hcbiAgLy8gaW4gb3JkZXIgZm9yIGl0IHRvIGJlIHZhbGlkLiAgSWYgbmVnYXRpbmcsIHRoZW4ganVzdCBvbmVcbiAgLy8gbWF0Y2ggbWVhbnMgdGhhdCB3ZSBoYXZlIGZhaWxlZC5cbiAgLy8gRWl0aGVyIHdheSwgcmV0dXJuIG9uIHRoZSBmaXJzdCBoaXQuXG5cbiAgdmFyIHNldCA9IHRoaXMuc2V0XG4gIHRoaXMuZGVidWcodGhpcy5wYXR0ZXJuLCAnc2V0Jywgc2V0KVxuXG4gIC8vIEZpbmQgdGhlIGJhc2VuYW1lIG9mIHRoZSBwYXRoIGJ5IGxvb2tpbmcgZm9yIHRoZSBsYXN0IG5vbi1lbXB0eSBzZWdtZW50XG4gIHZhciBmaWxlbmFtZVxuICB2YXIgaVxuICBmb3IgKGkgPSBmLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgZmlsZW5hbWUgPSBmW2ldXG4gICAgaWYgKGZpbGVuYW1lKSBicmVha1xuICB9XG5cbiAgZm9yIChpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwYXR0ZXJuID0gc2V0W2ldXG4gICAgdmFyIGZpbGUgPSBmXG4gICAgaWYgKG9wdGlvbnMubWF0Y2hCYXNlICYmIHBhdHRlcm4ubGVuZ3RoID09PSAxKSB7XG4gICAgICBmaWxlID0gW2ZpbGVuYW1lXVxuICAgIH1cbiAgICB2YXIgaGl0ID0gdGhpcy5tYXRjaE9uZShmaWxlLCBwYXR0ZXJuLCBwYXJ0aWFsKVxuICAgIGlmIChoaXQpIHtcbiAgICAgIGlmIChvcHRpb25zLmZsaXBOZWdhdGUpIHJldHVybiB0cnVlXG4gICAgICByZXR1cm4gIXRoaXMubmVnYXRlXG4gICAgfVxuICB9XG5cbiAgLy8gZGlkbid0IGdldCBhbnkgaGl0cy4gIHRoaXMgaXMgc3VjY2VzcyBpZiBpdCdzIGEgbmVnYXRpdmVcbiAgLy8gcGF0dGVybiwgZmFpbHVyZSBvdGhlcndpc2UuXG4gIGlmIChvcHRpb25zLmZsaXBOZWdhdGUpIHJldHVybiBmYWxzZVxuICByZXR1cm4gdGhpcy5uZWdhdGVcbn1cblxuLy8gc2V0IHBhcnRpYWwgdG8gdHJ1ZSB0byB0ZXN0IGlmLCBmb3IgZXhhbXBsZSxcbi8vIFwiL2EvYlwiIG1hdGNoZXMgdGhlIHN0YXJ0IG9mIFwiLyovYi8qL2RcIlxuLy8gUGFydGlhbCBtZWFucywgaWYgeW91IHJ1biBvdXQgb2YgZmlsZSBiZWZvcmUgeW91IHJ1blxuLy8gb3V0IG9mIHBhdHRlcm4sIHRoZW4gdGhhdCdzIGZpbmUsIGFzIGxvbmcgYXMgYWxsXG4vLyB0aGUgcGFydHMgbWF0Y2guXG5NaW5pbWF0Y2gucHJvdG90eXBlLm1hdGNoT25lID0gZnVuY3Rpb24gKGZpbGUsIHBhdHRlcm4sIHBhcnRpYWwpIHtcbiAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcblxuICB0aGlzLmRlYnVnKCdtYXRjaE9uZScsXG4gICAgeyAndGhpcyc6IHRoaXMsIGZpbGU6IGZpbGUsIHBhdHRlcm46IHBhdHRlcm4gfSlcblxuICB0aGlzLmRlYnVnKCdtYXRjaE9uZScsIGZpbGUubGVuZ3RoLCBwYXR0ZXJuLmxlbmd0aClcblxuICBmb3IgKHZhciBmaSA9IDAsXG4gICAgICBwaSA9IDAsXG4gICAgICBmbCA9IGZpbGUubGVuZ3RoLFxuICAgICAgcGwgPSBwYXR0ZXJuLmxlbmd0aFxuICAgICAgOyAoZmkgPCBmbCkgJiYgKHBpIDwgcGwpXG4gICAgICA7IGZpKyssIHBpKyspIHtcbiAgICB0aGlzLmRlYnVnKCdtYXRjaE9uZSBsb29wJylcbiAgICB2YXIgcCA9IHBhdHRlcm5bcGldXG4gICAgdmFyIGYgPSBmaWxlW2ZpXVxuXG4gICAgdGhpcy5kZWJ1ZyhwYXR0ZXJuLCBwLCBmKVxuXG4gICAgLy8gc2hvdWxkIGJlIGltcG9zc2libGUuXG4gICAgLy8gc29tZSBpbnZhbGlkIHJlZ2V4cCBzdHVmZiBpbiB0aGUgc2V0LlxuICAgIGlmIChwID09PSBmYWxzZSkgcmV0dXJuIGZhbHNlXG5cbiAgICBpZiAocCA9PT0gR0xPQlNUQVIpIHtcbiAgICAgIHRoaXMuZGVidWcoJ0dMT0JTVEFSJywgW3BhdHRlcm4sIHAsIGZdKVxuXG4gICAgICAvLyBcIioqXCJcbiAgICAgIC8vIGEvKiovYi8qKi9jIHdvdWxkIG1hdGNoIHRoZSBmb2xsb3dpbmc6XG4gICAgICAvLyBhL2IveC95L3ovY1xuICAgICAgLy8gYS94L3kvei9iL2NcbiAgICAgIC8vIGEvYi94L2IveC9jXG4gICAgICAvLyBhL2IvY1xuICAgICAgLy8gVG8gZG8gdGhpcywgdGFrZSB0aGUgcmVzdCBvZiB0aGUgcGF0dGVybiBhZnRlclxuICAgICAgLy8gdGhlICoqLCBhbmQgc2VlIGlmIGl0IHdvdWxkIG1hdGNoIHRoZSBmaWxlIHJlbWFpbmRlci5cbiAgICAgIC8vIElmIHNvLCByZXR1cm4gc3VjY2Vzcy5cbiAgICAgIC8vIElmIG5vdCwgdGhlICoqIFwic3dhbGxvd3NcIiBhIHNlZ21lbnQsIGFuZCB0cnkgYWdhaW4uXG4gICAgICAvLyBUaGlzIGlzIHJlY3Vyc2l2ZWx5IGF3ZnVsLlxuICAgICAgLy9cbiAgICAgIC8vIGEvKiovYi8qKi9jIG1hdGNoaW5nIGEvYi94L3kvei9jXG4gICAgICAvLyAtIGEgbWF0Y2hlcyBhXG4gICAgICAvLyAtIGRvdWJsZXN0YXJcbiAgICAgIC8vICAgLSBtYXRjaE9uZShiL3gveS96L2MsIGIvKiovYylcbiAgICAgIC8vICAgICAtIGIgbWF0Y2hlcyBiXG4gICAgICAvLyAgICAgLSBkb3VibGVzdGFyXG4gICAgICAvLyAgICAgICAtIG1hdGNoT25lKHgveS96L2MsIGMpIC0+IG5vXG4gICAgICAvLyAgICAgICAtIG1hdGNoT25lKHkvei9jLCBjKSAtPiBub1xuICAgICAgLy8gICAgICAgLSBtYXRjaE9uZSh6L2MsIGMpIC0+IG5vXG4gICAgICAvLyAgICAgICAtIG1hdGNoT25lKGMsIGMpIHllcywgaGl0XG4gICAgICB2YXIgZnIgPSBmaVxuICAgICAgdmFyIHByID0gcGkgKyAxXG4gICAgICBpZiAocHIgPT09IHBsKSB7XG4gICAgICAgIHRoaXMuZGVidWcoJyoqIGF0IHRoZSBlbmQnKVxuICAgICAgICAvLyBhICoqIGF0IHRoZSBlbmQgd2lsbCBqdXN0IHN3YWxsb3cgdGhlIHJlc3QuXG4gICAgICAgIC8vIFdlIGhhdmUgZm91bmQgYSBtYXRjaC5cbiAgICAgICAgLy8gaG93ZXZlciwgaXQgd2lsbCBub3Qgc3dhbGxvdyAvLngsIHVubGVzc1xuICAgICAgICAvLyBvcHRpb25zLmRvdCBpcyBzZXQuXG4gICAgICAgIC8vIC4gYW5kIC4uIGFyZSAqbmV2ZXIqIG1hdGNoZWQgYnkgKiosIGZvciBleHBsb3NpdmVseVxuICAgICAgICAvLyBleHBvbmVudGlhbCByZWFzb25zLlxuICAgICAgICBmb3IgKDsgZmkgPCBmbDsgZmkrKykge1xuICAgICAgICAgIGlmIChmaWxlW2ZpXSA9PT0gJy4nIHx8IGZpbGVbZmldID09PSAnLi4nIHx8XG4gICAgICAgICAgICAoIW9wdGlvbnMuZG90ICYmIGZpbGVbZmldLmNoYXJBdCgwKSA9PT0gJy4nKSkgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cblxuICAgICAgLy8gb2ssIGxldCdzIHNlZSBpZiB3ZSBjYW4gc3dhbGxvdyB3aGF0ZXZlciB3ZSBjYW4uXG4gICAgICB3aGlsZSAoZnIgPCBmbCkge1xuICAgICAgICB2YXIgc3dhbGxvd2VlID0gZmlsZVtmcl1cblxuICAgICAgICB0aGlzLmRlYnVnKCdcXG5nbG9ic3RhciB3aGlsZScsIGZpbGUsIGZyLCBwYXR0ZXJuLCBwciwgc3dhbGxvd2VlKVxuXG4gICAgICAgIC8vIFhYWCByZW1vdmUgdGhpcyBzbGljZS4gIEp1c3QgcGFzcyB0aGUgc3RhcnQgaW5kZXguXG4gICAgICAgIGlmICh0aGlzLm1hdGNoT25lKGZpbGUuc2xpY2UoZnIpLCBwYXR0ZXJuLnNsaWNlKHByKSwgcGFydGlhbCkpIHtcbiAgICAgICAgICB0aGlzLmRlYnVnKCdnbG9ic3RhciBmb3VuZCBtYXRjaCEnLCBmciwgZmwsIHN3YWxsb3dlZSlcbiAgICAgICAgICAvLyBmb3VuZCBhIG1hdGNoLlxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gY2FuJ3Qgc3dhbGxvdyBcIi5cIiBvciBcIi4uXCIgZXZlci5cbiAgICAgICAgICAvLyBjYW4gb25seSBzd2FsbG93IFwiLmZvb1wiIHdoZW4gZXhwbGljaXRseSBhc2tlZC5cbiAgICAgICAgICBpZiAoc3dhbGxvd2VlID09PSAnLicgfHwgc3dhbGxvd2VlID09PSAnLi4nIHx8XG4gICAgICAgICAgICAoIW9wdGlvbnMuZG90ICYmIHN3YWxsb3dlZS5jaGFyQXQoMCkgPT09ICcuJykpIHtcbiAgICAgICAgICAgIHRoaXMuZGVidWcoJ2RvdCBkZXRlY3RlZCEnLCBmaWxlLCBmciwgcGF0dGVybiwgcHIpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vICoqIHN3YWxsb3dzIGEgc2VnbWVudCwgYW5kIGNvbnRpbnVlLlxuICAgICAgICAgIHRoaXMuZGVidWcoJ2dsb2JzdGFyIHN3YWxsb3cgYSBzZWdtZW50LCBhbmQgY29udGludWUnKVxuICAgICAgICAgIGZyKytcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBubyBtYXRjaCB3YXMgZm91bmQuXG4gICAgICAvLyBIb3dldmVyLCBpbiBwYXJ0aWFsIG1vZGUsIHdlIGNhbid0IHNheSB0aGlzIGlzIG5lY2Vzc2FyaWx5IG92ZXIuXG4gICAgICAvLyBJZiB0aGVyZSdzIG1vcmUgKnBhdHRlcm4qIGxlZnQsIHRoZW5cbiAgICAgIGlmIChwYXJ0aWFsKSB7XG4gICAgICAgIC8vIHJhbiBvdXQgb2YgZmlsZVxuICAgICAgICB0aGlzLmRlYnVnKCdcXG4+Pj4gbm8gbWF0Y2gsIHBhcnRpYWw/JywgZmlsZSwgZnIsIHBhdHRlcm4sIHByKVxuICAgICAgICBpZiAoZnIgPT09IGZsKSByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gc29tZXRoaW5nIG90aGVyIHRoYW4gKipcbiAgICAvLyBub24tbWFnaWMgcGF0dGVybnMganVzdCBoYXZlIHRvIG1hdGNoIGV4YWN0bHlcbiAgICAvLyBwYXR0ZXJucyB3aXRoIG1hZ2ljIGhhdmUgYmVlbiB0dXJuZWQgaW50byByZWdleHBzLlxuICAgIHZhciBoaXRcbiAgICBpZiAodHlwZW9mIHAgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAob3B0aW9ucy5ub2Nhc2UpIHtcbiAgICAgICAgaGl0ID0gZi50b0xvd2VyQ2FzZSgpID09PSBwLnRvTG93ZXJDYXNlKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhpdCA9IGYgPT09IHBcbiAgICAgIH1cbiAgICAgIHRoaXMuZGVidWcoJ3N0cmluZyBtYXRjaCcsIHAsIGYsIGhpdClcbiAgICB9IGVsc2Uge1xuICAgICAgaGl0ID0gZi5tYXRjaChwKVxuICAgICAgdGhpcy5kZWJ1ZygncGF0dGVybiBtYXRjaCcsIHAsIGYsIGhpdClcbiAgICB9XG5cbiAgICBpZiAoIWhpdCkgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyBOb3RlOiBlbmRpbmcgaW4gLyBtZWFucyB0aGF0IHdlJ2xsIGdldCBhIGZpbmFsIFwiXCJcbiAgLy8gYXQgdGhlIGVuZCBvZiB0aGUgcGF0dGVybi4gIFRoaXMgY2FuIG9ubHkgbWF0Y2ggYVxuICAvLyBjb3JyZXNwb25kaW5nIFwiXCIgYXQgdGhlIGVuZCBvZiB0aGUgZmlsZS5cbiAgLy8gSWYgdGhlIGZpbGUgZW5kcyBpbiAvLCB0aGVuIGl0IGNhbiBvbmx5IG1hdGNoIGFcbiAgLy8gYSBwYXR0ZXJuIHRoYXQgZW5kcyBpbiAvLCB1bmxlc3MgdGhlIHBhdHRlcm4ganVzdFxuICAvLyBkb2Vzbid0IGhhdmUgYW55IG1vcmUgZm9yIGl0LiBCdXQsIGEvYi8gc2hvdWxkICpub3QqXG4gIC8vIG1hdGNoIFwiYS9iLypcIiwgZXZlbiB0aG91Z2ggXCJcIiBtYXRjaGVzIGFnYWluc3QgdGhlXG4gIC8vIFteL10qPyBwYXR0ZXJuLCBleGNlcHQgaW4gcGFydGlhbCBtb2RlLCB3aGVyZSBpdCBtaWdodFxuICAvLyBzaW1wbHkgbm90IGJlIHJlYWNoZWQgeWV0LlxuICAvLyBIb3dldmVyLCBhL2IvIHNob3VsZCBzdGlsbCBzYXRpc2Z5IGEvKlxuXG4gIC8vIG5vdyBlaXRoZXIgd2UgZmVsbCBvZmYgdGhlIGVuZCBvZiB0aGUgcGF0dGVybiwgb3Igd2UncmUgZG9uZS5cbiAgaWYgKGZpID09PSBmbCAmJiBwaSA9PT0gcGwpIHtcbiAgICAvLyByYW4gb3V0IG9mIHBhdHRlcm4gYW5kIGZpbGVuYW1lIGF0IHRoZSBzYW1lIHRpbWUuXG4gICAgLy8gYW4gZXhhY3QgaGl0IVxuICAgIHJldHVybiB0cnVlXG4gIH0gZWxzZSBpZiAoZmkgPT09IGZsKSB7XG4gICAgLy8gcmFuIG91dCBvZiBmaWxlLCBidXQgc3RpbGwgaGFkIHBhdHRlcm4gbGVmdC5cbiAgICAvLyB0aGlzIGlzIG9rIGlmIHdlJ3JlIGRvaW5nIHRoZSBtYXRjaCBhcyBwYXJ0IG9mXG4gICAgLy8gYSBnbG9iIGZzIHRyYXZlcnNhbC5cbiAgICByZXR1cm4gcGFydGlhbFxuICB9IGVsc2UgaWYgKHBpID09PSBwbCkge1xuICAgIC8vIHJhbiBvdXQgb2YgcGF0dGVybiwgc3RpbGwgaGF2ZSBmaWxlIGxlZnQuXG4gICAgLy8gdGhpcyBpcyBvbmx5IGFjY2VwdGFibGUgaWYgd2UncmUgb24gdGhlIHZlcnkgbGFzdFxuICAgIC8vIGVtcHR5IHNlZ21lbnQgb2YgYSBmaWxlIHdpdGggYSB0cmFpbGluZyBzbGFzaC5cbiAgICAvLyBhLyogc2hvdWxkIG1hdGNoIGEvYi9cbiAgICB2YXIgZW1wdHlGaWxlRW5kID0gKGZpID09PSBmbCAtIDEpICYmIChmaWxlW2ZpXSA9PT0gJycpXG4gICAgcmV0dXJuIGVtcHR5RmlsZUVuZFxuICB9XG5cbiAgLy8gc2hvdWxkIGJlIHVucmVhY2hhYmxlLlxuICB0aHJvdyBuZXcgRXJyb3IoJ3d0Zj8nKVxufVxuXG4vLyByZXBsYWNlIHN0dWZmIGxpa2UgXFwqIHdpdGggKlxuZnVuY3Rpb24gZ2xvYlVuZXNjYXBlIChzKSB7XG4gIHJldHVybiBzLnJlcGxhY2UoL1xcXFwoLikvZywgJyQxJylcbn1cblxuZnVuY3Rpb24gcmVnRXhwRXNjYXBlIChzKSB7XG4gIHJldHVybiBzLnJlcGxhY2UoL1stW1xcXXt9KCkqKz8uLFxcXFxeJHwjXFxzXS9nLCAnXFxcXCQmJylcbn1cbiIsIi8vICdwYXRoJyBtb2R1bGUgZXh0cmFjdGVkIGZyb20gTm9kZS5qcyB2OC4xMS4xIChvbmx5IHRoZSBwb3NpeCBwYXJ0KVxuLy8gdHJhbnNwbGl0ZWQgd2l0aCBCYWJlbFxuXG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBhc3NlcnRQYXRoKHBhdGgpIHtcbiAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1BhdGggbXVzdCBiZSBhIHN0cmluZy4gUmVjZWl2ZWQgJyArIEpTT04uc3RyaW5naWZ5KHBhdGgpKTtcbiAgfVxufVxuXG4vLyBSZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggd2l0aCBkaXJlY3RvcnkgbmFtZXNcbmZ1bmN0aW9uIG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHBhdGgsIGFsbG93QWJvdmVSb290KSB7XG4gIHZhciByZXMgPSAnJztcbiAgdmFyIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgdmFyIGxhc3RTbGFzaCA9IC0xO1xuICB2YXIgZG90cyA9IDA7XG4gIHZhciBjb2RlO1xuICBmb3IgKHZhciBpID0gMDsgaSA8PSBwYXRoLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGkgPCBwYXRoLmxlbmd0aClcbiAgICAgIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgZWxzZSBpZiAoY29kZSA9PT0gNDcgLyovKi8pXG4gICAgICBicmVhaztcbiAgICBlbHNlXG4gICAgICBjb2RlID0gNDcgLyovKi87XG4gICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICBpZiAobGFzdFNsYXNoID09PSBpIC0gMSB8fCBkb3RzID09PSAxKSB7XG4gICAgICAgIC8vIE5PT1BcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNsYXNoICE9PSBpIC0gMSAmJiBkb3RzID09PSAyKSB7XG4gICAgICAgIGlmIChyZXMubGVuZ3RoIDwgMiB8fCBsYXN0U2VnbWVudExlbmd0aCAhPT0gMiB8fCByZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoIC0gMSkgIT09IDQ2IC8qLiovIHx8IHJlcy5jaGFyQ29kZUF0KHJlcy5sZW5ndGggLSAyKSAhPT0gNDYgLyouKi8pIHtcbiAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHZhciBsYXN0U2xhc2hJbmRleCA9IHJlcy5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgaWYgKGxhc3RTbGFzaEluZGV4ICE9PSByZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICBpZiAobGFzdFNsYXNoSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVzID0gJyc7XG4gICAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlcyA9IHJlcy5zbGljZSgwLCBsYXN0U2xhc2hJbmRleCk7XG4gICAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSByZXMubGVuZ3RoIC0gMSAtIHJlcy5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XG4gICAgICAgICAgICAgIGRvdHMgPSAwO1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcy5sZW5ndGggPT09IDIgfHwgcmVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmVzID0gJyc7XG4gICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gICAgICAgICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgICAgICAgZG90cyA9IDA7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFsbG93QWJvdmVSb290KSB7XG4gICAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgcmVzICs9ICcvLi4nO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlcyA9ICcuLic7XG4gICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgcmVzICs9ICcvJyArIHBhdGguc2xpY2UobGFzdFNsYXNoICsgMSwgaSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXMgPSBwYXRoLnNsaWNlKGxhc3RTbGFzaCArIDEsIGkpO1xuICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IGkgLSBsYXN0U2xhc2ggLSAxO1xuICAgICAgfVxuICAgICAgbGFzdFNsYXNoID0gaTtcbiAgICAgIGRvdHMgPSAwO1xuICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gNDYgLyouKi8gJiYgZG90cyAhPT0gLTEpIHtcbiAgICAgICsrZG90cztcbiAgICB9IGVsc2Uge1xuICAgICAgZG90cyA9IC0xO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBfZm9ybWF0KHNlcCwgcGF0aE9iamVjdCkge1xuICB2YXIgZGlyID0gcGF0aE9iamVjdC5kaXIgfHwgcGF0aE9iamVjdC5yb290O1xuICB2YXIgYmFzZSA9IHBhdGhPYmplY3QuYmFzZSB8fCAocGF0aE9iamVjdC5uYW1lIHx8ICcnKSArIChwYXRoT2JqZWN0LmV4dCB8fCAnJyk7XG4gIGlmICghZGlyKSB7XG4gICAgcmV0dXJuIGJhc2U7XG4gIH1cbiAgaWYgKGRpciA9PT0gcGF0aE9iamVjdC5yb290KSB7XG4gICAgcmV0dXJuIGRpciArIGJhc2U7XG4gIH1cbiAgcmV0dXJuIGRpciArIHNlcCArIGJhc2U7XG59XG5cbnZhciBwb3NpeCA9IHtcbiAgLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxuICByZXNvbHZlOiBmdW5jdGlvbiByZXNvbHZlKCkge1xuICAgIHZhciByZXNvbHZlZFBhdGggPSAnJztcbiAgICB2YXIgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuICAgIHZhciBjd2Q7XG5cbiAgICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgICAgdmFyIHBhdGg7XG4gICAgICBpZiAoaSA+PSAwKVxuICAgICAgICBwYXRoID0gYXJndW1lbnRzW2ldO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChjd2QgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xuICAgICAgICBwYXRoID0gY3dkO1xuICAgICAgfVxuXG4gICAgICBhc3NlcnRQYXRoKHBhdGgpO1xuXG4gICAgICAvLyBTa2lwIGVtcHR5IGVudHJpZXNcbiAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IDQ3IC8qLyovO1xuICAgIH1cblxuICAgIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbiAgICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAgIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICAgIHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHJlc29sdmVkUGF0aCwgIXJlc29sdmVkQWJzb2x1dGUpO1xuXG4gICAgaWYgKHJlc29sdmVkQWJzb2x1dGUpIHtcbiAgICAgIGlmIChyZXNvbHZlZFBhdGgubGVuZ3RoID4gMClcbiAgICAgICAgcmV0dXJuICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuICcvJztcbiAgICB9IGVsc2UgaWYgKHJlc29sdmVkUGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZWRQYXRoO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJy4nO1xuICAgIH1cbiAgfSxcblxuICBub3JtYWxpemU6IGZ1bmN0aW9uIG5vcm1hbGl6ZShwYXRoKSB7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcblxuICAgIHZhciBpc0Fic29sdXRlID0gcGF0aC5jaGFyQ29kZUF0KDApID09PSA0NyAvKi8qLztcbiAgICB2YXIgdHJhaWxpbmdTZXBhcmF0b3IgPSBwYXRoLmNoYXJDb2RlQXQocGF0aC5sZW5ndGggLSAxKSA9PT0gNDcgLyovKi87XG5cbiAgICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgICBwYXRoID0gbm9ybWFsaXplU3RyaW5nUG9zaXgocGF0aCwgIWlzQWJzb2x1dGUpO1xuXG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwICYmICFpc0Fic29sdXRlKSBwYXRoID0gJy4nO1xuICAgIGlmIChwYXRoLmxlbmd0aCA+IDAgJiYgdHJhaWxpbmdTZXBhcmF0b3IpIHBhdGggKz0gJy8nO1xuXG4gICAgaWYgKGlzQWJzb2x1dGUpIHJldHVybiAnLycgKyBwYXRoO1xuICAgIHJldHVybiBwYXRoO1xuICB9LFxuXG4gIGlzQWJzb2x1dGU6IGZ1bmN0aW9uIGlzQWJzb2x1dGUocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG4gICAgcmV0dXJuIHBhdGgubGVuZ3RoID4gMCAmJiBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IDQ3IC8qLyovO1xuICB9LFxuXG4gIGpvaW46IGZ1bmN0aW9uIGpvaW4oKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICByZXR1cm4gJy4nO1xuICAgIHZhciBqb2luZWQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbaV07XG4gICAgICBhc3NlcnRQYXRoKGFyZyk7XG4gICAgICBpZiAoYXJnLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKGpvaW5lZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgIGpvaW5lZCA9IGFyZztcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGpvaW5lZCArPSAnLycgKyBhcmc7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChqb2luZWQgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAnLic7XG4gICAgcmV0dXJuIHBvc2l4Lm5vcm1hbGl6ZShqb2luZWQpO1xuICB9LFxuXG4gIHJlbGF0aXZlOiBmdW5jdGlvbiByZWxhdGl2ZShmcm9tLCB0bykge1xuICAgIGFzc2VydFBhdGgoZnJvbSk7XG4gICAgYXNzZXJ0UGF0aCh0byk7XG5cbiAgICBpZiAoZnJvbSA9PT0gdG8pIHJldHVybiAnJztcblxuICAgIGZyb20gPSBwb3NpeC5yZXNvbHZlKGZyb20pO1xuICAgIHRvID0gcG9zaXgucmVzb2x2ZSh0byk7XG5cbiAgICBpZiAoZnJvbSA9PT0gdG8pIHJldHVybiAnJztcblxuICAgIC8vIFRyaW0gYW55IGxlYWRpbmcgYmFja3NsYXNoZXNcbiAgICB2YXIgZnJvbVN0YXJ0ID0gMTtcbiAgICBmb3IgKDsgZnJvbVN0YXJ0IDwgZnJvbS5sZW5ndGg7ICsrZnJvbVN0YXJ0KSB7XG4gICAgICBpZiAoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCkgIT09IDQ3IC8qLyovKVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdmFyIGZyb21FbmQgPSBmcm9tLmxlbmd0aDtcbiAgICB2YXIgZnJvbUxlbiA9IGZyb21FbmQgLSBmcm9tU3RhcnQ7XG5cbiAgICAvLyBUcmltIGFueSBsZWFkaW5nIGJhY2tzbGFzaGVzXG4gICAgdmFyIHRvU3RhcnQgPSAxO1xuICAgIGZvciAoOyB0b1N0YXJ0IDwgdG8ubGVuZ3RoOyArK3RvU3RhcnQpIHtcbiAgICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQpICE9PSA0NyAvKi8qLylcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHZhciB0b0VuZCA9IHRvLmxlbmd0aDtcbiAgICB2YXIgdG9MZW4gPSB0b0VuZCAtIHRvU3RhcnQ7XG5cbiAgICAvLyBDb21wYXJlIHBhdGhzIHRvIGZpbmQgdGhlIGxvbmdlc3QgY29tbW9uIHBhdGggZnJvbSByb290XG4gICAgdmFyIGxlbmd0aCA9IGZyb21MZW4gPCB0b0xlbiA/IGZyb21MZW4gOiB0b0xlbjtcbiAgICB2YXIgbGFzdENvbW1vblNlcCA9IC0xO1xuICAgIHZhciBpID0gMDtcbiAgICBmb3IgKDsgaSA8PSBsZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGkgPT09IGxlbmd0aCkge1xuICAgICAgICBpZiAodG9MZW4gPiBsZW5ndGgpIHtcbiAgICAgICAgICBpZiAodG8uY2hhckNvZGVBdCh0b1N0YXJ0ICsgaSkgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgZnJvbWAgaXMgdGhlIGV4YWN0IGJhc2UgcGF0aCBmb3IgYHRvYC5cbiAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhcic7IHRvPScvZm9vL2Jhci9iYXonXG4gICAgICAgICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCArIGkgKyAxKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGBmcm9tYCBpcyB0aGUgcm9vdFxuICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy8nOyB0bz0nL2ZvbydcbiAgICAgICAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0ICsgaSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGZyb21MZW4gPiBsZW5ndGgpIHtcbiAgICAgICAgICBpZiAoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCArIGkpID09PSA0NyAvKi8qLykge1xuICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYHRvYCBpcyB0aGUgZXhhY3QgYmFzZSBwYXRoIGZvciBgZnJvbWAuXG4gICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nL2Zvby9iYXIvYmF6JzsgdG89Jy9mb28vYmFyJ1xuICAgICAgICAgICAgbGFzdENvbW1vblNlcCA9IGk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgdG9gIGlzIHRoZSByb290LlxuICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy9mb28nOyB0bz0nLydcbiAgICAgICAgICAgIGxhc3RDb21tb25TZXAgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHZhciBmcm9tQ29kZSA9IGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKTtcbiAgICAgIHZhciB0b0NvZGUgPSB0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKTtcbiAgICAgIGlmIChmcm9tQ29kZSAhPT0gdG9Db2RlKVxuICAgICAgICBicmVhaztcbiAgICAgIGVsc2UgaWYgKGZyb21Db2RlID09PSA0NyAvKi8qLylcbiAgICAgICAgbGFzdENvbW1vblNlcCA9IGk7XG4gICAgfVxuXG4gICAgdmFyIG91dCA9ICcnO1xuICAgIC8vIEdlbmVyYXRlIHRoZSByZWxhdGl2ZSBwYXRoIGJhc2VkIG9uIHRoZSBwYXRoIGRpZmZlcmVuY2UgYmV0d2VlbiBgdG9gXG4gICAgLy8gYW5kIGBmcm9tYFxuICAgIGZvciAoaSA9IGZyb21TdGFydCArIGxhc3RDb21tb25TZXAgKyAxOyBpIDw9IGZyb21FbmQ7ICsraSkge1xuICAgICAgaWYgKGkgPT09IGZyb21FbmQgfHwgZnJvbS5jaGFyQ29kZUF0KGkpID09PSA0NyAvKi8qLykge1xuICAgICAgICBpZiAob3V0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICBvdXQgKz0gJy4uJztcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG91dCArPSAnLy4uJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMYXN0bHksIGFwcGVuZCB0aGUgcmVzdCBvZiB0aGUgZGVzdGluYXRpb24gKGB0b2ApIHBhdGggdGhhdCBjb21lcyBhZnRlclxuICAgIC8vIHRoZSBjb21tb24gcGF0aCBwYXJ0c1xuICAgIGlmIChvdXQubGVuZ3RoID4gMClcbiAgICAgIHJldHVybiBvdXQgKyB0by5zbGljZSh0b1N0YXJ0ICsgbGFzdENvbW1vblNlcCk7XG4gICAgZWxzZSB7XG4gICAgICB0b1N0YXJ0ICs9IGxhc3RDb21tb25TZXA7XG4gICAgICBpZiAodG8uY2hhckNvZGVBdCh0b1N0YXJ0KSA9PT0gNDcgLyovKi8pXG4gICAgICAgICsrdG9TdGFydDtcbiAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0KTtcbiAgICB9XG4gIH0sXG5cbiAgX21ha2VMb25nOiBmdW5jdGlvbiBfbWFrZUxvbmcocGF0aCkge1xuICAgIHJldHVybiBwYXRoO1xuICB9LFxuXG4gIGRpcm5hbWU6IGZ1bmN0aW9uIGRpcm5hbWUocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gJy4nO1xuICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KDApO1xuICAgIHZhciBoYXNSb290ID0gY29kZSA9PT0gNDcgLyovKi87XG4gICAgdmFyIGVuZCA9IC0xO1xuICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAgIGZvciAodmFyIGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMTsgLS1pKSB7XG4gICAgICBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yXG4gICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbmQgPT09IC0xKSByZXR1cm4gaGFzUm9vdCA/ICcvJyA6ICcuJztcbiAgICBpZiAoaGFzUm9vdCAmJiBlbmQgPT09IDEpIHJldHVybiAnLy8nO1xuICAgIHJldHVybiBwYXRoLnNsaWNlKDAsIGVuZCk7XG4gIH0sXG5cbiAgYmFzZW5hbWU6IGZ1bmN0aW9uIGJhc2VuYW1lKHBhdGgsIGV4dCkge1xuICAgIGlmIChleHQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZXh0ICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJleHRcIiBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICAgIHZhciBzdGFydCA9IDA7XG4gICAgdmFyIGVuZCA9IC0xO1xuICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAgIHZhciBpO1xuXG4gICAgaWYgKGV4dCAhPT0gdW5kZWZpbmVkICYmIGV4dC5sZW5ndGggPiAwICYmIGV4dC5sZW5ndGggPD0gcGF0aC5sZW5ndGgpIHtcbiAgICAgIGlmIChleHQubGVuZ3RoID09PSBwYXRoLmxlbmd0aCAmJiBleHQgPT09IHBhdGgpIHJldHVybiAnJztcbiAgICAgIHZhciBleHRJZHggPSBleHQubGVuZ3RoIC0gMTtcbiAgICAgIHZhciBmaXJzdE5vblNsYXNoRW5kID0gLTE7XG4gICAgICBmb3IgKGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXG4gICAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcbiAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XG4gICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGZpcnN0Tm9uU2xhc2hFbmQgPT09IC0xKSB7XG4gICAgICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgcmVtZW1iZXIgdGhpcyBpbmRleCBpbiBjYXNlXG4gICAgICAgICAgICAvLyB3ZSBuZWVkIGl0IGlmIHRoZSBleHRlbnNpb24gZW5kcyB1cCBub3QgbWF0Y2hpbmdcbiAgICAgICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgICAgICAgZmlyc3ROb25TbGFzaEVuZCA9IGkgKyAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZXh0SWR4ID49IDApIHtcbiAgICAgICAgICAgIC8vIFRyeSB0byBtYXRjaCB0aGUgZXhwbGljaXQgZXh0ZW5zaW9uXG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gZXh0LmNoYXJDb2RlQXQoZXh0SWR4KSkge1xuICAgICAgICAgICAgICBpZiAoLS1leHRJZHggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgbWF0Y2hlZCB0aGUgZXh0ZW5zaW9uLCBzbyBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXIgcGF0aFxuICAgICAgICAgICAgICAgIC8vIGNvbXBvbmVudFxuICAgICAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIEV4dGVuc2lvbiBkb2VzIG5vdCBtYXRjaCwgc28gb3VyIHJlc3VsdCBpcyB0aGUgZW50aXJlIHBhdGhcbiAgICAgICAgICAgICAgLy8gY29tcG9uZW50XG4gICAgICAgICAgICAgIGV4dElkeCA9IC0xO1xuICAgICAgICAgICAgICBlbmQgPSBmaXJzdE5vblNsYXNoRW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc3RhcnQgPT09IGVuZCkgZW5kID0gZmlyc3ROb25TbGFzaEVuZDtlbHNlIGlmIChlbmQgPT09IC0xKSBlbmQgPSBwYXRoLmxlbmd0aDtcbiAgICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGlmIChwYXRoLmNoYXJDb2RlQXQoaSkgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxuICAgICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XG4gICAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGVuZCA9PT0gLTEpIHtcbiAgICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAgICAgLy8gcGF0aCBjb21wb25lbnRcbiAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgICBlbmQgPSBpICsgMTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZW5kID09PSAtMSkgcmV0dXJuICcnO1xuICAgICAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgfVxuICB9LFxuXG4gIGV4dG5hbWU6IGZ1bmN0aW9uIGV4dG5hbWUocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG4gICAgdmFyIHN0YXJ0RG90ID0gLTE7XG4gICAgdmFyIHN0YXJ0UGFydCA9IDA7XG4gICAgdmFyIGVuZCA9IC0xO1xuICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAgIC8vIFRyYWNrIHRoZSBzdGF0ZSBvZiBjaGFyYWN0ZXJzIChpZiBhbnkpIHdlIHNlZSBiZWZvcmUgb3VyIGZpcnN0IGRvdCBhbmRcbiAgICAvLyBhZnRlciBhbnkgcGF0aCBzZXBhcmF0b3Igd2UgZmluZFxuICAgIHZhciBwcmVEb3RTdGF0ZSA9IDA7XG4gICAgZm9yICh2YXIgaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcbiAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXJcbiAgICAgICAgLy8gZXh0ZW5zaW9uXG4gICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgICBlbmQgPSBpICsgMTtcbiAgICAgIH1cbiAgICAgIGlmIChjb2RlID09PSA0NiAvKi4qLykge1xuICAgICAgICAgIC8vIElmIHRoaXMgaXMgb3VyIGZpcnN0IGRvdCwgbWFyayBpdCBhcyB0aGUgc3RhcnQgb2Ygb3VyIGV4dGVuc2lvblxuICAgICAgICAgIGlmIChzdGFydERvdCA9PT0gLTEpXG4gICAgICAgICAgICBzdGFydERvdCA9IGk7XG4gICAgICAgICAgZWxzZSBpZiAocHJlRG90U3RhdGUgIT09IDEpXG4gICAgICAgICAgICBwcmVEb3RTdGF0ZSA9IDE7XG4gICAgICB9IGVsc2UgaWYgKHN0YXJ0RG90ICE9PSAtMSkge1xuICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxuICAgICAgICAvLyBoYXZlIGEgZ29vZCBjaGFuY2UgYXQgaGF2aW5nIGEgbm9uLWVtcHR5IGV4dGVuc2lvblxuICAgICAgICBwcmVEb3RTdGF0ZSA9IC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdGFydERvdCA9PT0gLTEgfHwgZW5kID09PSAtMSB8fFxuICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGNoYXJhY3RlciBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGRvdFxuICAgICAgICBwcmVEb3RTdGF0ZSA9PT0gMCB8fFxuICAgICAgICAvLyBUaGUgKHJpZ2h0LW1vc3QpIHRyaW1tZWQgcGF0aCBjb21wb25lbnQgaXMgZXhhY3RseSAnLi4nXG4gICAgICAgIHByZURvdFN0YXRlID09PSAxICYmIHN0YXJ0RG90ID09PSBlbmQgLSAxICYmIHN0YXJ0RG90ID09PSBzdGFydFBhcnQgKyAxKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0RG90LCBlbmQpO1xuICB9LFxuXG4gIGZvcm1hdDogZnVuY3Rpb24gZm9ybWF0KHBhdGhPYmplY3QpIHtcbiAgICBpZiAocGF0aE9iamVjdCA9PT0gbnVsbCB8fCB0eXBlb2YgcGF0aE9iamVjdCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBcInBhdGhPYmplY3RcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgT2JqZWN0LiBSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2YgcGF0aE9iamVjdCk7XG4gICAgfVxuICAgIHJldHVybiBfZm9ybWF0KCcvJywgcGF0aE9iamVjdCk7XG4gIH0sXG5cbiAgcGFyc2U6IGZ1bmN0aW9uIHBhcnNlKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuXG4gICAgdmFyIHJldCA9IHsgcm9vdDogJycsIGRpcjogJycsIGJhc2U6ICcnLCBleHQ6ICcnLCBuYW1lOiAnJyB9O1xuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJldDtcbiAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdCgwKTtcbiAgICB2YXIgaXNBYnNvbHV0ZSA9IGNvZGUgPT09IDQ3IC8qLyovO1xuICAgIHZhciBzdGFydDtcbiAgICBpZiAoaXNBYnNvbHV0ZSkge1xuICAgICAgcmV0LnJvb3QgPSAnLyc7XG4gICAgICBzdGFydCA9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgdmFyIHN0YXJ0RG90ID0gLTE7XG4gICAgdmFyIHN0YXJ0UGFydCA9IDA7XG4gICAgdmFyIGVuZCA9IC0xO1xuICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAgIHZhciBpID0gcGF0aC5sZW5ndGggLSAxO1xuXG4gICAgLy8gVHJhY2sgdGhlIHN0YXRlIG9mIGNoYXJhY3RlcnMgKGlmIGFueSkgd2Ugc2VlIGJlZm9yZSBvdXIgZmlyc3QgZG90IGFuZFxuICAgIC8vIGFmdGVyIGFueSBwYXRoIHNlcGFyYXRvciB3ZSBmaW5kXG4gICAgdmFyIHByZURvdFN0YXRlID0gMDtcblxuICAgIC8vIEdldCBub24tZGlyIGluZm9cbiAgICBmb3IgKDsgaSA+PSBzdGFydDsgLS1pKSB7XG4gICAgICBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcbiAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXJcbiAgICAgICAgLy8gZXh0ZW5zaW9uXG4gICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgICBlbmQgPSBpICsgMTtcbiAgICAgIH1cbiAgICAgIGlmIChjb2RlID09PSA0NiAvKi4qLykge1xuICAgICAgICAgIC8vIElmIHRoaXMgaXMgb3VyIGZpcnN0IGRvdCwgbWFyayBpdCBhcyB0aGUgc3RhcnQgb2Ygb3VyIGV4dGVuc2lvblxuICAgICAgICAgIGlmIChzdGFydERvdCA9PT0gLTEpIHN0YXJ0RG90ID0gaTtlbHNlIGlmIChwcmVEb3RTdGF0ZSAhPT0gMSkgcHJlRG90U3RhdGUgPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXJ0RG90ICE9PSAtMSkge1xuICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxuICAgICAgICAvLyBoYXZlIGEgZ29vZCBjaGFuY2UgYXQgaGF2aW5nIGEgbm9uLWVtcHR5IGV4dGVuc2lvblxuICAgICAgICBwcmVEb3RTdGF0ZSA9IC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdGFydERvdCA9PT0gLTEgfHwgZW5kID09PSAtMSB8fFxuICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgY2hhcmFjdGVyIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZG90XG4gICAgcHJlRG90U3RhdGUgPT09IDAgfHxcbiAgICAvLyBUaGUgKHJpZ2h0LW1vc3QpIHRyaW1tZWQgcGF0aCBjb21wb25lbnQgaXMgZXhhY3RseSAnLi4nXG4gICAgcHJlRG90U3RhdGUgPT09IDEgJiYgc3RhcnREb3QgPT09IGVuZCAtIDEgJiYgc3RhcnREb3QgPT09IHN0YXJ0UGFydCArIDEpIHtcbiAgICAgIGlmIChlbmQgIT09IC0xKSB7XG4gICAgICAgIGlmIChzdGFydFBhcnQgPT09IDAgJiYgaXNBYnNvbHV0ZSkgcmV0LmJhc2UgPSByZXQubmFtZSA9IHBhdGguc2xpY2UoMSwgZW5kKTtlbHNlIHJldC5iYXNlID0gcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgZW5kKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHN0YXJ0UGFydCA9PT0gMCAmJiBpc0Fic29sdXRlKSB7XG4gICAgICAgIHJldC5uYW1lID0gcGF0aC5zbGljZSgxLCBzdGFydERvdCk7XG4gICAgICAgIHJldC5iYXNlID0gcGF0aC5zbGljZSgxLCBlbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgc3RhcnREb3QpO1xuICAgICAgICByZXQuYmFzZSA9IHBhdGguc2xpY2Uoc3RhcnRQYXJ0LCBlbmQpO1xuICAgICAgfVxuICAgICAgcmV0LmV4dCA9IHBhdGguc2xpY2Uoc3RhcnREb3QsIGVuZCk7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0UGFydCA+IDApIHJldC5kaXIgPSBwYXRoLnNsaWNlKDAsIHN0YXJ0UGFydCAtIDEpO2Vsc2UgaWYgKGlzQWJzb2x1dGUpIHJldC5kaXIgPSAnLyc7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9LFxuXG4gIHNlcDogJy8nLFxuICBkZWxpbWl0ZXI6ICc6JyxcbiAgd2luMzI6IG51bGwsXG4gIHBvc2l4OiBudWxsXG59O1xuXG5wb3NpeC5wb3NpeCA9IHBvc2l4O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBvc2l4O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgbWluaW1hdGNoXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIm1pbmltYXRjaFwiKSk7XG52YXIgc25pZmZfMSA9IHJlcXVpcmUoXCJAdGdpYXJkaW5hL3NuaWZmXCIpO1xudmFyIFByb3RvY29sO1xuKGZ1bmN0aW9uIChQcm90b2NvbCkge1xuICAgIFByb3RvY29sW1Byb3RvY29sW1wiQW55XCJdID0gMF0gPSBcIkFueVwiO1xuICAgIFByb3RvY29sW1Byb3RvY29sW1wiSHR0cFwiXSA9IDFdID0gXCJIdHRwXCI7XG4gICAgUHJvdG9jb2xbUHJvdG9jb2xbXCJXc1wiXSA9IDJdID0gXCJXc1wiO1xufSkoUHJvdG9jb2wgfHwgKFByb3RvY29sID0ge30pKTtcbmZ1bmN0aW9uIGdldFByb3RvY29sKCkge1xuICAgIHZhciBwcm90b2NvbFN0cmluZyA9IHByb2Nlc3MuZW52LlBST1RPQ09MO1xuICAgIHZhciBwcm90b2NvbDtcbiAgICBpZiAoIXByb3RvY29sU3RyaW5nIHx8IHByb3RvY29sU3RyaW5nID09PSBcImFueVwiKSB7XG4gICAgICAgIHByb3RvY29sID0gUHJvdG9jb2wuQW55O1xuICAgIH1cbiAgICBlbHNlIGlmIChwcm90b2NvbFN0cmluZyA9PT0gXCJodHRwXCIpIHtcbiAgICAgICAgcHJvdG9jb2wgPSBQcm90b2NvbC5IdHRwO1xuICAgIH1cbiAgICBlbHNlIGlmIChwcm90b2NvbFN0cmluZyA9PT0gXCJ3c1wiKSB7XG4gICAgICAgIHByb3RvY29sID0gUHJvdG9jb2wuV3M7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIFByb3RvY29sIFxcXCJcIiArIHByb3RvY29sU3RyaW5nICsgXCJcXFwiLiBQbGVhc2UgY2hvb3NlIFxcXCJhbnlcXFwiLCBcXFwiaHR0cFxcXCIsIG9yIFxcXCJ3c1xcXCJcIik7XG4gICAgfVxuICAgIHJldHVybiBwcm90b2NvbDtcbn1cbmZ1bmN0aW9uIGlzTWF0Y2godXJsLCB1cmxzKSB7XG4gICAgaWYgKCF1cmxzIHx8IHVybHMubGVuZ3RoKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgICB1cmxzID0gdXJscy5yZXBsYWNlKFwiW1wiLCBcIlwiKTtcbiAgICAgICAgdXJscyA9IHVybHMucmVwbGFjZShcIl1cIiwgXCJcIik7XG4gICAgICAgIHVybHMgPSB1cmxzLnJlcGxhY2UoL1wiL2csIFwiXCIpO1xuICAgICAgICB1cmxzID0gdXJscy5yZXBsYWNlKC8nL2csIFwiXCIpO1xuICAgICAgICB1cmxzID0gdXJscy5yZXBsYWNlKC8gL2csIFwiXCIpO1xuICAgICAgICB2YXIgc3BsaXQgPSB1cmxzLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBzcGxpdF8xID0gc3BsaXQ7IF9pIDwgc3BsaXRfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciB1cmxSZWdleCA9IHNwbGl0XzFbX2ldO1xuICAgICAgICAgICAgaWYgKG1pbmltYXRjaF8xLmRlZmF1bHQodXJsLCB1cmxSZWdleCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdXJscyBcXFwiXCIgKyB1cmxzICsgXCJcXFwiLiBNdXN0IGJlIG9mIGZvcm1hdCBcXFwiW1xcXCJ1cmwxXFxcIiwgXFxcInVybDJcXFwiXVxcXCJcIik7XG4gICAgfVxufVxuZnVuY3Rpb24gc25pZmYocHJvdG9jb2wsIG1zZykge1xuICAgIHZhciBfaXNNYXRjaCA9IGlzTWF0Y2gobXNnLnNyY1VybCwgcHJvY2Vzcy5lbnYuU1JDX1VSTFMpICYmXG4gICAgICAgIGlzTWF0Y2gobXNnLnRhcmdldFVybCwgcHJvY2Vzcy5lbnYuVEFSR0VUX1VSTFMpO1xuICAgIGlmIChfaXNNYXRjaClcbiAgICAgICAgY29uc29sZS5sb2cobXNnLnNyY1VybCArIFwiIHJlY2VpdmVkIFwiICsgcHJvdG9jb2wgKyBcIiBtZXNzYWdlIGZyb20gXCIgKyBtc2cudGFyZ2V0VXJsICsgXCI6XFxuXCIgKyBtc2cuZGF0YSk7XG59XG5jb25zb2xlLmxvZyhcIlN1Y2Nlc3NmdWxseSBsb2FkZWQhXCIpO1xuY29uc29sZS5sb2coXCJPcGVuIGEgbmV3IHRhYiB0byBzdGFydCBzbmlmZmluZyB0cmFmZmljLlwiKTtcbnZhciBwcm90b2NvbCA9IGdldFByb3RvY29sKCk7XG5pZiAocHJvdG9jb2wgPT09IFByb3RvY29sLkFueSB8fCBwcm90b2NvbCA9PT0gUHJvdG9jb2wuSHR0cCkge1xuICAgIHNuaWZmXzEuc25pZmZIdHRwKGZ1bmN0aW9uIChtc2cpIHsgcmV0dXJuIHNuaWZmKFwiaHR0cFwiLCBtc2cpOyB9KTtcbn1cbmlmIChwcm90b2NvbCA9PT0gUHJvdG9jb2wuQW55IHx8IHByb3RvY29sID09PSBQcm90b2NvbC5Xcykge1xuICAgIHNuaWZmXzEuc25pZmZXcyhmdW5jdGlvbiAobXNnKSB7IHJldHVybiBzbmlmZihcIndzXCIsIG1zZyk7IH0pO1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZVxuX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2JhY2tncm91bmQudHNcIik7XG4vLyBUaGlzIGVudHJ5IG1vZHVsZSB1c2VkICdleHBvcnRzJyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG4iXSwic291cmNlUm9vdCI6IiJ9