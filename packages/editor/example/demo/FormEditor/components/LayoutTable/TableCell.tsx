import React, { useState } from 'react';
import {
  BaseSelection,
  BaseSelectionProps,
  getCommonOptions,
  SvgIcon,
  BaseDnd,
  TableUtils
} from "@simpleform/editor";
import classnames from 'classnames';
import './index.less';
import { Menu, MenuDivider, MenuItem } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { LayoutTableRows } from '.';
import { renderWidgetItem } from '../../FormRender';

export type CustomTableCellProps = React.HtmlHTMLAttributes<HTMLTableCellElement> & BaseSelectionProps & {
  rows: NonNullable<LayoutTableRows>;
  rowIndex: number;
  cols: NonNullable<LayoutTableRows[number]>;
  colIndex: number;
  tableUtils: TableUtils;
};

const CustomTableCell = React.forwardRef<HTMLTableCellElement, CustomTableCellProps>((props, ref) => {
  const {
    className,
    rows,
    rowIndex,
    cols,
    colIndex,
    tableUtils,
    ...rest
  } = props;

  const { _options } = rest || {};
  const { isEditor, path, formrender, editorContext } = _options || {};
  const widgetList = cols?.[colIndex]?.children || [];
  const commonOptions = getCommonOptions(_options);
  const [selectCell, setSelectCell] = useState<{ rowIndex: number; colIndex: number }>({
    rowIndex: -1,
    colIndex: -1,
  });
  const [disabledHandles, setDisabledHandles] = useState(tableUtils.getDisabledHandles());

  const handleSelectCell = (rowIndex: number, colIndex: number) => {
    setSelectCell({
      rowIndex,
      colIndex
    });
    const handles = tableUtils.getDisabledHandles(
      rowIndex,
      colIndex
    );
    setDisabledHandles(handles);
  };

  const handleFn = (operateName: string) => {
    const { rowIndex, colIndex } = selectCell;
    if (rowIndex > -1 && colIndex > -1) {
      switch (operateName) {
        case "insertTopRow": {
          const res = tableUtils.insertRow(rowIndex, colIndex, 0);
          res && handleSelectCell(res?.rowIndex, res?.colIndex);
          break;
        }
        case "insertBottomRow": {
          const res = tableUtils.insertRow(rowIndex, colIndex, 1);
          res && handleSelectCell(res?.rowIndex, res?.colIndex);
          break;
        }

        case "insertLeftCol": {
          const res = tableUtils.insertCol(rowIndex, colIndex, 0);
          res && handleSelectCell(res?.rowIndex, res?.colIndex);
          break;
        }
        case "insertRightCol": {
          const res = tableUtils.insertCol(rowIndex, colIndex, 1);
          res && handleSelectCell(res?.rowIndex, res?.colIndex);
          break;
        }
        default: {
          const fn = (tableUtils[operateName] as Function).bind(tableUtils);
          if (fn) {
            const res = fn(rowIndex, colIndex);
            res && handleSelectCell(res?.rowIndex, res?.colIndex);
          }
        }
      }
    }
  };

  const cls = classnames(className, {
    'edit-cell': isEditor
  });

  const childs = widgetList?.map((child, childIndex) => {
    const _childOptions = {
      ...commonOptions,
      index: childIndex,
      path: (path || []).concat('children', childIndex),
    };
    const instance = renderWidgetItem(formrender, child, _childOptions);
    return instance;
  });

  const operateBtn = (
    <Menu menuButton={<span><SvgIcon name="menu" /></span>}>
      <MenuItem key="1" disabled={disabledHandles?.includes('insertCol')} onClick={() => handleFn('insertLeftCol')}>插入左侧列</MenuItem>
      <MenuItem key="2" disabled={disabledHandles?.includes('insertCol')} onClick={() => handleFn('insertRightCol')}>插入右侧列</MenuItem>
      <MenuItem key="3" disabled={disabledHandles?.includes('insertRow')} onClick={() => handleFn('insertTopRow')}>插入上方行</MenuItem>
      <MenuItem key="4" disabled={disabledHandles?.includes('insertRow')} onClick={() => handleFn('insertBottomRow')}>插入下方行</MenuItem>
      <MenuDivider />
      <MenuItem key="5" disabled={disabledHandles?.includes('leftMerge')} onClick={() => handleFn('leftMerge')}>合并左侧单元格</MenuItem>
      <MenuItem key="6" disabled={disabledHandles?.includes('rightMerge')} onClick={() => handleFn('rightMerge')}>合并右侧单元格</MenuItem>
      {/* <MenuItem key="7" disabled={disabledHandles?.includes('')}>合并整行</MenuItem> */}
      <MenuDivider />
      <MenuItem key="8" disabled={disabledHandles?.includes('topMerge')} onClick={() => handleFn('topMerge')}>合并上方单元格</MenuItem>
      <MenuItem key="9" disabled={disabledHandles?.includes('bottomMerge')} onClick={() => handleFn('bottomMerge')}>合并下方单元格</MenuItem>
      {/* <MenuItem key="10" disabled={disabledHandles?.includes('')}>合并整列</MenuItem> */}
      <MenuDivider />
      <MenuItem key="11" disabled={disabledHandles?.includes('splitH')} onClick={() => handleFn('splitH')}>水平拆分</MenuItem>
      <MenuItem key="12" disabled={disabledHandles?.includes('splitV')} onClick={() => handleFn('splitV')}>垂直拆分</MenuItem>
      <MenuItem key="13" disabled={disabledHandles?.includes('delCol')} onClick={() => handleFn('delCol')}>删除整列</MenuItem>
      <MenuItem key="14" disabled={disabledHandles?.includes('delRow')} onClick={() => handleFn('delRow')}>删除整行</MenuItem>
    </Menu>
  );

  return (
    <td ref={ref} className={cls} {...rest}>
      {isEditor ?
        <BaseSelection
          hiddenDel
          _options={_options}
          className="cell-selection"
          configLabel="单元格"
          tools={[operateBtn]}
          getter={(path) => {
            handleSelectCell(rowIndex, colIndex);
            return { path };
          }}
        >
          <BaseDnd
            _options={_options}
            style={{ height: '100%' }}
            dndPath={(path || []).concat('children')}
            dndList={widgetList}>
            {childs}
          </BaseDnd>
        </BaseSelection>
        :
        childs
      }
    </td>
  );
});

export default CustomTableCell;
