import React from 'react';
import OperatorContainer from './containers/OperatorContainer';

const Operator = (props) => {
  return (
    <div
      className={`rule--operator`}
    >
      {props.children}
    </div>
  );
};

export default OperatorContainer(Operator);
