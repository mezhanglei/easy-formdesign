import classnames from 'classnames';
import React, { CSSProperties, ReactNode } from 'react';
import './BaseSelection.less';
import { SvgIcon } from '../common';
import { pickAttrs } from '../utils';
import { SelectionContainer, SelectionCommonProps } from '../containers';

export interface BaseSelectionProps extends SelectionCommonProps {
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  hiddenDel?: boolean;
  tools?: ReactNode[]; // 工具栏
  configLabel?: string; // 当前组件的名字
}

/**
 * 基础选择框组件
 * @param props 
 * @param ref 
 * @returns 
 */
const BaseSelection = React.forwardRef<HTMLDivElement, BaseSelectionProps>((props, ref) => {
  const {
    children,
    className,
    _options,
    configLabel,
    tools,
    hiddenDel,
    checked,
    isOver,
    setSelection,
    deleteItem,
    setMouseOver,
    ...restProps
  } = props;

  const prefixCls = "editor-selection";

  const onClick = () => {
    setSelection?.();
  };

  const deleteColumn = (e) => {
    e.stopPropagation();
    deleteItem?.();
  };

  const onMouseOver = (e) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    setMouseOver?.(true, target);
  };

  const onMouseOut = (e) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    setMouseOver?.(false, target);
  };

  const cls = classnames(prefixCls, className, {
    [`${prefixCls}-active`]: checked,
  });

  const classes = {
    mask: `${prefixCls}-mask`,
    tools: `${prefixCls}-tools`,
    label: `${prefixCls}-label`,
    close: `${prefixCls}-close`,
  };

  return (
    <div
      ref={ref}
      className={cls}
      {...pickAttrs(restProps)}
      onClickCapture={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {isOver && !checked && configLabel && <div className={classes.label}>{configLabel}</div>}
      {(isOver || checked) && !hiddenDel && <SvgIcon className={classes.close} key="close" name="close" onClick={deleteColumn} />}
      {checked && <div className={classes.tools}>{tools}</div>}
      {children}
    </div>
  );
});

export default SelectionContainer(BaseSelection);
