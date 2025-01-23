import { ReactSortable, ReactSortableProps } from "react-sortablejs";
import React, { CSSProperties } from 'react';
import { DndContainer, DndComomonProps } from "../containers";

export interface BaseDndProps extends DndComomonProps {
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}

// 控件的拖放区域组件
const BaseDnd: React.FC<BaseDndProps> = (props) => {
  const { children, dndList, add, update, ...rest } = props;

  const onUpdate: ReactSortableProps<any>['onUpdate'] = (params) => {
    const oldIndex = params?.oldIndex;
    const newIndex = params?.newIndex;
    console.log(params, '同域拖放');
    update?.(oldIndex, newIndex);
  };

  const onAdd: ReactSortableProps<any>['onAdd'] = (params) => {
    console.log(params, '跨域拖放');
    const from = params?.item;
    const isPanel = from?.dataset?.group === 'panel';
    const fromPath = isPanel ? undefined : JSON.parse(from?.dataset?.path || '[]');
    const dropIndex = params?.newIndex;
    if (!isPanel && !fromPath) {
      console.error('未设置data-path属性');
      return;
    }
    add?.(dropIndex, { path: fromPath, data: from?.dataset });
  };

  return (
    <ReactSortable
      list={dndList || []}
      setList={() => { }}
      group={{
        name: "sort-field",
        pull: "clone",
        put: ['sort-field', 'panel']
      }}
      onUpdate={onUpdate}
      onAdd={onAdd}
      {...rest}
    >
      {
        // 处理非node节点
        React.Children.map(children, (child, i) => {
          return React.isValidElement(child) ? child : <div key={i}>{child}</div>;
        })
      }
    </ReactSortable>
  );
};

export default DndContainer(BaseDnd);
