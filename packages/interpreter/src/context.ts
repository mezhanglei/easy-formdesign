import { Constants } from "./constants";
import { ObjectConstructor, ScopeConstructor } from "./constructor";
import { AcornSourceLocation } from "./typings";
import { bindClassPrototype, isInherit, legalArrayIndex, legalArrayLength } from "./utils";

// 解释器-执行环境上下文
class Context {
  static Completion = Constants.Completion;
  static Status = Constants.Status;
  static PARSE_OPTIONS = Constants.PARSE_OPTIONS;
  static READONLY_DESCRIPTOR = Constants.READONLY_DESCRIPTOR;
  static NONENUMERABLE_DESCRIPTOR = Constants.NONENUMERABLE_DESCRIPTOR;
  static READONLY_NONENUMERABLE_DESCRIPTOR = Constants.READONLY_NONENUMERABLE_DESCRIPTOR;
  static NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR = Constants.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR;
  static VARIABLE_DESCRIPTOR = Constants.VARIABLE_DESCRIPTOR;
  static STEP_ERROR = Constants.STEP_ERROR;
  static SCOPE_REFERENCE = Constants.SCOPE_REFERENCE;
  static VALUE_IN_DESCRIPTOR = Constants.VALUE_IN_DESCRIPTOR;
  static REGEXP_TIMEOUT = Constants.REGEXP_TIMEOUT;
  static vm = Constants.vm;
  static WORKER_CODE = Constants.WORKER_CODE;
  static placeholderGet_ = Constants.placeholderGet_;
  static placeholderSet_ = Constants.placeholderSet_;
  static Object = ObjectConstructor;
  static Scope = ScopeConstructor;

  OBJECT_PROTO?: ObjectConstructor;
  FUNCTION_PROTO?: ObjectConstructor;
  getterStep_?: boolean; // 对象的getter访问开关
  setterStep_?: boolean; // 对象的setter访问开关
  globalScope?: ScopeConstructor;
  constructor(initFunc) {
    bindClassPrototype(Context, this);
    this.initGlobal(initFunc);
  }

  // 初始化环境
  initGlobal(initFunc?) {
    const object = new Context.Object(null);
    this.globalScope = new Context.Scope(null, false, object);
    this.OBJECT_PROTO = new Context.Object(null);
    this.FUNCTION_PROTO = new Context.Object(this.OBJECT_PROTO);
  }
};

export {
  Context
};
