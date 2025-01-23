import { ColProps } from 'antd';
import classnames from 'classnames';
import React from 'react';
import './col.less';
import {
  BaseDnd,
  BaseSelection,
  BaseSelectionProps,
  EditorGenerateWidgetItem,
  getCommonOptions
} from '@simpleform/editor';
import { CustomCol, renderWidgetItem } from '../../FormRender';

export type CustomColProps = Omit<ColProps, 'draggable' | 'onSelect'> & BaseSelectionProps & {
  column: ColProps & { children?: EditorGenerateWidgetItem[] };
  colIndex: number;
};
// col组件
const GridCol = React.forwardRef<HTMLDivElement, CustomColProps>((props, ref) => {
  const {
    className,
    style,
    column,
    colIndex,
    ...rest
  } = props;

  const { _options } = rest || {};
  const { isEditor, path, formrender } = _options || {};
  const widgetList = column?.children;
  const commonOptions = getCommonOptions(_options);
  const cls = classnames(className, {
    'edit-col': isEditor
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

  return (
    <CustomCol ref={ref} style={style} className={cls} {...rest}>
      {isEditor ?
        <BaseSelection
          _options={_options}
          className="col-selection"
          configLabel="栅格列"
        >
          <BaseDnd
            _options={_options}
            dndPath={(path || []).concat('children')}
            dndList={widgetList}>
            {childs}
          </BaseDnd>
        </BaseSelection>
        :
        childs
      }
    </CustomCol>
  );
});

export default GridCol;
