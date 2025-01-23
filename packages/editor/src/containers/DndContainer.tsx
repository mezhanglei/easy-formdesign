import { WidgetContextProps, WidgetOptions } from '@simpleform/render';
import React from 'react';
import { getConfigItem, insertWidgetItem, moveWidgetItem } from '../utils';
import { EditorOptions } from '../typings';

export interface DndComomonProps extends WidgetContextProps<EditorOptions> {
  dndPath?: WidgetOptions['path'];
  dndList?: Array<unknown>;
  add?: (dropIndex?: number, from?: { path?: WidgetOptions['path'], data: any }) => void;
  update?: (oldIndex?: number, newIndex?: number) => void;
}

export const DndContainer = (DndComponent) => {
  const Com = (props: DndComomonProps & { [key: string]: unknown }) => {
    const {
      _options,
      dndPath = [],
      dndList = [],
      ...rest
    } = props;

    const editorContext = _options?.editorContext;
    const formrender = _options?.formrender;
    const { historyRecord, editorConfig } = editorContext?.state || {};

    const update: DndComomonProps['update'] = (oldIndex, newIndex) => {
      if (typeof oldIndex !== 'number') return;
      const dropIndex = newIndex === undefined ? dndList?.length : newIndex;
      const fromPath = (dndPath || []).concat(oldIndex);
      const toPath = (dndPath || []).concat(dropIndex);
      moveWidgetItem(formrender, fromPath, toPath);
      editorContext?.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: toPath }) }));
      historyRecord?.save();
    };

    const add: DndComomonProps['add'] = (newIndex, from) => {
      const fromPath = from?.path;
      const dropIndex = newIndex === undefined ? dndList?.length : newIndex;
      const toPath = (dndPath || []).concat(dropIndex || dndList?.length);
      // 当前区域外部插入
      if (!fromPath) {
        const fromType = from?.data?.type;
        const configItem = getConfigItem(fromType, editorConfig);
        insertWidgetItem(formrender, configItem, dropIndex, dndPath);
        editorContext?.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: toPath }) }));
      } else {
        // 当前区域内部跨域
        moveWidgetItem(formrender, fromPath, toPath);
        editorContext?.dispatch((old) => ({ ...old, selected: Object.assign(old?.selected, { path: toPath }) }));
      }
      historyRecord?.save();
    };

    const styles = {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignContent: 'flex-start',
      flexWrap: 'wrap',
    };

    return (
      <DndComponent
        {...rest}
        style={styles}
        dndPath={dndPath}
        dndList={dndList}
        _options={_options}
        update={update}
        add={add}
      />
    );
  };
  return Com;
};
