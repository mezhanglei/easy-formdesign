export default [
  /* POLYFILL START */
  "Object.defineProperty(RegExp.prototype, 'test',",
  "{configurable: true, writable: true, value:",
  "function test(str) {",
  "return !!this.exec(str);",
  "}",
  "});"
  /* POLYFILL END */
];
