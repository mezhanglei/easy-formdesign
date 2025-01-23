export default [
  /* POLYFILL START */
  "(function() {",
  "var create_ = Object.create;",
  "Object.create = function create(proto, props) {",
  "var obj = create_(proto);",
  "props && Object.defineProperties(obj, props);",
  "return obj;",
  "};",
  "})();",
  ""
  /* POLYFILL END */,
  // Flatten the descriptor to remove any inheritance or getter functions.
  /* POLYFILL START */
  "(function() {",
  "var defineProperty_ = Object.defineProperty;",
  "Object.defineProperty = function defineProperty(obj, prop, d1) {",
  "var d2 = {};",
  "if ('configurable' in d1) d2.configurable = d1.configurable;",
  "if ('enumerable' in d1) d2.enumerable = d1.enumerable;",
  "if ('writable' in d1) d2.writable = d1.writable;",
  "if ('value' in d1) d2.value = d1.value;",
  "if ('get' in d1) d2.get = d1.get;",
  "if ('set' in d1) d2.set = d1.set;",
  "return defineProperty_(obj, prop, d2);",
  "};",
  "})();",

  "Object.defineProperty(Object, 'defineProperties',",
  "{configurable: true, writable: true, value:",
  "function defineProperties(obj, props) {",
  "var keys = Object.keys(props);",
  "for (var i = 0; i < keys.length; i++) {",
  "Object.defineProperty(obj, keys[i], props[keys[i]]);",
  "}",
  "return obj;",
  "}",
  "});",
  ""
  /* POLYFILL END */
];
