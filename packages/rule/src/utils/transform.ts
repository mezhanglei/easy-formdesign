import { deepSet } from "@simpleform/form";
import { RuleBuilderGroupItem } from "../typings";

// 递归遍历数据结构
export const traverseTree = <V>(
  list?: Array<V>,
  callback?: <R>(item: any, index: number, parent?: Array<string | number>) => R | void,
  parent?: Array<string | number>
) => {
  if (!(list instanceof Array)) return;
  list.forEach((item: any, index) => {
    const children = item?.children;
    const curPath = (parent || []).concat(index);
    callback?.(item, index, curPath);
    if (children instanceof Array) {
      const conjunction = item?.properties?.conjunction;
      traverseTree(children, callback, curPath.concat(conjunction));
    }
  });
};

// 转化为jsonLogic格式
export const getJSONLogic = (tree?: RuleBuilderGroupItem) => {
  let result = [] as unknown[] | undefined;
  traverseTree([tree], (item, index, parent) => {
    // 当为规则元素时
    if (!item?.children?.length) {
      const operator = item?.properties?.operator;
      const field = item?.properties?.field;
      const value = item?.properties?.value;
      const curPath = (parent || []).concat(index, operator);
      result = deepSet(result, curPath, [{ 'var': field }, value]);
    }
  });
  return result?.[0];
};
