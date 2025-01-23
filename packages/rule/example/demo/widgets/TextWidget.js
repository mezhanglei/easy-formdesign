import React from 'react';

export const TextWidget = props => (
  <input
    type="text"
    value={props.value}
    onChange={event => props.setValue(event.target.value)}
  />
);
