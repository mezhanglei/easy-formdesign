import React from 'react';
import GroupContainer from './containers/GroupContainer';
import { RuleBuilderConfig } from '../typings';

export interface GroupProps {
  children?: React.ReactNode;
  config?: RuleBuilderConfig;
  allowRemoval?: boolean; // 是否允许移除
  allowFurtherNesting?: boolean; // 是否允许嵌套
  conjunction?: keyof RuleBuilderConfig['conjunctions'];
  setConjunction: (code) => void;
  addGroup: () => void;
  addRule: () => void;
  removeSelf: () => void;
}

const Group: React.FC<GroupProps> = (props) => {

  const {
    children,
    config,
    allowRemoval,
    allowFurtherNesting,
    conjunction,
    setConjunction,
    addGroup,
    addRule,
    removeSelf,
  } = props;

  return (
    <div className="group">
      <div className="group--header">
        <div className="group--conjunctions">
          {
            Object.entries(config?.conjunctions || {}).map(([key, item]) => {
              const checked = key === conjunction;
              return (
                <div
                  key={key}
                  className={`conjunction conjunction--${key.toUpperCase()}`}
                  data-state={checked ? 'active' : 'inactive'}
                >
                  <label htmlFor={item.label} onClick={() => setConjunction(key)}>{item.label}</label>
                  <input
                    id={item.label}
                    type="radio"
                    value={key}
                    checked={checked}
                    onChange={() => { }}
                  />
                </div>
              );
            })
          }
        </div>
        <div className="group--actions">
          {allowFurtherNesting ? (
            <button
              className="action action--ADD-GROUP"
              onClick={addGroup}
            >
              Add group
            </button>
          ) : null}
          <button
            className="action action--ADD-RULE"
            onClick={addRule}
          >
            Add rule
          </button>
          {allowRemoval ? (
            <button
              className="action action--DELETE"
              onClick={removeSelf}
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className="group--children">{children}</div>
      ) : null}
    </div>
  );
};

export default GroupContainer(Group);
