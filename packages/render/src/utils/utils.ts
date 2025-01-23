import { deepSet, deepGet } from "@simpleform/form";
import { WidgetList, WidgetOptions } from "../typings";

// 路径是否相等
export const isEqualPath = (a, b) => {
  if (typeof a === 'string' && typeof b === 'string') return a === b;
  if (a instanceof Array && b instanceof Array) return a.toString() === b.toString();
  return a === b;
};

// 设置指定路径的值
export const setItemByPath = <V>(widgetList?: V, data?: unknown, path?: WidgetOptions['path']) => {
  // 无路径时表示设置当前值
  if (!path?.length) return data as V;
  return deepSet(widgetList, path, data);
};

// 根据path获取指定路径的项
export const getItemByPath = <V, Path extends WidgetOptions['path']>(widgetList?: V, path?: Path) => {
  if (!path?.length) return widgetList;
  return deepGet(widgetList, path);
};

// 转化为有序列表
export function toEntries<T>(data: T[]): [number, T][]
export function toEntries<T>(data: Record<string, T>): [string, T][]
export function toEntries<T>(data?: T[] | Record<string, T>) {
  if (data instanceof Array) {
    return data.map((item, index) => ([index, item] as [number, T]));
  } else {
    return Object.entries(data || {});
  }
};

// 从有序列表中还原源数据
export function parseEntries<T>(entries: Array<[number, T]>): T[]
export function parseEntries<T>(entries: Array<[string, T]>): Record<string, T>
export function parseEntries<T>(entries?: Array<[string, T]> | Array<[number, T]>) {
  if (!(entries instanceof Array)) return;
  if (typeof entries[0]?.[0] === 'number') {
    return entries.map((item) => item?.[1] as T);
  } else {
    return Object.fromEntries(entries);
  }
};

// 通过序号插入数据
export const insertItemByIndex = (widgetList: WidgetList | undefined, data: unknown, index?: number, parent?: WidgetOptions['path']) => {
  const container = getItemByPath(widgetList, parent);
  if (!(container instanceof Array) || data === undefined || data === '' || data === null) return widgetList;
  const entriesData = toEntries(container);
  const payload = toEntries(data instanceof Array ? data : [data]);
  if (typeof index === 'number') {
    entriesData?.splice(index, 0, ...payload);
  } else {
    entriesData?.push(...payload);
  }
  const changedChilds = parseEntries(entriesData);
  return setItemByPath(widgetList, changedChilds, parent);
};

// 调整位置
export const moveItemByPath = (
  widgetList: WidgetList | undefined,
  fromPath: WidgetOptions['path'],
  toPath: WidgetOptions['path'],
) => {
  if (!fromPath?.length) return widgetList;
  const fromData = getItemByPath(widgetList, fromPath);
  const toParent = toPath?.slice(0, toPath?.length - 1);
  const toIndex = toPath?.[toPath?.length - 1];
  const nextIndex = toIndex === undefined ? toIndex : +toIndex;
  // 先变更内部，再变更外部
  if (toPath && toPath?.length > fromPath?.length) {
    // 先插入位置
    const afterWidgetList = insertItemByIndex(widgetList, fromData, nextIndex, toParent);
    // 删除源
    return setItemByPath(afterWidgetList, undefined, fromPath);
  } else {
    // 先删除源
    const afterWidgetList = setItemByPath(widgetList, undefined, fromPath);
    // 插入位置
    return insertItemByIndex(afterWidgetList, fromData, nextIndex, toParent);
  }
};
