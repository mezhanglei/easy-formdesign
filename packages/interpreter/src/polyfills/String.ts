export default [
  /* POLYFILL START */
  "(function() {",
  "var replace_ = String.prototype.replace;",
  "String.prototype.replace = function replace(substr, newSubstr) {",
  "if (typeof newSubstr !== 'function') {",
  // string.replace(string|regexp, string)
  "return replace_.call(this, substr, newSubstr);",
  "}",
  "var str = this;",
  "if (substr instanceof RegExp) {",
  // string.replace(regexp, function)
  "var subs = [];",
  "var m = substr.exec(str);",
  "while (m) {",
  "m.push(m.index, str);",
  "var inject = newSubstr.apply(null, m);",
  "subs.push([m.index, m[0].length, inject]);",
  "m = substr.global ? substr.exec(str) : null;",
  "}",
  "for (var i = subs.length - 1; i >= 0; i--) {",
  "str = str.substring(0, subs[i][0]) + subs[i][2] + ",
  "str.substring(subs[i][0] + subs[i][1]);",
  "}",
  "} else {",
  // string.replace(string, function)
  "var i = str.indexOf(substr);",
  "if (i !== -1) {",
  "var inject = newSubstr(str.substr(i, substr.length), i, str);",
  "str = str.substring(0, i) + inject + ",
  "str.substring(i + substr.length);",
  "}",
  "}",
  "return str;",
  "};",
  "})();",
  ""
  /* POLYFILL END */
];
