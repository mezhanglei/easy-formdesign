import { deepGet, deepSet, getValuePropName, comparePrefix, FormPathType, isValidFormName, isEqualName } from './utils/utils';
import { deepClone } from './utils/object';
import { handleRules, isCanTrigger } from './validator';
import { getRulesTriggers, mergeTriggers } from './core';
import { isEmpty, isObject } from './utils/type';
import { FormItemProps } from './form-item';
import { GetMapValueType, PathValue } from './typings';

const bindClassPrototype = (Factory, instance) => {
  const attrs = Object.getOwnPropertyDescriptors(Factory?.prototype);
  for (const key in attrs) {
    const attr = instance[key];
    if (typeof attr === 'function' && key !== 'constructor') {
      instance[key] = instance[key].bind(instance);
    }
  }
};

export type FormListener<V> = { path: FormPathType, onChange: (newValue?: V, oldValue?: V) => void }

export type FormErrors = Map<FormPathType, string | boolean>;

export type FieldProps = FormItemProps;

export type FormFieldsProps = Map<FormPathType, FieldProps>;

export class SimpleForm<T = unknown> {

  private formItemListeners: Array<FormListener<unknown>> = [];
  private formValueListeners: Array<FormListener<unknown>> = [];
  private globalFormListeners: Array<FormListener<T>['onChange']> = [];
  private errorListeners: Array<FormListener<GetMapValueType<FormErrors>>> = [];

  private initialValues?: unknown;
  private values?: unknown;
  private lastValues?: unknown;
  private debounceCache?: WeakMap<Function, unknown>;
  private formErrors: FormErrors;
  private fieldPropsMap: FormFieldsProps;

  public constructor(values?: T) {
    this.initialValues = values;
    this.values = deepClone(values);
    this.fieldPropsMap = new Map();
    this.formErrors = new Map();
    this.debounceCache = new WeakMap();
    bindClassPrototype(SimpleForm, this);
  }

  // 防抖执行函数（函数引用要保持不变）
  private debounceCall(func?: Function, ...args: unknown[]) {
    if (typeof func !== 'function') return;
    const lastTime = this.debounceCache?.get(func);
    clearTimeout(lastTime as number);
    this.debounceCache?.set(func, setTimeout(() => {
      func?.(...args);
    }, 16.7));
  }

  // 获取
  public getFieldProps(): FormFieldsProps
  public getFieldProps(path: FormPathType): GetMapValueType<FormFieldsProps>
  public getFieldProps(path?: FormPathType) {
    if (path === undefined) {
      return this.fieldPropsMap;
    } else {
      return this.fieldPropsMap.get(path);
    }
  }

  // 给目标控件绑定change事件
  bindChange(path?: FormPathType, eventName?: string, ...args) {
    if (!isValidFormName(path)) return;
    const props = this.getFieldProps(path);
    const { valueGetter, onFieldsChange } = props || {};
    const newValue = typeof valueGetter == 'function' ? valueGetter(...args) : undefined;
    this.setFieldValue(path, newValue, eventName);
    // 主动onchange事件
    onFieldsChange && onFieldsChange({ name: path, value: newValue }, this.getFieldValue());
  }

  // 给目标控件绑定的props
  getBindProps<V>(path?: FormPathType, newValue?: V) {
    if (!isValidFormName(path)) return;
    const props = this.getFieldProps(path);
    const currentValue = newValue !== undefined ? newValue : this.getFieldValue(path);
    const { valueProp, valueSetter, trigger, validateTrigger, rules, nonform } = props || {};
    const valuePropName = getValuePropName(valueProp) || "";
    const triggers = mergeTriggers(trigger, validateTrigger, getRulesTriggers(rules));
    const childValue = typeof valueSetter === 'function' ? valueSetter(currentValue) : (valueSetter ? undefined : currentValue);
    const bindProps = { [valuePropName]: childValue } as Record<string, any>;
    triggers.forEach((eventName) => {
      bindProps[eventName] = (...args) => {
        this.bindChange(path, eventName, ...args);
      };
    });
    return nonform === true ? {} : bindProps;
  }

  // 设置表单域
  public setFieldProps<V>(path?: FormPathType, field?: V) {
    if (!isValidFormName(path)) return;
    const lastField = this.fieldPropsMap.get(path);
    if (field === undefined) {
      if (lastField !== undefined) {
        this.fieldPropsMap.delete(path);
      }
    } else {
      const newField = Object.assign({}, lastField, field);
      this.fieldPropsMap.set(path, newField);
    };
  }

