import React from "react";
import classnames from "classnames";
import './index.less';
import { FormTableProps } from "..";
import pickAttrs from '../../../../utils/pickAttrs';
import { CustomFormRenderProps, joinFormPath, renderWidgetItem } from "../../../../formrender";
import BaseDnd from "../../../../view/BaseDnd";
import Icon from '../../SvgIcon';
import { getCommonOptions, getWidgetItem, setWidgetItem } from '../../../../utils/utils';
import FormTableColSetting from './column-setting';
import BaseSelection, { BaseSelectionProps } from '../../../../view/BaseSelection';

const EditorTable = React.forwardRef<HTMLDivElement, FormTableProps<unknown>>(({
  columns = [],
  className,
  style,
  value,
  onChange,
  _options,
  ...restTable
}, ref) => {

  const prefix = "design-table";
  const Classes = {
    Table: prefix,
    TableBody: `${prefix}-body`,
    TableCol: `${prefix}-col`,
    TableSelection: `${prefix}-selection`,
    TableColHead: `${prefix}-col__head`,
    TableColBody: `${prefix}-col__body`,
    TableDnd: `${prefix}-dnd`,
    placeholder: `${prefix}-placeholder`,
  };

  const { path, formrender, context } = _options || {};
  const commonOptions = getCommonOptions(_options);
  const columnsPath = joinFormPath(path, 'props.columns');
  const { settingForm, editorConfig } = context?.state || {};

  // 监听列控件设置值
  const columnInputChange: CustomFormRenderProps['onValuesChange'] = ({ value }) => {
    settingForm && settingForm.setFieldValue('initialValue', value);
  };

  const onSelectHandler: BaseSelectionProps['onSelectHandler'] = (nextSelected) => {
    const selectedItem = getWidgetItem(formrender, nextSelected?.path);
    const configSetting = editorConfig?.[selectedItem?.type || ''].setting;
    const baseSetting = configSetting?.['基础属性']?.filter((item) => item.name !== 'name');
    const mergeSetting = Object.assign(FormTableColSetting, {
      '基础属性': baseSetting,
      '操作属性': configSetting?.['操作属性'],
      '校验规则': configSetting?.['校验规则']
    });
    context?.dispatch && context?.dispatch((old) => ({
      ...old,
      selected: Object.assign({ setting: mergeSetting }, nextSelected)
    }));
  };

  const copyItem = (column, colIndex) => {
    const nextColIndex = colIndex + 1;
    const cloneColumns = [...columns];
    const newColumn = {
      ...column
    };
    cloneColumns.splice(nextColIndex, 0, newColumn);
    setWidgetItem(formrender, cloneColumns, path);
  };

  return (
    <div
      className={classnames([Classes.Table, className])}
      {...pickAttrs(restTable)}
      style={style}
      ref={ref}>
      <BaseDnd
        className='table-dnd'
        _options={_options}
        dndPath={columnsPath}
        dndList={_options?.props?.columns as unknown[]}
        group={{
          name: "table-columns",
          pull: "clone",
          put: ['sort-field', 'panel']
        }}
      >
        {
          columns?.map((col, colIndex) => {
            const { label } = col;
            const { renderItem, renderList, ...restOptions } = commonOptions;
            const _childOptions = {
              ...restOptions,
              index: colIndex,
              path: joinFormPath(columnsPath, colIndex),
              onValuesChange: columnInputChange
            };
            const widget = { ...col, label: '' };
            const instance = renderWidgetItem(formrender, widget, _childOptions);
            return (
              <BaseSelection
                key={colIndex}
                className={Classes.TableSelection}
                _options={_childOptions}
                configLabel="表格列"
                onSelectHandler={onSelectHandler}
                tools={[<Icon key="fuzhi" name="fuzhi" onClick={() => copyItem(col, colIndex)} />]}
              >
                <div className={Classes.TableCol}>
                  <div className={Classes.TableColHead}>
                    {label}
                  </div>
                  <div className={Classes.TableColBody}>
                    {instance}
                  </div>
                </div>
              </BaseSelection>
            );
          })
        }
      </BaseDnd>
      {!columns?.length && <span className={Classes.placeholder}>将控件拖拽到此处</span>}
    </div>
  );
});

export default EditorTable;
