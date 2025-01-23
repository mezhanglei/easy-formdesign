import React from 'react';
import { RowProps } from 'antd';
import classnames from 'classnames';
import './index.less';
import {
  BaseSelection,
  SvgIcon,
  getCommonOptions,
  insertWidgetItem,
  CommonFormProps,
  EditorGenerateWidgetItem,
} from '@simpleform/editor';
import GridCol from './col';
import { GridColConfig } from './config';
import { CustomRow } from '../../FormRender';

export type CustomRowProps = RowProps & CommonFormProps<unknown, { cols?: Array<EditorGenerateWidgetItem> }>;

const Grid = React.forwardRef<HTMLDivElement, CustomRowProps>((props, ref) => {
  const {
    className,
    style,
    ...rest
  } = props;

  const { _options } = rest || {};
  const { isEditor, cols, path, formrender } = _options || {};
  const commonOptions = getCommonOptions(_options);
  const colsPath = (path || []).concat('cols');
  const cls = classnames(className, {
    'edit-row': isEditor
  });

  const addCol = () => {
    const childs = _options?.children instanceof Array ? _options?.children : [];
    const nextIndex = childs?.length || 0;
    const newItem = {
      ...GridColConfig,
      children: []
    };
    insertWidgetItem(formrender, newItem, nextIndex, colsPath);
  };

  const childs = cols?.map((col, colIndex) => {
    const colProps = { ..._options?.props, ...col?.props };
    const _colOptions = {
      ...commonOptions,
      ...col,
      props: colProps,
      index: colIndex,
      path: colsPath.concat(colIndex),
    };
    return <GridCol key={_colOptions?.path} {...colProps} column={col} colIndex={colIndex} _options={_colOptions} />;
  });

  return (
    <CustomRow ref={ref} style={style} className={cls} {...rest}>
      {isEditor ?
        <BaseSelection
          {...rest}
          className="row-selection"
          configLabel={_options?.panel?.label}
          tools={[<SvgIcon key="add" name="add" onClick={addCol} />]}
        >
          {childs}
        </BaseSelection>
        :
        childs
      }
    </CustomRow>
  );
});

export default Grid;
