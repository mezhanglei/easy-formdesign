import React from 'react';
import { getConfigItem, insertWidgetItem } from '../utils';
import { FormEditorContextProps, useEditorContext } from '../context';

export interface PanelCommonProps {
  editorContext?: FormEditorContextProps;
  insert?: (key: string) => void;
}

export const PanelContainer = (Panel) => {
  const Com: React.FC<PanelCommonProps & { [key: string]: unknown }> = (props) => {

    const editorContext = useEditorContext();
    const { selected, editor, editorConfig, historyRecord } = editorContext?.state;

    const insert = (key: string) => {
      const curPath = selected?.path;
      const end = curPath?.[curPath.length - 1];
      const configItem = getConfigItem(key, editorConfig); // 插入新组件
      const parent = curPath?.slice(0, curPath.length - 1);
      const nextIndex = end === undefined ? undefined : +end + 1;
      insertWidgetItem(editor, configItem, nextIndex, parent);
      historyRecord?.save();
    };

    return <Panel {...props} insert={insert} editorContext={editorContext} />;
  };
  return Com;
};