  // 获取所有表单值，或者单个表单值
  public getFieldValue(): T
  public getFieldValue<P extends FormPathType>(path: P): PathValue<T, P>
  public getFieldValue<P extends FormPathType>(path?: P) {
    const val = this.values;
    return path === undefined ? val : deepGet(val, path);
  }

  // 获取旧表单值
  public getLastValue(): T
  public getLastValue<P extends FormPathType>(path: P): PathValue<T, P>
  public getLastValue<P extends FormPathType>(path?: P) {
    const val = this.lastValues;
    return path === undefined ? val : deepGet(val, path);
  }

  // 初始值设置
  public setInitialValue(path?: FormPathType, initialValue?: unknown) {
    if (!isValidFormName(path)) return;
    const oldValue = this.getFieldValue(path);
    if (isEmpty(oldValue) && isEmpty(initialValue) || !isEmpty(oldValue)) return;
    this.initialValues = deepSet(this.initialValues, path, initialValue);
    // 旧表单值存储
    this.lastValues = this.values;
    // 设置值
    this.values = deepSet(this.values, path, initialValue);
    this.notifyForm(path);
  }

  public notifyForm(path?: FormPathType) {
    this.notifyFormItem(path);
    this.notifyFormValue(path);
  }

  // 获取初始值
  public getInitialValues(path?: FormPathType) {
    return path === undefined ? this.initialValues : deepGet(this.initialValues, path);
  }

  // 更新表单值，单个表单值或多个表单值
  public setFieldValue(path: object, eventName?: FieldProps['trigger']): void;
  public setFieldValue(path: FormPathType, value?: unknown, eventName?: FieldProps['trigger']): void;
  public setFieldValue(path: FormPathType | object, value?: unknown, eventName?: FieldProps['trigger']) {
    // 设置单个表单值
    const setFormItemValue = (path: FormPathType, value?: unknown, eventName?: FieldProps['trigger']) => {
      if (!isValidFormName(path)) return;
      // 旧表单值存储
      this.lastValues = this.values;
      // 设置值
      this.values = deepSet(this.values, path, value);
      // 规则
      const fieldProps = this.getFieldProps(path);
      const rules = fieldProps?.['rules'];
      if (rules?.length && rules instanceof Array) {
        // 校验规则
        this.validate(path, eventName);
      }
      this.notifyForm(path);
    };

    if (isObject(path)) {
      Promise.all(Object.keys(path).map((n) => setFormItemValue(n, path?.[n])));
    } else {
      setFormItemValue(path, value, eventName);
    }
  }

  // 设置表单值(覆盖更新)
  public setFieldsValue<V>(values?: V) {
    this.lastValues = this.values;
    this.values = values;
    this.notifyForm();
  }

  // 重置表单
  public reset<V>(endValues?: V) {
    const end = endValues || this.initialValues;
    this.setFieldsError(undefined);
    this.setFieldsValue(end);
  }

  // 获取error信息
  public getFieldError(): FormErrors
  public getFieldError(path: FormPathType): GetMapValueType<FormErrors>
  public getFieldError(path?: FormPathType) {
    if (path === undefined) {
      return this.formErrors;
    } else {
      return this.formErrors.get(path);
    }
  }

  // 更新error信息
  private setFieldError(path: FormPathType, val?: GetMapValueType<FormErrors>) {
    if (!isValidFormName(path)) return;
    if (val === undefined) {
      this.formErrors.delete(path);
    } else {
      this.formErrors.set(path, val);
    }
    this.notifyError(path);
  }

  // 设置error信息(覆盖更新)
  private setFieldsError(erros?: FormErrors) {
    this.formErrors = erros || new Map();
    this.notifyError();
  }

  // 校验整个表单或校验表单中的某个控件
  public async validate(path?: FormPathType | Array<FormPathType>, eventName?: FieldProps['trigger']) {

    const validateError = async (path: FormPathType) => {
      this.setFieldError(path, undefined);
      const fieldProps = this.getFieldProps(path) || {};
      const value = this.getFieldValue(path);
      const nonform = fieldProps?.nonform;
      const canTrigger = isCanTrigger(eventName, fieldProps?.['validateTrigger']);
      if (canTrigger && nonform !== true) {
        const rules = fieldProps['rules'];
        const error = await handleRules(rules, value, eventName);
        if (error) {
          this.setFieldError(path, error);
        }
        return error;
      }
    };

    // 是否为单条路径
    if (!(path instanceof Array) && path !== undefined) {
      const currentError = await validateError(path);
      return {
        error: currentError,
        values: this.getFieldValue()
      };
    } else {
      const fieldPropsMap = this.getFieldProps();
      const keys = path instanceof Array ? path : Array.from(fieldPropsMap.keys());
      const result = await Promise.all(keys?.map((key) => {
        const fieldProps = fieldPropsMap.get(key);
        const rules = fieldProps?.['rules'];
        if (rules instanceof Array) {
          return validateError(key);
        }
      }));
      const currentError = result?.filter((error) => error !== undefined)?.[0];
      return {
        error: currentError,
        values: this.getFieldValue()
      };
    }
  }

