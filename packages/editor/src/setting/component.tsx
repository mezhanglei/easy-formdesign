import React, { CSSProperties, useEffect, useMemo } from 'react';
import classnames from 'classnames';
import { CustomFormRenderProps, Form, FormChildren, joinFormPath, useSimpleForm } from '../components/formrender';
import { getNameSetting, asyncSettingForm, setFormValue } from '../utils/utils';
import './component.less';
import CustomCollapse from '../components/common/Collapse';
import { useEditorContext } from '../context';

export interface SelectedSettingProps {
  className?: string
  style?: CSSProperties
}
const prefixCls = 'item-setting';

// 选中节点的属性设置
function SelectedSetting(props: SelectedSettingProps, ref: any) {
  const {
    style,
    className,
  } = props;

  const context = useEditorContext();
  const { selected, editor, editorForm, editorConfig } = context.state;
  const selectedPath = selected?.path;
  const selectedName = selected?.name;
  const attributeName = selected?.attributeName;
  const form = useSimpleForm();
  const cls = classnames(prefixCls, className);
  const configSetting = useMemo(() => {
    if (!selected) return;
    const selectedItem = editor?.getItemByPath(selected?.path, selected?.attributeName);
    const configSetting = editorConfig?.[selectedItem?.type || '']?.setting;
    const appendSetting = selected.appendSetting;
    return appendSetting || configSetting;
  }, [editor, selectedPath, attributeName, editorConfig]);
  const nameSetting = useMemo(() => getNameSetting(selected), [selectedPath, attributeName]); // 表单节点字段设置
  useEffect(() => {
    context.dispatch((old) => ({ ...old, settingForm: form }));
  }, []);

  useEffect(() => {
    if (!form) return;
    // 选中后先重置值, 防止值和渲染不同步导致报错
    form.reset();
    // 渲染结束后再处理值
    setTimeout(() => {
      asyncSettingForm(editor, form, selected);
    }, 50);
  }, [selectedPath, attributeName]);

  const onFieldsChange: CustomFormRenderProps['onFieldsChange'] = ({ name, value }) => {
    if (typeof name !== 'string') return;
    if (name == 'name') {
      editor?.updateNameByPath(value, selectedPath);
      // 更新selected
      if (!attributeName) {
        const joinName = joinFormPath(selected?.parent?.name, value);
        const joinPath = joinFormPath(selected?.parent?.path, value);
        context.dispatch((old) => ({ ...old, selected: { ...selected, name: joinName, path: joinPath } }));
      }
    } else {
      editor?.updateItemByPath(value, selectedPath, joinFormPath(attributeName, name));
      if (!attributeName) {
        // 更新editorForm
        if (name === 'initialValue') {
          setFormValue(editorForm, selectedName, value);
        }
      }
    }
  };

  const renderCommonList = () => {
    if (!configSetting) return;
    return (
      Object.entries(configSetting)?.map(([name, data]) => {
        return (
          <CustomCollapse header={name} key={name} isOpened>
            <FormChildren properties={data} options={{ context: context }} />
          </CustomCollapse>
        );
      })
    );
  };

  return (
    <div ref={ref} className={cls} style={style}>
      <Form layout="vertical" form={form} onFieldsChange={onFieldsChange}>
        <FormChildren properties={nameSetting} uneval />
        {renderCommonList()}
      </Form>
    </div>
  );
};

SelectedSetting.displayName = 'component-setting';
export default React.forwardRef(SelectedSetting);
