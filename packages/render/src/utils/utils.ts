import { arrayMove } from "./array";
import { FormNodeProps, PropertiesData } from "../types";
import { pathToArr, deepSet, joinFormPath, deepGet, formatFormKey } from "@simpleform/form";
import { deepMergeObject } from "./object";
import { isEmpty } from "./type";

// 匹配字符串表达式
export const matchExpression = (value?: any) => {
  if (typeof value === 'string') {
    // /\{\{(.*)\}\}/
    const reg = new RegExp('\{\{\s*.*?\s*\}\}', 'g');
    const result = value?.match(reg)?.[0];
    return result;
  }
};

// 获取路径的末尾节点字符串(不带中括号)
export const getPathEnd = (path?: string) => {
  const pathArr = pathToArr(path);
  const end = pathArr?.pop();
  return end;
};

// 根据路径返回父路径(兼容a[0],a.[0],a.b, a[0].b形式的路径)
export const getParent = (path?: string) => {
  const pathArr = pathToArr(path);
  pathArr?.pop();
  return joinFormPath(...pathArr);
};

// 获取路径的长度
export const getPathLen = (path?: string) => {
  const pathArr = pathToArr(path);
  return pathArr.length;
};

// 根据路径更新数据
export const updateItemByPath = (properties: PropertiesData, data?: any, path?: string, attributeName?: string) => {
  const pathArr = pathToArr(path);
  const end = formatFormKey(pathArr.pop());
  const pathLen = pathArr?.length;
  let temp: any = properties;
  pathArr.forEach((item, index) => {
    const name = formatFormKey(item);
    if (index === 0) {
      temp = temp[name];
    } else {
      temp = temp?.properties?.[name];
    }
  });
  // 计算
  temp = pathLen === 0 ? temp : temp?.properties;
  if (!isEmpty(end)) {
    const endData = temp[end];
    if (attributeName) {
      temp[end] = deepSet(endData, attributeName, data);
    } else {
      if (data === undefined) {
        if (temp instanceof Array) {
          const index = +end;
          temp?.splice(index, 1);
        } else {
          delete temp[end];
        }
      } else {
        temp[end] = deepMergeObject(endData, data);
      }
    }
  }
  return properties;
};

// 设置指定路径的值
export const setItemByPath = (properties: PropertiesData, data?: any, path?: string, attributeName?: string) => {
  const pathArr = pathToArr(path);
  const end = formatFormKey(pathArr.pop());
  const pathLen = pathArr?.length;
  let temp: any = properties;
  pathArr.forEach((item, index) => {
    const name = formatFormKey(item);
    if (index === 0) {
      temp = temp[name];
    } else {
      temp = temp?.properties?.[name];
    }
  });
  // 计算
  temp = pathLen === 0 ? temp : temp?.properties;
  if (!isEmpty(end)) {
    if (attributeName) {
      const lastData = temp[end];
      const newData = deepSet(lastData, attributeName, data);
      temp[end] = newData;
    } else {
      if (data === undefined) {
        if (temp instanceof Array) {
          const index = +end;
          temp?.splice(index, 1);
        } else {
          delete temp[end];
        }
      } else {
        // @ts-ignore
        if (temp instanceof Array && temp[endCode] === undefined) {
          const index = +end;
          temp.splice(index, 0, data);
        } else {
          temp[end] = data;
        }
      }
    }
  }
  return properties;
};

// 根据path获取指定路径的项
export const getItemByPath = (properties?: PropertiesData, path?: string, attributeName?: string) => {
  if (!properties) return;
  const pathArr = pathToArr(path);
  let temp: any = properties;
  if (pathArr.length === 0) {
    return temp;
  }
  pathArr.forEach((item, index) => {
    const name = formatFormKey(item);
    if (index === 0) {
      temp = temp[name];
    } else {
      temp = temp?.properties?.[name];
    }
  });
  if (attributeName) {
    return deepGet(temp, attributeName);
  }
  return temp;
};

// 根据index获取目标项
export const getKeyValueByIndex = (properties: PropertiesData, index?: number, parent?: { path?: string; attributeName?: string }) => {
  if (!properties || typeof index !== 'number') return;
  const { path, attributeName } = parent || {};
  const parentItem = getItemByPath(properties, path, attributeName);
  const childs = attributeName ? parentItem : (path ? parentItem?.properties : parentItem);
  const childKeys = Object.keys(childs || {});
  const isList = childs instanceof Array;
  const key = isList ? index : childKeys[index];
  return [key, childs[key]] as [string | number, any];
};

// 转化为有序列表
export const toEntries = (data: any) => {
  const temp: Array<[string, any]> = [];
  const isList = data instanceof Array;
  for (let key of Object.keys(data || {})) {
    const value = data[key];
    temp.push([key, value]);
  }
  return {
    isList,
    entries: temp
  };
};

// 从有序列表中还原源数据
const parseEntries = (entriesData?: { entries: Array<[string | number, any]>, isList?: boolean }) => {
  const { isList, entries = [] } = entriesData || {};
  if (isList) {
    const temp = [];
    for (let i = 0; i < entries.length; i++) {
      const item = entries[i];
      temp[i] = item && item[1];
    }
    return temp;
  } else {
    return Object.fromEntries(entries);
  }
};