  // 订阅当前表单域值的变动(当表单域消失时会卸载)
  public subscribeFormItem(path?: FormPathType, listener?: SimpleForm<T>['formItemListeners'][number]['onChange']) {
    if (!isValidFormName(path) || !listener) return;
    this.formItemListeners.push({
      onChange: listener,
      path: path
    });
    return () => {
      this.unsubscribeFormItem(path);
    };
  }
  // 卸载
  public unsubscribeFormItem(path?: FormPathType) {
    if (path === undefined) {
      this.formItemListeners = [];
    } else if (isValidFormName(path)) {
      this.formItemListeners = this.formItemListeners.filter((sub) => !isEqualName(sub.path, path));
    }
  }
  // 同步当前表单域值的变化
  private notifyFormItem(path?: FormPathType) {
    if (path === undefined) {
      this.formItemListeners.forEach((listener) => listener.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path)));
    } else {
      this.formItemListeners.forEach((listener) => {
        if (isEqualName(listener?.path, path)) {
          listener?.onChange && listener?.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path));
        }
      });
    }
  }

  // 主动订阅路径上所有表单控件的变动(表单控件消失不会卸载)
  public subscribeFormValue(listener: FormListener<unknown>['onChange']): () => void
  public subscribeFormValue(path: FormPathType, listener: FormListener<unknown>['onChange']): () => void
  public subscribeFormValue(path: FormPathType | FormListener<unknown>['onChange'], listener?: FormListener<unknown>['onChange']) {
    if (typeof path === 'function') {
      this.globalFormListeners.push(path);
    } else {
      if (!isValidFormName(path) || !listener) return;
      this.formValueListeners.push({
        onChange: listener,
        path: path
      });
    }
    return () => {
      this.unsubscribeFormValue(typeof path !== 'function' ? path : undefined);
    };
  }
  // 卸载
  public unsubscribeFormValue(path?: FormPathType) {
    if (path === undefined) {
      this.formValueListeners = [];
    } else if (isValidFormName(path)) {
      this.formValueListeners = this.formValueListeners.filter((sub) => !isEqualName(sub.path, path));
    }
  }
  // 同步路径上任意节点的变化
  public notifyFormValue(path?: FormPathType) {
    if (path === undefined) {
      this.formValueListeners.forEach((listener) => listener.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path)));
    } else {
      this.formValueListeners.forEach((listener) => {
        if (comparePrefix(listener?.path, path)) {
          listener?.onChange && listener?.onChange(this.getFieldValue(listener.path), this.getLastValue(listener.path));
        }
      });
    }
    this.debounceCall(this.notifyGlobalForm);
  }
  public notifyGlobalForm() {
    this.globalFormListeners.forEach((listener) => listener?.(this.getFieldValue(), this.getLastValue()));
  }

  // 订阅表单错误的变动
  public subscribeError(path?: FormPathType, listener?: SimpleForm<T>['errorListeners'][number]['onChange']) {
    if (!isValidFormName(path) || !listener) return;
    this.errorListeners.push({
      onChange: listener,
      path: path
    });
    return () => {
      this.unsubscribeError(path);
    };
  }
  // 卸载
  public unsubscribeError(path?: FormPathType) {
    if (path === undefined) {
      this.errorListeners = [];
    } else {
      this.errorListeners = this.errorListeners.filter((sub) => !isEqualName(sub.path, path));
    }
  }
  // 同步错误的变化
  private notifyError(path?: FormPathType) {
    if (path === undefined) {
      this.errorListeners.forEach((listener) => listener.onChange(this.getFieldError(listener.path)));
    } else {
      this.errorListeners.forEach((listener) => {
        if (JSON.stringify(listener?.path) === JSON.stringify(path)) {
          listener?.onChange && listener?.onChange(this.getFieldError(path));
        }
      });
    }
  }
}
