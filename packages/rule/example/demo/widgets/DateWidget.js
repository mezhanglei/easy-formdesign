import React from 'react';

export const DateWidget = props => (
  <input
    type="month"
    value={props.value}
    onChange={event => props.setValue(event.target.value)}
  />
);
