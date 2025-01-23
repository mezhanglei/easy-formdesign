// Completion Value Types.
const Completion = {
  NORMAL: 0,
  BREAK: 1,
  CONTINUE: 2,
  RETURN: 3,
  THROW: 4,
};
// Interpreter status
const Status = {
  'DONE': 0,
  'STEP': 1,
  'TASK': 2,
  'ASYNC': 3,
};
// used for all Acorn parsing.
const PARSE_OPTIONS = {
  locations: true,
  ecmaVersion: 5, // Needed in the event a version > 0.5.0 of Acorn is used.
};
// Property descriptor of readonly properties.
const READONLY_DESCRIPTOR = {
  'configurable': true,
  'enumerable': true,
  'writable': false,
};
// Property descriptor of non-enumerable properties.
const NONENUMERABLE_DESCRIPTOR = {
  'configurable': true,
  'enumerable': false,
  'writable': true,
};
// Property descriptor of readonly, non-enumerable properties.
const READONLY_NONENUMERABLE_DESCRIPTOR = {
  'configurable': true,
  'enumerable': false,
  'writable': false,
};
// Property descriptor of non-configurable, readonly, non-enumerable properties.
const NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR = {
  'configurable': false,
  'enumerable': false,
  'writable': false,
};
// Property descriptor of variables.
const VARIABLE_DESCRIPTOR = {
  'configurable': false,
  'enumerable': true,
  'writable': true,
};
/**
 * Unique symbol for indicating that a step has encountered an error, has
 * added it to the stack, and will be thrown within the user's program.
 * When STEP_ERROR is thrown in the JS-Interpreter, the error can be ignored.
*/
const STEP_ERROR = { 'STEP_ERROR': true };
// 变量引用的唯一符号
const SCOPE_REFERENCE = { 'SCOPE_REFERENCE': true };
/**
 * Unique symbol for indicating, when used as the value of the value
 * parameter in calls to setProperty and friends, that the value
 * should be taken from the property descriptor instead.
*/
const VALUE_IN_DESCRIPTOR = { 'VALUE_IN_DESCRIPTOR': true };
// Unique symbol for indicating that a RegExp timeout has occurred in a VM.
const REGEXP_TIMEOUT = { 'REGEXP_TIMEOUT': true };
// Node's vm module, if loaded and required.
const vm = null;
// Code for executing regular expressions in a thread.
const WORKER_CODE = [
  "onmessage = function(e) {",
  "var result;",
  "var data = e.data;",
  "switch (data[0]) {",
  "case 'split':",
  // ['split', string, separator, limit]
  "result = data[1].split(data[2], data[3]);",
  "break;",
  "case 'match':",
  // ['match', string, regexp]
  "result = data[1].match(data[2]);",
  "break;",
  "case 'search':",
  // ['search', string, regexp]
  "result = data[1].search(data[2]);",
  "break;",
  "case 'replace':",
  // ['replace', string, regexp, newSubstr]
  "result = data[1].replace(data[2], data[3]);",
  "break;",
  "case 'exec':",
  // ['exec', regexp, lastIndex, string]
  "var regexp = data[1];",
  "regexp.lastIndex = data[2];",
  "result = [regexp.exec(data[3]), data[1].lastIndex];",
  "break;",
  "default:",
  "throw Error('Unknown RegExp operation: ' + data[0]);",
  "}",
  "postMessage(result);",
  "close();",
  "};"];

const placeholderGet_ =
  function () { throw Error('Placeholder getter'); };
const placeholderSet_ =
  function () { throw Error('Placeholder setter'); };

export const Constants = {
  Completion,
  Status,
  PARSE_OPTIONS,
  READONLY_DESCRIPTOR,
  NONENUMERABLE_DESCRIPTOR,
  READONLY_NONENUMERABLE_DESCRIPTOR,
  NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR,
  VARIABLE_DESCRIPTOR,
  STEP_ERROR,
  SCOPE_REFERENCE,
  VALUE_IN_DESCRIPTOR,
  REGEXP_TIMEOUT,
  vm,
  WORKER_CODE,
  placeholderGet_,
  placeholderSet_,
};
