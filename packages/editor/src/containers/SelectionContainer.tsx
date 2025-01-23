import { isEqualPath, WidgetContextProps } from '@simpleform/render';
import React, { useState } from 'react';
import { delWidgetItem } from '../utils';
import { FormEditorState } from '../context';
import { EditorOptions } from '../typings';

export interface SelectionCommonProps extends WidgetContextProps<EditorOptions> {
  checked?: boolean;
  isOver?: boolean;
  setSelection?: () => void;
  deleteItem?: () => void;
  setMouseOver?: (isOver?: boolean, target?: HTMLElement) => void;
  getter?: (path) => FormEditorState['selected'] // 选中项信息
}

export const SelectionContainer = (Selection) => {
  const Com = React.forwardRef<HTMLDivElement, SelectionCommonProps & { [key: string]: unknown }>((props, ref) => {

    const {
      _options,
      getter,
      ...rest
    } = props;

    const overCls = `selection-over`;
    const path = _options?.path;
    const editor = _options?.formrender;
    const editorContext = _options?.editorContext;
    const { selected, historyRecord } = editorContext?.state || {};
    const selectedPath = selected?.path;
    const checked = path ? isEqualPath(path, selectedPath) : false;
    const [isOver, setIsOver] = useState<boolean>(false);

    const setSelection = () => {
      editorContext?.dispatch && editorContext?.dispatch((old) => ({
        ...old,
        selected: {
          path,
          ...(getter?.(path))
        }
      }));
    };

    const deleteItem = () => {
      editorContext?.dispatch && editorContext?.dispatch((old) => ({ ...old, selected: {} }));
      delWidgetItem(editor, path);
      historyRecord?.save();
    };

    const setMouseOver = (isOver, target) => {
      if (target) {
        if (isOver) {
          target.classList.add(overCls);
          setIsOver(isOver);
        } else {
          target.classList.remove(overCls);
          setIsOver(false);
        }
      }
    };

    return (
      <Selection
        ref={ref}
        _options={_options}
        checked={checked}
        isOver={isOver}
        setSelection={setSelection}
        deleteItem={deleteItem}
        setMouseOver={setMouseOver}
        {...rest}
      />
    );
  });
  return Com;
};
