import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import './index.less';
import { ReactSortable } from "react-sortablejs";
import { Tag } from 'antd';
import { PanelContainer, PanelCommonProps } from '../containers';
import { FormEditorContextProps } from '../context';

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

export interface EditorPanelProps extends PanelCommonProps {
  className?: string;
  style?: CSSProperties;
  panelData?: Record<string, string[]>; // 组件面板配置
  children?: (editorContext?: FormEditorContextProps) => React.ReactElement;
}

const prefixCls = `simple-form-panel`;
function EditorPanel(props: EditorPanelProps) {
  const {
    className,
    panelData,
    insert,
    editorContext,
    children,
    ...rest
  } = props;

  const { editorConfig } = editorContext?.state || {};
  const cls = classnames(prefixCls, className);

  return (
    typeof children == 'function' ?
      children(editorContext)
      :
      <div className={cls} {...rest}>
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
                      return <Tag
                        className="component-tag"
                        key={key}
                        data-type={key}
                        data-group='panel'
                        onClick={(e) => insert?.(key)}>
                        {panel.label}
                      </Tag>;
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

export default PanelContainer(EditorPanel);
