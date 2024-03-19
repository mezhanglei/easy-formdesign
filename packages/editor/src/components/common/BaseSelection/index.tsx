import classnames from 'classnames';
import React, { useState } from 'react';
import './index.less';
import pickAttrs from '../../../utils/pickAttrs';
import { FormEditorState } from '../../../context';
import { CommonWidgetProps } from '../../../components/formrender';

export interface BaseSelectionProps extends CommonWidgetProps, Omit<React.HtmlHTMLAttributes<HTMLDivElement>, 'onSelect' | 'onChange'> {
  tools?: any[]; // 工具栏
  configLabel?: string; // 当前组件的名字
  onSelect?: (selected: FormEditorState['selected']) => void;
}

/**
 * 基础选择框组件
 * @param props 
 * @param ref 
 * @returns 
 */
function BaseSelection(props: BaseSelectionProps, ref: any) {
  const {
    children,
    className,
    path,
    widgetItem,
    formrender: editor,
    form: editorForm,
    configLabel,
    tools,
    onMouseOver,
    onMouseOut,
    onSelect,
    ...restProps
  } = props;

  const [isOver, setIsOver] = useState<boolean>(false);
  const context = widgetItem?.context;
  const { selected } = context?.state || {};
  const isSelected = path ? path === selected?.path : false;

  const nextSelected = {
    path: path
  };

  const chooseItem = (e: any) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(nextSelected);
      return;
    }
    context?.dispatch && context?.dispatch((old) => ({
      ...old,
      selected: nextSelected
    }));
  };

  const prefixCls = "editor-selection";
  const overCls = `${prefixCls}-over`;
  const handleMouseOver = (e: any) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.add(overCls);
      setIsOver(true);
    }
    onMouseOver && onMouseOver(e);
    context?.dispatch && context?.dispatch((old) => ({
      ...old,
      beforeSelected: nextSelected
    }));
  };

  const handleMouseOut = (e: any) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove(overCls);
      setIsOver(false);
    }
    onMouseOut && onMouseOut(e);
  };

  const cls = classnames(prefixCls, className, {
    [`${prefixCls}-active`]: isSelected,
  });

  const classes = {
    mask: `${prefixCls}-mask`,
    tools: `${prefixCls}-tools`,
    label: `${prefixCls}-label`,
  };

  return (
    <div ref={ref} className={cls} {...pickAttrs(restProps)} onClick={chooseItem} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      {isOver && !isSelected && configLabel && <div className={classes.label}>{configLabel}</div>}
      {isSelected && <div className={classes.tools}>{tools}</div>}
      {children}
    </div>
  );
};

export default React.forwardRef(BaseSelection);
