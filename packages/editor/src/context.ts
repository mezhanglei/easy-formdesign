import React, { useContext, useRef, useState } from 'react';
import { EditorWidgetItem, FormDesignData } from './typings';
import {SimpleFormRender, SimpleForm, FormRenderProps, WidgetOptions} from '@simpleform/render';
import { PlatType } from './tools/platContainer';
import { SimpleUndo } from './utils/index';

// 配置属性类型
export interface ConfigWidgetSetting {
  [title: string]: FormDesignData
}

// 编辑器中的数据
export interface FormEditorState {
  editorForm?: SimpleForm;
  editor?: SimpleFormRender;
  settingForm?: SimpleForm | null;
  selected?: { path?: WidgetOptions['path']; setting?: ConfigWidgetSetting };
  widgetList?: FormDesignData;
  editorConfig: Record<string, EditorWidgetItem>; // 编辑器配置
  renderConfig?: FormRenderProps<any>; // 渲染器配置
  platType?: PlatType;
  historyRecord?: SimpleUndo;
}

export function useMethod<T extends (...args: unknown[]) => unknown>(method: T) {
  const { current } = useRef<{ method: T, func: T | undefined }>({
    method,
    func: undefined,
  });
  current.method = method;

  // 只初始化一次
  if (!current.func) {
    // 返回给使用方的变量
    current.func = ((...args: unknown[]) => current.method.call(current.method, ...args)) as T;
  }

  return current.func;
}

export interface FormEditorContextProps {
  state: FormEditorState;
  dispatch: (action: React.SetStateAction<unknown>) => void
}

// 初始化reducer
export function useEditorState(initialState: FormEditorState) {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);
  const historyRef = useRef(new SimpleUndo({
    maxLength: 10,
    provider: (done) => {
      const widgetList = stateRef.current.widgetList || [];
      done(JSON.stringify(widgetList));
    }
  }));
  // 更新state
  const dispatch: FormEditorContextProps['dispatch'] = useMethod((newState) => {
    const newData = typeof newState === 'function' ? newState(stateRef.current) : newState;
    setState(newData);
    stateRef.current = newData;
  });

  return [Object.assign({ historyRecord: historyRef.current }, state), dispatch] as const;
};

// 编辑器的context
export const FormEditorContext = React.createContext<FormEditorContextProps>({ state: { editorConfig: {} }, dispatch: () => { } });

// 消费context的值
export function useEditorContext() {
  const context = useContext(FormEditorContext);
  return context;
};
