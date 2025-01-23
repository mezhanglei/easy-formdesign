import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SimpleForm } from './store';
import { deepSet, FormPathType, isIndexCode, pathToArr } from './utils/utils';

export function useSimpleForm<T>(
  values?: T
) {
  const formRef = useRef(new SimpleForm(values));
  return formRef.current;
}

// 获取error信息
export function useFormError(form?: SimpleForm, path?: FormPathType) {
  const [error, setError] = useState<ReturnType<SimpleForm['getFieldError']>>();

  const subscribe = useCallback(() => {
    if (form?.subscribeError && path) {
      form.subscribeError(path, (newVal) => {
        setError(newVal);
      });
    }
  }, [form?.subscribeError, JSON.stringify(path)]);

  useMemo(() => {
    subscribe?.();
  }, [subscribe]);

  // 订阅组件更新错误的函数
  useEffect(() => {
    subscribe?.();
    return () => {
      form?.unsubscribeError(path);
    };
  }, [subscribe]);

  return [error, setError] as const;
}

// 获取表单值
export function useFormValues<V>(form: SimpleForm<V>, path?: FormPathType | Array<FormPathType>) {
  const [mapData, setMapData] = useState<Partial<V>>();

  const subscribe = useCallback(() => {
    if (!form?.subscribeFormValue) return;
    const paths = path instanceof Array ? path : path !== undefined && [path];
    if (paths) {
      const isArr = paths.some((k) => isIndexCode(pathToArr(k)?.[0])); // 表单值是否为列表
      let result: unknown = isArr ? [] : {};
      paths.forEach((key) => {
        form?.subscribeFormValue(key, (newVal) => {
          result = deepSet(result, key, newVal);
          setMapData(result as Partial<V>);
        });
      });
    } else {
      form?.subscribeFormValue((newVal) => {
        setMapData(newVal as Partial<V>);
      });
    }
  }, [form?.subscribeFormValue, JSON.stringify(path)]);

  useMemo(() => {
    subscribe?.();
  }, [subscribe]);

  useEffect(() => {
    subscribe?.();
    return () => {
      form?.unsubscribeFormValue();
    };
  }, [subscribe]);

  return mapData;
}
