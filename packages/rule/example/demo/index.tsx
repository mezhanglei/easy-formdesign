import React from 'react';
import { Builder, defaultData } from '../../src';
// import '@simpleform/rule/lib/css/main.css';
import config from './config';

export default function Demo() {
  const state = defaultData(config);
  return (
    <>
      {/* <Preview config={config}>
        {query => (
          <code className="query-preview">
            {query || 'Use the builder below to create a search query.'}
          </code>
        )}
      </Preview> */}
      <div className="query-builder">
        <Builder {...config} tree={state} />
      </div>
    </>
  );
}
