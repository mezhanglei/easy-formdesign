import { PathValue } from "../typings";
import { ItemCoreProps } from "../core";
import { isArray, isEmpty, isObject } from "./type";
import { deepClone } from "./object";

export type FormPathType = string | number | Array<string | number>;
// 接收路径字符串或数组字符串，返回数组字符串表示路径
export function pathToArr(path?: FormPathType) {
  if (path instanceof Array) return path;
  if (typeof path === 'number') return [path];
  const regex = /([^\.\[\]]+)|(\[\d+\])/g;
  const parts = typeof path === 'string' ? path.match(regex) as string[] : [];
  return parts || [];
}

// 格式化字段为对象的键
export function formatFormKey(code?: unknown) {
  if (typeof code !== 'number' && typeof code !== 'string') return '';
  if (typeof code === 'number') return code;
  return code.toString().replace(/\]/, '').replace(/\[/, '');
}

// 对比路径，分辨是不是匹配的上前缀
export function comparePrefix(prefix: FormPathType, path: FormPathType) {
  const prefixParts = pathToArr(prefix);
  const parts = pathToArr(path);
  if (!parts?.length) return false;
  if (prefixParts?.length > parts?.length) return false;
  return prefixParts?.every((item, index) => {
    return item === parts[index];
  });
}

// 表单值的键名
export function getValuePropName(valueProp?: ItemCoreProps['valueProp'], type?: string) {
  return typeof valueProp === 'function' ? valueProp(type || '') : valueProp;
}

// 从事件对象中取值
export function getValueFromEvent(...args) {
  const eventTarget = (args[0] as React.ChangeEvent<HTMLInputElement>)?.target;
  if (eventTarget) {
    return eventTarget.type === 'checkbox' ? eventTarget.checked : eventTarget.value;
  }
  return args[0];
}

// 是否携带中括号
export const isWithBracket = <T>(code?: T) => {
  return typeof code === 'string' && /^\[\d+\]$/.test(code);
};

// 是否为序号字段
export const isIndexCode = <N>(code: N) => (typeof code === 'number' ? true : isWithBracket(code));

// 是否为有效表单name
export const isValidFormName = <P>(name?: P | ReturnType<typeof isEmpty>): name is ReturnType<typeof isEmpty> => {
  return !isEmpty(name);
};

// 表单name是否相等
export const isEqualName = (a, b) => {
  if (!isEmpty(a) && !isEmpty(b)) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
};

// 由前到后拼接当前项的表单的path
export function joinFormPath(...args: Array<unknown>) {
  if (!(args instanceof Array)) return '';
  return args.reduce<string>((pre, cur) => {
    const curName = typeof cur === 'string' ? cur : (typeof cur === 'number' ? `[${cur}]` : '');
    const parent = typeof pre === 'string' ? pre : (typeof pre === 'number' ? `[${pre}]` : '');
    if (isWithBracket(curName)) {
      return parent && curName ? `${parent}${curName}` : (curName || parent);
    } else {
      return parent && curName ? `${parent}.${curName}` : (curName || parent);
    }
  }, '');
};

export function toArray<T>(list?: T | T[]): T[] {
  if (!list) {
    return [];
  }
  return Array.isArray(list) ? list : [list];
}

// 根据路径获取目标对象中的单个值或多个值
export function deepGet<T, Path extends FormPathType>(obj?: T, keys?: Path) {
  if (typeof obj !== 'object') return;
  if (!isObject(obj) && !isArray(obj)) return;
  const parts = pathToArr(keys);
  if (!parts?.length) return;
  let temp = obj as T;
  for (const k of parts) {
    const key = formatFormKey(k);
    temp = (temp)?.[key];
  }
  return temp as PathValue<T, Path>;
}

// 给对象目标属性添加值, ['a', 0] 和 ['a', '[0]'] 等同于 'a[0]'
export function deepSet<T, P extends FormPathType>(obj?: T, path?: P, value?: unknown) {
  const parts = pathToArr(path);
  if (!parts?.length) return obj;
  // 有值但是非对象和数组的不允许赋值
  if (obj && !isObject(obj) && !isArray(obj)) return obj;
  const cloneData = (!obj ? (isIndexCode(parts[0]) ? [] : {}) : deepClone(obj)) as T;
  let temp = cloneData;
  for (let i = 0; i < parts?.length; i++) {
    const curKey = formatFormKey(parts[i]);
    const nextKey = parts[i + 1];
    if (temp[curKey] === undefined && value === undefined) {
      return cloneData;
    }
    // 最后一个
    if (i === parts?.length - 1) {
      if (value === undefined) {
        if (temp instanceof Array) {
          temp?.splice(+curKey, 1);
        } else {
          delete temp?.[curKey];
        }
      } else {
        temp[curKey] = value;
      }
    } else {
      if (isEmpty(temp[curKey])) {
        temp[curKey] = isIndexCode(nextKey) ? [] : {};
      }
      temp = temp[curKey];
    }
  }
  return cloneData;
}
