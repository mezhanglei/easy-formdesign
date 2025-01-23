import { RuleBuilderConfig } from '../typings';

export const defaultGroupProperties = (config?: RuleBuilderConfig) => ({
  conjunction: config?.settings?.defaultConjunction || Object.keys(config?.conjunctions || {})[0],
});

// 默认选中要素
export const defaultField = (config?: RuleBuilderConfig) => {
  const field = config?.settings?.defaultField;

  if (typeof field === 'function') {
    return field?.(config);
  }
  return field || Object.keys(config?.fields || {})[0];
};

// 默认选中操作符
export const defaultOperator = (config?: RuleBuilderConfig, field?: string) => {
  const operator = config?.settings?.defaultOperator;

  if (typeof operator === 'function') {
    return operator(config, field);
  }

  return operator || Object.values(config?.fields?.[field || '']?.operators || [])?.[0];
};

export const defaultOperatorOptions = (config?: RuleBuilderConfig, operator?: string) => {
  const options = config?.operators?.[operator || '']?.options;
  return options?.defaults || {};
};

export const defaultRuleProperties = <T>(config?: T) => {
  const field = defaultField(config);
  const operator = defaultOperator(config, field);

  return {
    field,
    operator,
    value: undefined,
    operatorOptions: defaultOperatorOptions(config, operator),
  };
};

export const getChildren = <T>(count: number, config: T) => Array.from({ length: count }).map(() => ({
  type: 'rule',
  properties: defaultRuleProperties(config),
}));

export default <T>(config: T, childrenNum = 2) => ({
  type: 'group',
  children: getChildren(childrenNum, config),
  properties: defaultGroupProperties(config)
});
