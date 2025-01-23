import ArrayPolyfill from "./Array";
import FunctionPolyfill from "./Function";
import ObjectPolyfill from "./Object";
import StringPolyfill from "./String";
import RegExpPolyfill from "./RegExp";

export default FunctionPolyfill.concat(ObjectPolyfill, ArrayPolyfill, StringPolyfill, RegExpPolyfill);
