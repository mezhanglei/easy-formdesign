import {
  addItem,
  removeItem,
  setConjunction,
  setField,
  setFieldValue,
  setOperator,
  setOperatorOption
} from "../utils/utils";

// 更新state的action
export const actionCreators = {
  setTree: tree => ({
    tree: tree,
  }),
  addRule: (path, properties) => ({
    path,
    properties
  }),
  removeRule: path => ({
    path,
  }),
  addGroup: (path, properties) => ({
    path,
    properties,
    children: []
  }),
  removeGroup: path => ({
    path,
  }),
  setField: (path, field) => ({
    path,
    field,
  }),
  setOperator: (path, operator) => ({
    path,
    operator,
  }),
  setFieldValue: (path, value) => ({
    path,
    value,
  }),
  setOperatorOption: (path, value) => ({
    path,
    value,
  }),
  setConjunction: (path, conjunction) => ({
    path,
    conjunction,
  }),
};

export default (state, config, actionName, payload) => {
  switch (actionName) {
    case 'setTree':
      return payload.tree;

    case 'addGroup':
      return addItem(state, 'group', payload.path, payload.properties, config);

    case 'removeGroup':
      return removeItem(state, payload.path);

    case 'addRule':
      return addItem(state, 'rule', payload.path, payload.properties, config);

    case 'removeRule':
      return removeItem(state, payload.path);

    case 'setConjunction':
      return setConjunction(state, payload.path, payload.conjunction);

    case 'setField':
      return setField(state, payload.path, payload.field, config);

    case 'setOperator':
      return setOperator(state, payload.path, payload.operator, config);

    case 'setFieldValue':
      return setFieldValue(state, payload.path, payload.value);

    case 'setOperatorOption':
      return setOperatorOption(state, payload.path, payload.value);

    default:
      return state;
  }
};
