export default [
  /* POLYFILL START */
  // Flatten the apply args list to remove any inheritance or getter functions.
  "(function() {",
  "var apply_ = Function.prototype.apply;",
  "Function.prototype.apply = function apply(thisArg, args) {",
  "var a2 = [];",
  "for (var i = 0; i < args.length; i++) {",
  "a2[i] = args[i];",
  "}",
  "return apply_(this, thisArg, a2);", // Note: Non-standard 'this' arg.
  "};",
  "})();"
  /* POLYFILL END */,
  /* POLYFILL START */
  // Polyfill copied from:
  // developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_objects/Function/bind
  "Object.defineProperty(Function.prototype, 'bind',",
  "{configurable: true, writable: true, value:",
  "function bind(oThis) {",
  "if (typeof this !== 'function') {",
  "throw TypeError('What is trying to be bound is not callable');",
  "}",
  "var aArgs   = Array.prototype.slice.call(arguments, 1),",
  "fToBind = this,",
  "fNOP    = function() {},",
  "fBound  = function() {",
  "return fToBind.apply(this instanceof fNOP",
  "? this",
  ": oThis,",
  "aArgs.concat(Array.prototype.slice.call(arguments)));",
  "};",
  "if (this.prototype) {",
  "fNOP.prototype = this.prototype;",
  "}",
  "fBound.prototype = new fNOP();",
  "return fBound;",
  "}",
  "});",
  ""
  /* POLYFILL END */
];
