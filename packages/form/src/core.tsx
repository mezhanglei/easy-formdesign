import React, { useContext, useEffect, useState } from 'react';
import { SimpleFormContext, FormInitialValuesContext } from './context';
import { deepGet, FormPathType, getValueFromEvent, isValidFormName, toArray } from './utils/utils';
import { FormRule } from './validator';
import { isEmpty } from './utils/type';
import { FormProps } from './form';

type TriggerType = string;
export type FormEventHandler<V = unknown, A = unknown> = (obj: { name?: FormPathType; value?: V }, values?: A) => void;
export interface ItemCoreProps {
  name?: FormPathType;
  nonform?: boolean;
  index?: number;
  trigger?: TriggerType; // 设置收集字段值变更的时机
  validateTrigger?: TriggerType | TriggerType[];
  valueProp?: string | ((type: string) => string);
  valueGetter?: typeof getValueFromEvent;
  valueSetter?: (value) => unknown;
  rules?: FormRule[];
  initialValue?: unknown;
  errorClassName?: string;
  onFieldsChange?: FormEventHandler;
  onFieldsMounted?: FormEventHandler;
  onValuesChange?: FormEventHandler;
  children?: React.ReactNode | ((P: { className?: string; form?: FormProps['form'], bindProps: ReturnType<NonNullable<FormProps['form']>['getBindProps']> }) => React.ReactNode);
}

export function getRulesTriggers(rules?: ItemCoreProps['rules']) {
  const result = [] as TriggerType[];
  if (rules instanceof Array) {
    for (let i = 0; i < rules?.length; i++) {
      const rule = rules?.[i];
      const validateTrigger = rule?.validateTrigger;
      if (validateTrigger) {
        if (validateTrigger instanceof Array) {
          result.push(...validateTrigger);
        } else {
          result.push(validateTrigger);
        }
      }
    }
  }
  return result;
}

export function mergeTriggers(trigger: ItemCoreProps['trigger'], validateTrigger: ItemCoreProps['validateTrigger'], ruleTriggers: Array<TriggerType>) {
  return new Set<TriggerType>([
    ...toArray(trigger),
    ...toArray(validateTrigger),
    ...ruleTriggers
  ]);
}

export const ItemCore = (props: ItemCoreProps) => {
  const { form, ...options } = useContext(SimpleFormContext);
  const initialValues = useContext(FormInitialValuesContext);
  const mergeProps = Object.assign({}, options, props);
  const { children, ...restProps } = mergeProps;
  const {
    name,
    valueProp = 'value',
    valueGetter = getValueFromEvent,
    valueSetter,
    errorClassName,
    onFieldsChange,
    onFieldsMounted,
    onValuesChange,
    initialValue,
    trigger = 'onChange',
    validateTrigger,
    ...rest
  } = restProps;

  const fieldProps = { ...restProps, valueProp, valueGetter, trigger };
  const nonform = rest?.nonform || rest?.readOnly;
  const currentPath = (!isValidFormName(name) || nonform === true) ? undefined : name;
  const [value, setValue] = useState<unknown>();
  // 初始化fieldProps
  form?.setFieldProps(currentPath, fieldProps);

  // 订阅更新值的函数
  useEffect(() => {
    if (!isValidFormName(currentPath) || !form) return;
    // 订阅目标控件
    form.subscribeFormItem(currentPath, (newValue, oldValue) => {
      setValue(newValue);
      if (isEmpty(newValue) && isEmpty(oldValue)) return;
      onValuesChange && onValuesChange({ name: currentPath, value: newValue }, form?.getFieldValue());
    });
    return () => {
      form.unsubscribeFormItem(currentPath);
    };
  }, [JSON.stringify(currentPath), form, onValuesChange]);

  // 表单域初始化值
  useEffect(() => {
    if (!isValidFormName(currentPath) || !form) return;
    // 回填初始值
    const initValue = initialValue === undefined ? deepGet(initialValues, currentPath) : initialValue;
    form.setInitialValue(currentPath, initValue);
    onFieldsMounted && onFieldsMounted({ name: currentPath, value: initValue }, form?.getFieldValue());
    return () => {
      // 清除该表单域的props(在设置值的前面)
      form?.setFieldProps(currentPath, undefined);
      // 清除初始值
      form?.setInitialValue(currentPath, undefined);
    };
  }, [JSON.stringify(currentPath)]);

  // 对目标控件进行双向绑定
  const bindChildren = (children: ItemCoreProps['children']) => {
    if (typeof children === 'function') {
      const bindProps = form && form.getBindProps(currentPath, value) || {};
      return children({ className: errorClassName, form: form, bindProps: bindProps });
    } else {
      return children;
    }
  };

  const childs = bindChildren(children);
  return <>{childs}</>;
};

ItemCore.displayName = "ItemCore";
