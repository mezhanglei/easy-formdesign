import { CustomUnionType, FormRenderProps, WidgetList, WidgetOptions } from "../typings";
import { getItemByPath } from "../utils/utils";
import { createFormElement, getFormComponent, mergeFormOptions } from "../utils/transform";
import { Form } from "@simpleform/form";
import { deepClone } from "../utils";
import { CustomCol, CustomRow } from "../components";
import reducer, { actionCreators } from './actions';

const bindClassPrototype = (Factory, instance) => {
  const attrs = Object.getOwnPropertyDescriptors(Factory?.prototype);
  for (const key in attrs) {
    const attr = instance[key];
    if (typeof attr === 'function' && key !== 'constructor') {
      instance[key] = instance[key].bind(instance);
    }
  }
};

export type FormRenderListener<V> = (newValue?: V, oldValue?: V) => void;

// 管理formrender过程中的数据
export class SimpleFormRender {
  public config?: FormRenderProps;
  private widgetList: WidgetList;
  private lastWidgetList: WidgetList | undefined;
  private widgetListListeners: FormRenderListener<WidgetList>[] = [];
  constructor(config?: SimpleFormRender['config']) {
    this.widgetList = [];
    this.lastWidgetList = undefined;
    this.config = config || {
      components: {
        'row': CustomRow,
        'col': CustomCol,
        'Form.Item': Form.Item
      }
    };
    bindClassPrototype(SimpleFormRender, this);
  }

  // 配置项
  public defineConfig(payload?: SimpleFormRender['config'] | ((config?: FormRenderProps) => Partial<FormRenderProps>)) {
    if (typeof payload === 'function') {
      this.config = payload(this.config);
    } else {
      this.config = mergeFormOptions(this.config, payload);
    }
  }

  // 返回目标声明组件
  public getFormComponent(target?: CustomUnionType) {
    const components = this.config?.components;
    return getFormComponent(target, components);
  }

  // 创建components的实例
  public createFormElement(target?: CustomUnionType, commonProps?: unknown) {
    const components = this.config?.components;
    return createFormElement(target, commonProps, components);
  }

  // 获取当前组件的widgetList
  public getWidgetList() {
    return deepClone(this.widgetList || []);
  }

  // 设置widgetList
  setWidgetList(data?: SimpleFormRender['widgetList'], option?: { ignore?: boolean }) {
    this.lastWidgetList = this.widgetList;
    this.widgetList = data || [];
    if (option?.ignore) return;
    this.notifyWidgetList();
  }

  // 获取指定路径的项
  getItemByPath = (path?: WidgetOptions['path']) => {
    const oldData = this.getWidgetList();
    if (oldData) {
      return getItemByPath(oldData, path);
    }
  };

  // 返回widgetList的操作方法
  public getActions() {
    return Object.fromEntries(Object.keys(actionCreators)?.map(actionName => {
      const actionFun = actionCreators[actionName];
      return [actionName, (...args) => {
        this.setWidgetList(reducer(this.widgetList, actionName, actionFun(...args)));
      }];
    }));
  }

  // 订阅表单渲染数据的变动
  public subscribeWidgetList(listener: SimpleFormRender['widgetListListeners'][number]) {
    this.widgetListListeners.push(listener);
    return () => {
      this.widgetListListeners = [];
    };
  }

  // 卸载
  public unsubscribeWidgetList() {
    this.widgetListListeners = [];
  }

  // 同步表单渲染数据的变化
  private notifyWidgetList() {
    this.widgetListListeners.forEach((onChange) => {
      const cloneData = this.getWidgetList();
      onChange && onChange(cloneData, this.lastWidgetList);
    });
  }
}
