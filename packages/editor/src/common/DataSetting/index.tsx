import { Select } from "antd";
import React, { useMemo } from "react";
import './index.less';
import LinkageSetting from "./Linkage";
import RequestSetting from './request';
import OptionList from './list';
import { CommonFormProps } from "../../typings";
import { EditorCodeMirror } from '../CodeMirror';
import {
  getWidgetItem,
  getArrMap,
  setWidgetItem,
} from '../../utils/index';

/**
 * 数据源的配置组件。
 */

export interface DataSettingProps extends CommonFormProps<any> {
  includes?: string[]; // 当前可用模块
}

const prefixCls = 'option-source';
const classes = {
  type: `${prefixCls}-type`,
  component: `${prefixCls}-component`
};

const Options = [
  { label: '选项数据', value: 'list', component: OptionList },
  { label: '静态数据', value: 'json', component: EditorCodeMirror },
  { label: '接口请求', value: 'request', component: RequestSetting },
  { label: '联动设置', value: 'dynamic', component: LinkageSetting },
];
const OptionsMap = getArrMap(Options, 'value');
const OptionsKeys = Options.map((item) => item.value);

const DataSetting: React.FC<DataSettingProps> = (props) => {

  const {
    includes = OptionsKeys,
    value,
    onChange,
    _options
  } = props;

  const editorContext = _options?.editorContext;
  const { selected, editor } = editorContext?.state || {};
  const optionPath = selected?.path?.concat('props', 'optionSelect');
  const buttons = useMemo(() => (Options?.filter((item) => includes?.includes(item?.value))), [includes]);
  const currentValue = getWidgetItem<string>(editor, optionPath) || buttons[0]?.value;

  const selectTypeChange = (key?: string) => {
    if (key) {
      onChange?.();
      setWidgetItem(editor, key, optionPath);
    }
  };

  const handleChange = (value) => {
    if (!currentValue) return;
    onChange?.(value);
  };

  const Com = currentValue && OptionsMap[currentValue]?.component;

  return (
    <>
      <div className={classes.type}>
        <Select value={currentValue} options={Options} style={{ width: "100%" }} onChange={selectTypeChange} />
      </div>
      <div className={classes.component}>
        {Com ? <Com value={value} onChange={handleChange} /> : null}
      </div>
    </>
  );
};

export default DataSetting;
