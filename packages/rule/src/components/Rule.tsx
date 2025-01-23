import React from 'react';
import RuleContainer from './containers/RuleContainer';
import { RuleBuilderConfig, RuleBuilderRuleItem } from '../typings';
export interface RuleProps {
  removeSelf?: () => void;
  setField?: (field) => void;
  setOperator?: (operator) => void;
  fieldOptions?: Array<{ label?: string; value?: string }>;
  operators?: RuleBuilderConfig['operators']
  properties?: RuleBuilderRuleItem['properties']
  children?: React.ReactNode
}

const Rule: React.FC<RuleProps> = (props) => {

  const {
    setField,
    setOperator,
    removeSelf,
    fieldOptions,
    properties: selected,
    operators
  } = props;

  const handleFieldSelect = (e) => {
    setField?.(e?.target.value);
  };

  const handleOperatorSelect = (e) => {
    setOperator?.(e?.target?.value);
  };

  return (
    <div className="rule">
      <div className="rule--header">
        <div className="rule--actions">
          <button
            className="action action--DELETE"
            onClick={removeSelf}
          >
            Delete
          </button>
        </div>
      </div>
      <div className="rule--body">
        {fieldOptions ? (
          <div key="field" className="rule--field">
            <label>Field</label>
            <select
              onChange={handleFieldSelect}
            >
              {
                fieldOptions?.map((item) => (
                  <option key={item?.value} value={item?.value} selected={item?.value === selected?.field}>
                    {item?.label}
                  </option>
                ))
              }
            </select>
          </div>
        ) : null}
        {operators ? (
          <div key="operator" className="rule--operator">
            <label>Operator</label>
            <select
              onChange={handleOperatorSelect}
            >
              {
                Object.keys(operators)?.map((key) => (
                  <option key={key} value={key} selected={key === selected?.operator}>
                    {operators[key]?.label}
                  </option>
                ))
              }
            </select>
          </div>
        ) : null}
        {props.children}
      </div>
    </div>
  );
};

export default RuleContainer(Rule);
