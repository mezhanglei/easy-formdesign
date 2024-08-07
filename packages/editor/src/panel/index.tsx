import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import './index.less';
import { defaultGetId, getConfigItem, getListIndex, getWidgetItem, insertWidgetItem } from '../utils/utils';
import { ReactSortable } from "react-sortablejs";
import { FormEditorContextProps, useEditorContext } from '../context';
import { getParent } from '../formrender';
import { message, Tag } from 'antd';

const defaultPanelData = {
  '布局组件': ['Grid', 'Divider', 'Alert'],
  '控件组合': ['FormTable'],
  '基础控件': [
    "Input",
    "Radio.Group",
    "Checkbox.Group",
    "Select",
    "Switch",
    "TimePicker",
    "TimePicker.RangePicker",
    "DatePicker",
    "DatePicker.RangePicker",
    "Slider",
    "Rate",
    "Cascader",
    "FileUpload",
    "ImageUpload",
    "RichEditor",
    "RichText",
  ]
};

export interface EditorPanelProps {
  className?: string
  style?: CSSProperties
  panelData?: Record<string, string[]>; // 组件面板配置
  children?: (context: FormEditorContextProps) => React.ReactElement;
}

const prefixCls = `simple-form-panel`;
function EditorPanel(props: EditorPanelProps) {
  const {
    style,
    className,
    panelData,
    children
  } = props;

  const context = useEditorContext();
  const { selected, editor, editorConfig, historyRecord } = context?.state;
  const cls = classnames(prefixCls, className);

  const onChange = (key: string) => {
    const newIndex = getListIndex(editor, selected?.path) + 1; // 插入位置序号
    const item = getWidgetItem(editor, selected?.path);
    // 如果选中的是容器不允许点击插入
    if (item?.children) {
      message.info('请选择拖拽方式插入');
      return;
    };
    const configItem = getConfigItem(key, editorConfig); // 插入新组件
    const newItem = configItem?.panel?.nonform ? configItem : Object.assign({ name: defaultGetId(configItem?.type) }, configItem);
    insertWidgetItem(editor, newItem, newIndex, getParent(selected?.path));
    historyRecord?.save();
  };

  return (
    typeof children == 'function' ?
      children(context)
      :
      <div className={cls} style={style}>
        {
          Object.entries(panelData || defaultPanelData).map(([title, list]) => {
            return (
              <div key={title} className='panel-list'>
                <div className={`panel-list-title`}>{title}</div>
                <ReactSortable
                  list={list as any[]}
                  setList={() => { }}
                  forceFallback={true}
                  sort={false}
                  className='elements-list'
                  animation={200}
                  group={{
                    name: "panel",
                    pull: "clone",
                    put: false,
                  }}
                >
                  {
                    list.map((key) => {
                      const data = editorConfig?.[key] || {};
                      const panel = typeof data?.panel === 'object' ? data?.panel : {};
                      return <Tag className="component-tag" key={key} data-type={key} data-group='panel' onClick={(e) => onChange?.(key)}>{panel.label}</Tag>;
                    })
                  }
                </ReactSortable>
              </div>
            );
          })
        }
      </div>
  );
};

EditorPanel.displayName = 'editor-panel';
export default EditorPanel;
