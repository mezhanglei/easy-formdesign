import React from 'react';
import { BuilderCommonProps, RuleBuilderGroupItem } from '../../typings';

export default Group => {
  return (props: Omit<RuleBuilderGroupItem, 'type' | 'children'> & BuilderCommonProps & { children?: React.ReactNode }) => {
    const {
      path,
      children,
      properties,
      actions,
      config,
    } = props;

    const currentNesting = path?.length;
    const maxNesting = config?.settings?.maxNesting;
    const allowFurtherNesting =
      typeof maxNesting === 'undefined' || currentNesting < maxNesting;
    const allowRemoval = currentNesting > 1;

    const setConjunction = conjunction => {
      actions?.setConjunction(path, conjunction);
    };

    const removeSelf = () => {
      actions?.removeGroup(path);
    };

    const addGroup = () => {
      actions?.addGroup(path);
    };

    const addRule = () => {
      actions?.addRule(path);
    };

    return (
      <Group
        config={config}
        allowRemoval={allowRemoval}
        allowFurtherNesting={allowFurtherNesting}
        conjunction={properties?.conjunction}
        setConjunction={setConjunction}
        removeSelf={removeSelf}
        addGroup={addGroup}
        addRule={addRule}
      >
        {children}
      </Group>
    );
  };
};
