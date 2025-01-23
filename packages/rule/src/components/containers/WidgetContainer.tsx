import React from 'react';
import { BuilderCommonProps, RuleBuilderRuleItem } from '../../typings';

export default Widget => {
  return (props: Omit<RuleBuilderRuleItem, 'type'> & BuilderCommonProps) => {
    const {
      path,
      config,
      actions,
      properties,
    } = props;

    const field = properties?.field;
    const operator = properties?.operator;
    const value = properties?.value;
    const fieldDefinition = config?.fields?.[field];
    // const operatorDefinition = config?.operators?.[operator];
    // const cardinality = operatorDefinition?.cardinality || 1;
    const widgetName = Array.isArray(fieldDefinition?.widget)
      ? fieldDefinition?.widget[0]
      : fieldDefinition?.widget;
    const widgetOptions = Array.isArray(fieldDefinition?.widget)
      ? fieldDefinition?.widget[1]
      : undefined;
    const {
      factory: widgetFactory,
      ...widgetProps
    } = config?.widgets?.[widgetName || 0] || {};

    const setValue = (value) => {
      actions?.setFieldValue(path, value);
    };

    return (
      <Widget value={properties?.value} setValue={setValue}>
        {
          widgetFactory?.(
            Object.assign({}, widgetProps, {
              ...widgetOptions,
              config,
              field,
              operator,
              value,
              setValue,
            }),
          )
        }
      </Widget>
    );
  };
};

