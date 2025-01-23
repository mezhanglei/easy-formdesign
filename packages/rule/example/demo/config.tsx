import React from 'react';
import { RuleBuilderConfig } from '../../src/typings';
import { DateWidget, SelectWidget, TextWidget } from './widgets';

export default {
  conjunctions: {
    and: {
      label: 'And'
    },
    or: {
      label: 'Or'
    },
  },
  fields: {
    name: {
      label: 'Name',
      widget: 'text',
      operators: [
        '===',
        'contains',
        'startsWith',
        'endsWith',
        'includes',
      ],
    },
    date: {
      label: 'Date',
      widget: 'date',
      operators: ['===', 'contains', 'startsWith', 'endsWith'],
    },
    color: {
      label: 'Color',
      widget: [
        'select',
        {
          options: [{
            label: 'Yellow',
            value: 'yellow'
          }, {
            label: 'Green',
            value: 'green',
          }, {
            label: 'Orange',
            value: 'orange'
          }],
        },
      ],
      operators: ['==='],
    },
  },
  operators: {
    "===": {
      label: 'Equals'
    },
    "!==": {
      label: 'Not Equals'
    },
    ">": {
      label: 'greater than'
    },
    ">=": {
      label: 'greater than or equal'
    },
    "<": {
      label: 'less than'
    },
    "<=": {
      label: 'less than or equal'
    },
    contains: {
      label: 'Contains'
    },
    startsWith: {
      label: 'Starts with'
    },
    endsWith: {
      label: 'Ends with',
    },
    includes: {
      label: 'includes',
    },
  },
  widgets: {
    text: {
      factory: props => <TextWidget {...props} />,
    },
    select: {
      factory: props => <SelectWidget {...props} />,
    },
    date: {
      factory: props => <DateWidget {...props} />,
    },
  },
  settings: {
    maxNesting: 10,
  },
} as RuleBuilderConfig;
