import React from "react";
import { RuleBuilder } from "./store";

export type ConjunctionType = 'and' | 'or'
export interface RuleBuilderConfig {
  tree?: RuleBuilderGroupItem
  fields?: Record<string, {
    label: string;
    widget: string | [string, any];
    operators: string[];
  }>;
  conjunctions?: Record<string, { label: string; }>
  operators?: Record<string, {
    label: string;
    cardinality?: number; // 值的数量
    options?: {
      factory: (props) => React.ReactNode;
      defaults?: any
    },
  }>
  widgets?: Record<string, {
    factory: (props) => React.ReactNode
  }>
  settings?: {
    defaultField?: string | ((config?: RuleBuilderConfig) => string); // 默认要素
    defaultOperator?: string | ((config?: RuleBuilderConfig, field?: string) => string); // 默认操作符
    defaultConjunction?: string; // 默认连接符
    maxNesting?: number // 默认的最大嵌套深度
  }
}

export interface RuleBuilderRuleItem {
  type: string;
  properties: {
    field: string;
    operator: string;
    value: unknown;
    operatorOptions: NonNullable<NonNullable<RuleBuilderConfig['operators']>[keyof RuleBuilderConfig['operators']]['options']>['defaults'];
  };
}

export interface RuleBuilderGroupItem {
  type: string;
  children: Array<RuleBuilderRuleItem | RuleBuilderGroupItem>;
  properties: { conjunction: string };
}

export type BuilderCommonProps = {
  path: Array<string | number>
  actions?: Record<string, (...args: unknown[]) => void>
  config?: RuleBuilderConfig
}

export interface RuleBuilderProps extends RuleBuilderConfig {
  builder?: RuleBuilder
  onRenderChange?: (newData?: RuleBuilderGroupItem, oldData?: RuleBuilderGroupItem) => void;
};

export type RemainingParams<T extends any[], H extends any[]> = T extends [...H, ...infer Rest] ? Rest : never;
