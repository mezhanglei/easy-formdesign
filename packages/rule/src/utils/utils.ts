import React from "react";
import { nanoid } from "nanoid";
import {
  defaultGroupProperties,
  defaultOperator,
  defaultOperatorOptions,
  defaultRuleProperties,
} from '../utils/defaultData';
import { BuilderCommonProps, RuleBuilderConfig, RuleBuilderGroupItem, RuleBuilderRuleItem } from '../typings';
import { deepGet, deepSet } from '@simpleform/form';
import { isObject } from "./type";

export const uuid = () => {
  return nanoid(6);
};

// 合并配置项(浅合并，嵌套属性合并只允许一层深度)
export const mergeFormOptions = <V>(
  oldConfig: V,
  newConfig?: Partial<V>,
  mergeFunNames: string[] = []) => {
  if (!isObject(newConfig)) return oldConfig;
  const cloneConfig = { ...oldConfig };
  Object.keys(newConfig || {}).forEach((key) => {
    const oldItem = oldConfig?.[key];
    const newItem = newConfig?.[key];
    if (isObject(oldItem) && isObject(newItem) && !React.isValidElement(oldItem)) {
      cloneConfig[key] = { ...oldItem, ...newItem };
    } else if (typeof oldItem === 'function' && mergeFunNames.includes(key)) {
      cloneConfig[key] = (...args: unknown[]) => {
        oldItem?.(...args);
        return newItem?.(...args);
      };
    } else {
      cloneConfig[key] = newItem;
    }
  });
  return cloneConfig;
};

export const setConjunction = (state: RuleBuilderConfig['tree'], path: BuilderCommonProps['path'], conjunction: RuleBuilderGroupItem['properties']['conjunction']) => {
  const curPath = path.concat(['properties', 'conjunction']);
  return deepSet(state, curPath, conjunction);
};

export const addItem = <P>(state: RuleBuilderConfig['tree'], type: string, path: BuilderCommonProps['path'], properties: P, config?: RuleBuilderConfig) => {
  const containerPath = path.concat('children');
  const container = deepGet(state, containerPath) || [] as unknown[];
  if (container instanceof Array) {
    const newProperties = type === 'group' ?
      mergeFormOptions(defaultGroupProperties(config), properties)
      :
      mergeFormOptions(defaultRuleProperties(config), properties);
    container.push({ type, properties: newProperties });
    return deepSet(state, containerPath, container);
  }
};

export const removeItem = (state: RuleBuilderConfig['tree'], path: BuilderCommonProps['path']) => {
  return deepSet(state, path);
};

export const setField = (state: RuleBuilderConfig['tree'], path: BuilderCommonProps['path'], field?: RuleBuilderRuleItem['properties']['field'], config?: RuleBuilderConfig) => {
  const ruleItem = deepGet(state, path) as RuleBuilderRuleItem | undefined;
  if (!ruleItem) return;
  const configFields = config?.fields;
  const currentField = ruleItem?.properties?.field;
  const currentOperator = ruleItem?.properties?.operator;
  const currentValue = ruleItem?.properties?.value;
  const currentWidget = configFields?.[currentField]?.widget;
  const configField = configFields?.[field || ''];
  const operator = configField?.operators?.indexOf(currentOperator) !== -1
    ? currentOperator
    : defaultOperator(config, field);
  const operatorCardinality = config?.operators?.[operator]?.cardinality || 1;
  const operatorOptions = defaultOperatorOptions(config, operator);
  const nextWidget = configField?.widget;
  const nextValue = currentValue instanceof Array ? currentValue.slice(0, operatorCardinality) : currentValue;
  return deepSet(state, path.concat('properties'), {
    field,
    operator,
    operatorOptions,
    value: currentWidget !== nextWidget ? undefined : nextValue
  });
};

export const setOperator = (state: RuleBuilderConfig['tree'], path: BuilderCommonProps['path'], operator: RuleBuilderRuleItem['properties']['operator'], config?: RuleBuilderConfig) => {
  const ruleItem = deepGet(state, path) as RuleBuilderRuleItem | undefined;
  if (!ruleItem) return;
  const operatorCardinality = config?.operators?.[operator].cardinality || 1;
  const currentValue = ruleItem?.properties?.value;
  const nextValue = currentValue instanceof Array ? currentValue.slice(0, operatorCardinality) : currentValue;
  const operatorOptions = defaultOperatorOptions(config, operator);
  return deepSet(state, path.concat('properties'), {
    ...ruleItem?.properties,
    operator,
    operatorOptions,
    value: nextValue
  });
};

export const setFieldValue = (state, path, value) => {
  return deepSet(state, path.concat('properties', 'value'), value);
};

export const setOperatorOption = (state, path, value) => {
  return deepSet(state, path.concat('properties', 'operatorOptions'), value);
};
