import React from 'react';
import WidgetContainer from './containers/WidgetContainer';

const Widget = (props) => {
  return (
    <div
      className={`rule--widget`}
    >
      {props.children}
    </div>
  );
};

export default WidgetContainer(Widget);
