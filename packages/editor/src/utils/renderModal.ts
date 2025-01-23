import React from 'react';
import { createRoot } from 'react-dom/client';

export interface ModalInstance {
  dom: Node
  render?: (template: unknown) => void
  unmount: () => void
}

const doms = new WeakMap<Node, ModalInstance>();
const templates = new WeakMap<any, ModalInstance[]>();

// 渲染弹窗组件到根节点
const renderRoot = (Template, props) => {
  const dom = document.createElement('div');
  dom.setAttribute('class', 'portal-instance-container');
  document.body.appendChild(dom);
  const newProps = typeof props === 'function' ? props(dom) : props;
  const template = React.createElement(Template, newProps);
  const root = createRoot(dom);
  const render = (template) => {
    root.render(template);
  };
  const unmount = () => {
    root?.unmount();
  };
  render(template);
  const instance = { render, unmount, dom };
  doms.set(dom, instance);
  const list = templates.get(Template);
  const newList = list ? list.concat(instance) : [instance];
  templates.set(Template, newList);
  return instance;
};

// unmountModal
export const unmountModal = (instance?: ModalInstance, unmountDelay?: number) => {
  setTimeout(() => {
    if (instance?.dom) {
      instance?.unmount();
      document.body.removeChild(instance?.dom);
      doms.delete(instance?.dom);
    }
  }, unmountDelay || 0);
};

// clear All
export const clearModal = (Template, unmountDelay?: number) => {
  const list = templates.get(Template);
  list?.forEach(instance => {
    unmountModal(instance, unmountDelay);
  });
  templates.delete(Template);
};

const renderModal = (Template, props, options?: { unmountDelay?: number }) => {
  const instance = renderRoot(Template, props);

  return {
    destroy: () => {
      const unmountDelay = options?.unmountDelay;
      const params = {
        ...props,
        open: false,
        // 无unmountDelay时，支持afterClose事件去卸载
        afterClose: (...arg) => {
          if (typeof props?.afterClose === 'function') {
            props.afterClose(...arg);
          }
          if (unmountDelay) return;
          unmountModal(instance, unmountDelay);
        }
      };
      const template = React.createElement(Template, params);
      instance?.render(template);
      if (unmountDelay) {
        unmountModal(instance, unmountDelay);
      }
    }
  };
};

export default renderModal;
