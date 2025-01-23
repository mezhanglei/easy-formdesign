import React from 'react';

export const SelectWidget = props => {

  const options = props.options?.map((item) => (
    <option key={item?.value} value={item?.value} selected={item?.value === props?.value}>
      {item?.label}
    </option>
  ));

  return (
    <select
      value={props.value}
      onChange={event => props.setValue(event.target.value)}
    >
      {options}
    </select>
  );
};
