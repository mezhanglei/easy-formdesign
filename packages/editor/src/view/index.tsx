import React, { CSSProperties } from 'react';
import classnames from 'classnames';
import './index.less';
import FormRender from '@simpleform/render';
import { getWidgetItem, insertWidgetItem, setWidgetItem } from '../utils';
import { FormEditorContextProps, useEditorContext } from '../context';
import PlatContainer from '../tools/platContainer';
import BaseDnd, { BaseDndProps } from './BaseDnd';
import BaseSelection from './BaseSelection';
import { SvgIcon } from '../common';

export interface EditorViewProps {
  className?: string;
  style?: CSSProperties;
  children?: (editorContext: FormEditorContextProps) => React.ReactElement;
}

function EditorView(props: EditorViewProps) {

  const editorContext = useEditorContext();
  const renderConfig = editorContext?.state?.renderConfig;
  const { platType = 'pc', selected, editor, editorForm, settingForm, widgetList } = editorContext?.state || {};

  const {
    style,
    className,
    children,
    ...restProps
  } = props;

  const onRenderChange = (newData) => {
    console.log(newData, '表单');
    editorContext?.dispatch((old) => ({
      ...old,
      widgetList: newData || []
    }));
  };

  // 监听编辑区域的初始表单值
  const onFieldsChange = (_) => {
    setWidgetItem(editor, _?.value, (selected?.path || []).concat('initialValue'));
    settingForm && settingForm.setFieldValue('initialValue', _?.value);
  };

  const cls = classnames("editor-view", className);

  return (
    typeof children === 'function' ?
      children(editorContext)
      :
      <main
        className={cls}
        style={style}
        {...restProps}
      >
        <PlatContainer plat={platType}>
          <FormRender
            {...renderConfig}
            wrapper={RootDnd}
            options={{ ...renderConfig?.options, isEditor: true, editorContext }}
            formrender={editor}
            form={editorForm}
            widgetList={widgetList}
            onRenderChange={onRenderChange}
            onFieldsChange={onFieldsChange}
            renderItem={withSelection}
          />
        </PlatContainer>
      </main>
  );
};

// 编辑区默认的选中框渲染
const withSelection = (children, params) => {
  const _options = params?._options || {};
  const nonselection = _options?.panel?.nonselection;
  if (nonselection) {
    return children;
  }

  // 复制
  const copyItem = () => {
    const path = _options?.path;
    const editor = _options?.formrender;
    const editorContext = _options?.editorContext;
    const { historyRecord } = editorContext?.state || {};
    const currentIndex = _options?.index || -1;
    const nextIndex = currentIndex + 1;
    const newItem = getWidgetItem(editor, path);
    insertWidgetItem(editor, newItem, nextIndex, path?.slice(0, path.length - 1));
    historyRecord?.save();
  };

  return (
    <BaseSelection
      {...params}
      configLabel={_options?.panel?.label}
      tools={[<SvgIcon key="fuzhi" name="fuzhi" onClick={copyItem} />]}
    >
      {children}
    </BaseSelection>
  );
};

// 根节点的拖放区域
const RootDnd: React.FC<BaseDndProps> = (props) => {
  const editorContext = useEditorContext();
  return <BaseDnd
    {...props}
    dndList={editorContext?.state?.widgetList || []}
    _options={{ ...props._options, editorContext }}
  />;
};

EditorView.displayName = 'editor-view';
export default EditorView;