// 更新指定路径的name
export const updateName = (properties: PropertiesData, newName?: string, path?: string) => {
  const end = getPathEnd(path) || '';
  if (typeof newName !== 'string' || end === newName) return properties;
  const parentPath = getParent(path);
  const parent = getItemByPath(properties, parentPath);
  const childProperties = parentPath ? parent?.properties : parent;
  const entriesData = toEntries(childProperties);
  // 只有对象才会去更新键名
  if (!entriesData?.isList) {
    entriesData?.entries?.map((item) => {
      if (item?.[0] === end) {
        item[0] = newName;
      }
    });
  }
  const result = parseEntries(entriesData);
  if (parentPath) {
    parent.properties = result;
    return properties;
  } else {
    return result;
  }
};

// 插入数据
export const insertItemByIndex = (properties: PropertiesData, data?: Partial<PropertiesData> | Array<FormNodeProps>, index?: number, parent?: { path?: string; attributeName?: string }) => {
  const { path, attributeName } = parent || {};
  const parentItem = getItemByPath(properties, path, attributeName);
  const childs = attributeName ? parentItem : (path ? parentItem?.properties : parentItem);
  const entriesData = toEntries(childs);
  const isList = entriesData?.isList;
  const addItems = isList ? Object.entries(data instanceof Array ? data : [data]) : Object.entries(data || {});
  if (typeof index === 'number') {
    entriesData?.entries?.splice(index, 0, ...addItems);
  } else {
    entriesData?.entries?.push(...addItems);
  }
  const changedChilds = parseEntries(entriesData);
  if (path) {
    if (attributeName) {
      const result = setItemByPath(properties, changedChilds, path, attributeName);
      return result;
    } else {
      parentItem.properties = changedChilds;
      return properties;
    }
  } else {
    return changedChilds;
  }
};

// 同级调换位置
export const moveSameLevel = (properties: PropertiesData, from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
  // 拖拽源
  const fromParentPath = from?.parent;
  const fromIndex = from?.index;
  // 拖放源
  const toParentPath = to?.parent;
  let toIndex = to?.index;
  // 同域排序
  if (fromParentPath === toParentPath) {
    let fromParent = getItemByPath(properties, fromParentPath);
    const childProperties = fromParentPath ? fromParent?.properties : fromParent;
    // 转成列表以便排序
    const entriesData = toEntries(childProperties);
    const entries = entriesData?.entries;
    toIndex = typeof toIndex === 'number' ? toIndex : entries?.length;
    entriesData.entries = arrayMove(entries, fromIndex, toIndex);
    const result = parseEntries(entriesData);
    if (fromParentPath) {
      fromParent.properties = result;
      return properties;
    } else {
      return result;
    }
  }
};

// 跨级调换位置
export const moveDiffLevel = (properties: PropertiesData, from: { parent?: string, index: number }, to: { parent?: string, index?: number }) => {
  // 拖拽源
  const fromParentPath = from?.parent;
  const fromIndex = from?.index;
  const fromLen = getPathLen(fromParentPath);
  const keyValue = getKeyValueByIndex(properties, fromIndex, { path: fromParentPath });
  if (!keyValue) return properties;
  const insertItem = parseEntries({ isList: typeof keyValue[0] === 'number', entries: [keyValue] });
  const fromPath = joinFormPath(fromParentPath, keyValue[0]);
  // 拖放源
  const toParentPath = to?.parent;
  const toIndex = to?.index;
  const toLen = getPathLen(toParentPath);
  // 先计算内部变动，再计算外部变动
  if (fromLen > toLen || !toLen) {
    setItemByPath(properties, undefined, fromPath);
    const result = insertItemByIndex(properties, insertItem, toIndex, { path: toParentPath });
    return result;
  } else {
    const result = insertItemByIndex(properties, insertItem, toIndex, { path: toParentPath });
    result && setItemByPath(result, undefined, fromPath);
    return result;
  }
};

// 提取properties中的默认值
export const getInitialValues = (properties?: PropertiesData) => {
  if (!properties) return;
  let initialValues = {};
  // 遍历处理对象树中的非properties字段
  const deepHandle = (formNode: FormNodeProps, path?: string) => {
    for (const propsKey of Object.keys(formNode)) {
      if (propsKey !== 'properties') {
        // @ts-ignore
        const propsValue = formNode[propsKey];
        if (propsKey === 'initialValue' && propsValue !== undefined) {
          initialValues = deepSet(initialValues, path, propsValue);
        }
      } else {
        const childProperties = formNode[propsKey];
        const isList = childProperties instanceof Array;
        if (childProperties) {
          for (const childKey of Object.keys(childProperties)) {
            // @ts-ignore
            const childField = childProperties[childKey];
            const childName = isList ? `[${childKey}]` : childKey;
            if (typeof childName === 'string') {
              const childPath = childField?.ignore === true ? path : joinFormPath(path, childName) as string;
              deepHandle(childField, childPath);
            }
          }
        }
      }
    }
  };

  const isList = properties instanceof Array;
  for (const key of Object.keys(properties)) {
    // @ts-ignore
    const childField = properties[key];
    const childName = isList ? `[${key}]` : key;
    if (typeof childName === 'string') {
      const childPath = joinFormPath(childField?.ignore ? undefined : childName);
      deepHandle(childField, childPath);
    }
  }
  return initialValues;
};
