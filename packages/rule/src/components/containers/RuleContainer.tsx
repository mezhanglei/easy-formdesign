import React from 'react';
import Widget from '../Widget';
import Operator from '../Operator';
import { BuilderCommonProps, RuleBuilderRuleItem } from '../../typings';
import { RuleProps } from '../Rule';

export default (Rule: React.FC<RuleProps>) => {
  return (props: Omit<RuleBuilderRuleItem, 'type'> & BuilderCommonProps) => {
    const {
      path,
      properties,
      actions,
      config,
    } = props;

    const fieldOptions = Object.keys(config?.fields || {}).map((key) => ({ label: config?.fields?.[key]?.label, value: key }));
    const removeSelf = () => {
      actions?.removeRule(path);
    };

    const setField = field => {
      actions?.setField(path, field);
    };

    const setOperator = operator => {
      actions?.setOperator(path, operator);
    };

    return (
      <Rule
        removeSelf={removeSelf}
        setField={setField}
        setOperator={setOperator}
        fieldOptions={fieldOptions}
        operators={config?.operators}
        properties={properties}
      >
        <Operator
          key="options"
          path={path}
          properties={properties}
          actions={actions}
          config={config}
        />
        <Widget
          key="values"
          path={path}
          properties={properties}
          actions={actions}
          config={config}
        />
      </Rule>
    );
  };
};
