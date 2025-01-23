import React from 'react';
import { BuilderCommonProps, RuleBuilderRuleItem } from '../../typings';

export default Operator => {
  return (props: Omit<RuleBuilderRuleItem, 'type'> & BuilderCommonProps) => {
    const {
      path,
      config,
      actions,
      properties,
    } = props;

    const operatorDefinitions = config?.operators?.[properties?.operator];
    const noneOptions = typeof operatorDefinitions?.options === 'undefined';

    const setOperatorOption = (value) => {
      actions?.setOperatorOption(path, value);
    };

    const {
      factory: optionsFactory,
      ...optionsProps
    } = operatorDefinitions?.options || {};

    return noneOptions ? null : (
      <Operator>
        {optionsFactory?.(
          Object.assign({}, optionsProps, {
            config,
            field: properties?.field,
            operator: properties.operator,
            options: properties?.operatorOptions,
            setOption: (value) => setOperatorOption(value),
          }),
        )}
      </Operator>
    );
  };
};
