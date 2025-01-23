import {
  insertItemByIndex,
  moveItemByPath,
  setItemByPath
} from "../utils/utils";

// 更新state的action
export const actionCreators = {
  setWidgetList: (widgetList) => ({ widgetList }),
  setItemByPath: (data, path) => ({ data, path }),
  insertItemByIndex: (data, index, parent) => ({ data, index, parent }),
  delItemByPath: (path) => ({ path }),
  moveItemByPath: (from, to) => ({ from, to }),
};

// 更新state数据的方法
export default (state, actionName, payload) => {
  switch (actionName) {
    case 'setWidgetList': {
      return payload.widgetList;
    }

    // 设置值
    case 'setItemByPath': {
      const { data, path } = payload || {};
      return setItemByPath(state, data, path);
    }

    // 插入值
    case 'insertItemByIndex': {
      const { data, index, parent } = payload || {};
      return insertItemByIndex(state, data, index, parent);
    }

    // 删除选项
    case 'delItemByPath': {
      return setItemByPath(state, undefined, payload?.path);
    }

    // 移动位置
    case 'moveItemByPath': {
      const { from, to } = payload || {};
      return moveItemByPath(state, from, to);
    }

    default:
      return state;
  }
};
