"use strict";

var _asyncIterator2 = require("babel-runtime/helpers/asyncIterator");

var _asyncIterator3 = _interopRequireDefault(_asyncIterator2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stream = require("stream");

var _ava = require("ava");

var _ava2 = _interopRequireDefault(_ava);

var _promiseFs = require("promise-fs");

var _StreamIterator = require("../../lib/util/StreamIterator");

var _StreamIterator2 = _interopRequireDefault(_StreamIterator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _ava2.default)("Should have a \"next\" method", t => {
  t.plan(1);

  const iterator = new _StreamIterator2.default((0, _promiseFs.createReadStream)(__filename));

  t.is(typeof iterator.next, "function");
});

(0, _ava2.default)("The next method should return a Promise", (() => {
  var _ref = (0, _asyncToGenerator3.default)(function* (t) {
    t.plan(1);

    const stream = new _stream.Readable({
      read() {
        this.push(null);
      }
    });

    const iterator = new _StreamIterator2.default(stream);

    const actual = iterator.next();

    t.true(actual instanceof _promise2.default);

    yield actual;
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})());

(0, _ava2.default)("Should return a value in correct format", (() => {
  var _ref2 = (0, _asyncToGenerator3.default)(function* (t) {
    t.plan(3);

    const stream = new _stream.Readable({
      read() {/* noop */}
    });

    stream.push(Buffer.from("I've seen things you people wouldn't believe"));

    const iterator = new _StreamIterator2.default(stream);

    const actual = yield iterator.next();

    stream.push(null);

    t.deepEqual((0, _keys2.default)(actual).sort(), ["done", "value"]);
    t.is(String(actual.value), "I've seen things you people wouldn't believe");
    t.false(actual.done);
  });

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
})());

(0, _ava2.default)("Should return corectly object on stream ending", (() => {
  var _ref3 = (0, _asyncToGenerator3.default)(function* (t) {
    t.plan(1);

    const stream = new _stream.Readable({
      read() {
        this.push(null);
      }
    });

    const iterator = new _StreamIterator2.default(stream);

    const actual = yield iterator.next();

    t.deepEqual(actual, {
      done: true,
      value: void 0
    });
  });

  return function (_x3) {
    return _ref3.apply(this, arguments);
  };
})());

(0, _ava2.default)("Should corectly reat a content from the stream", (() => {
  var _ref4 = (0, _asyncToGenerator3.default)(function* (t) {
    const iterator = new _StreamIterator2.default((0, _promiseFs.createReadStream)("/usr/share/dict/words"));

    const chunks = [];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _asyncIterator3.default)(iterator), _step, _value; _step = yield _iterator.next(), _iteratorNormalCompletion = _step.done, _value = yield _step.value, !_iteratorNormalCompletion; _iteratorNormalCompletion = true) {
        const chunk = _value;

        chunks.push(chunk);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          yield _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    const expected = yield (0, _promiseFs.readFile)("/usr/share/dict/words");
    const actual = Buffer.concat(chunks);

    t.true(actual.equals(expected));
  });

  return function (_x4) {
    return _ref4.apply(this, arguments);
  };
})());