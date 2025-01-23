import { deepMergeObject } from '.';
import { nanoid } from 'nanoid';
import { EditorGenerateWidgetItem, CommonFormProps } from '../typings';
import { SimpleFormRender, getInitialValues, WidgetOptions } from '@simpleform/render';
import { ConfigWidgetSetting, FormEditorState } from '../context';

export const defaultGetId = (key?: string) => {
  return typeof key == 'string' ? `${key.replace(/\./g, '')}_${nanoid(6)}` : '';
};

// 从配置中获取初始值
export const getSettingInitial = (setting?: ConfigWidgetSetting) => {
  // // 从配置表单中获取初始属性
  const expandSetting = Object.values(setting || {}).reduce((pre, cur) => {
    const result = [...pre, ...cur];
    return result;
  }, []);
  const initialValues = getInitialValues<EditorGenerateWidgetItem>(expandSetting);
  return initialValues;
};

// 返回组件config信息
export const getConfigItem = (type: string | undefined, editorConfig?: FormEditorState['editorConfig']) => {
  if (!type || !editorConfig) return;
  const configItem = editorConfig[type] as EditorGenerateWidgetItem;
  const { setting, ...rest } = configItem;
  const initialData = getSettingInitial(typeof setting === 'object' ? setting : {});
  return deepMergeObject(initialData, rest);
};

// 根据路径获取节点的值和属性
export const getWidgetItem = <V = EditorGenerateWidgetItem>(formrender?: SimpleFormRender | null, path?: WidgetOptions['path']) => {
  if (!formrender) return;
  const item = formrender.getItemByPath(path) as (V | undefined);
  return item;
};

// 移动新节点
export const moveWidgetItem = (formrender?: SimpleFormRender | null, from?: WidgetOptions['path'], to?: WidgetOptions['path']) => {
  if (!formrender || !from || !to) return;
  const actions = formrender?.getActions();
  actions?.moveItemByPath(from, to);
};

// 插入新节点
export const insertWidgetItem = (formrender?: SimpleFormRender | null, data?: EditorGenerateWidgetItem, index?: number, parent?: WidgetOptions['path']) => {
  if (!formrender || !data) return;
  const newData = data?.panel?.nonform ? data : Object.assign({ name: defaultGetId(data?.type) }, data);
  const actions = formrender?.getActions();
  actions?.insertItemByIndex(newData, index, parent);
};

// 设置节点的属性
export const setWidgetItem = (formrender?: SimpleFormRender | null, data?: unknown, path?: WidgetOptions['path']) => {
  if (!formrender) return;
  const actions = formrender?.getActions();
  actions?.setItemByPath(data, path);
};

// 删除节点
export const delWidgetItem = (formrender?: SimpleFormRender | null, path?: WidgetOptions['path']) => {
  if (!path?.length || !formrender) return;
  const actions = formrender?.getActions();
  actions?.delItemByPath(path);
};

// 提取对象中公共的选项
export const getCommonOptions = (_options?: CommonFormProps['_options']) => {
  const { isEditor, formrender, form, editorContext, props } = _options || {};
  return { isEditor, formrender, form, editorContext, props };
};
