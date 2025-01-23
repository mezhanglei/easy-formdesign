import React, { useState } from 'react';
import "./index.less";
import FormRender, { useSimpleForm } from '../../src/index';
import '../../lib/css/main.css';
import { Button, Checkbox, Input, Radio, Select } from 'antd';

// 原子组件
export const defaultComponents = {
  "Input": Input,
  "Radio.Group": Radio.Group,
  "Radio": Radio,
  "Select": Select, // 选择控件
  "Select.Option": Select.Option, // 选择的选项
  "Checkbox": Checkbox
};

export default function Demo(props) {

  const watch = {
    'name2': (newValue, oldValue) => {
      console.log(newValue, oldValue);
    },
    'list[0]': (newValue, oldValue) => {
      console.log(newValue, oldValue);
    },
    'name4': (newValue, oldValue) => {
      console.log(newValue, oldValue);
    }
  };

  const widgetList = [
    {
      label: "readonly",
      name: 'name1',
      readOnly: true,
      readOnlyRender: () => "readonly component",
      initialValue: 1111,
      hidden: '{{formvalues && formvalues.name6 == true}}',
      type: 'Input',
      props: {}
    },
    {
      label: "readonly",
      readOnly: true,
      name: 'name11',
      outside: { type: 'col', props: { span: 12 } },
      readOnlyRender: () => "测试结果测试结果测试结果测试结果测试结果测试结果测试结果测试结果测试结果测试结果测试结果测试结果",
      initialValue: 1111,
      hidden: '{{formvalues.name6 == true}}',
      type: 'Input',
      props: {}
    },
    {
      label: "readonly",
      readOnly: true,
      name: 'name22',
      outside: { type: 'col', props: { span: 12 } },
      readOnlyRender: () => "测试结果测试结果测试结果测试结果测试结果测试结果测试结果测试结果测试结果测试结果测试结果测试结果",
      initialValue: 1111,
      hidden: '{{formvalues.name6 == true}}',
      type: 'Input',
      props: {}
    },
    {
      label: "input",
      name: 'name3',
      rules: [{ required: true, message: 'input empty' }],
      initialValue: 1,
      hidden: '{{formvalues && formvalues.name6 == true}}',
      type: 'Input',
      props: {}
    },
    {
      label: 'list[0]',
      name: 'list[0]',
      rules: [{ required: true, message: 'list[0] empty' }],
      initialValue: { label: 'option1', value: '1', key: '1' },
      type: 'Select',
      props: {
        labelInValue: true,
        style: { width: '100%' },
        options: [
          { label: 'option1', value: 1 },
          { label: 'option2', value: 2 },
        ],
      },
    },
    {
      label: 'list[1]',
      name: 'list[1]',
      rules: [{ required: true, message: 'list[1] empty' }],
      type: 'Select',
      props: {
        labelInValue: true,
        style: { width: '100%' },
        options: [
          { label: 'option1', value: 1 },
          { label: 'option2', value: 2 },
        ],
      },
    },
    {
      label: 'first',
      name: 'name4.first',
      rules: [{ required: true, message: 'first empty' }],
      type: 'Select',
      props: {
        style: { width: '100%' }
      },
      children: [{ type: 'Select.Option', props: { key: 1, value: '1' }, children: 'option1' }]
    },
    {
      label: 'second',
      name: 'name4.second',
      rules: [{ required: true, message: 'second empty' }],
      type: 'Select',
      props: {
        style: { width: '100%' }
      },
      children: [{ type: 'Select.Option', props: { key: 1, value: '1' }, children: 'option1' }]
    },
    {
      label: 'name5',
      name: 'name5',
      initialValue: { span: 12 },
      valueSetter: "{{(value)=> (value && value['span'])}}",
      valueGetter: "{{(value) => ({span: value})}}",
      type: 'Select',
      props: {
        style: { width: '100%' }
      },
      children: [
        { type: 'Select.Option', props: { key: 1, value: 12 }, children: 'option1' },
        { type: 'Select.Option', props: { key: 2, value: 6 }, children: 'option2' },
        { type: 'Select.Option', props: { key: 3, value: 4 }, children: 'option3' }
      ]
    },
    {
      label: 'checkbox',
      name: 'name6',
      valueProp: 'checked',
      initialValue: true,
      rules: [{ required: true, message: 'checkbox empty' }],
      type: 'Checkbox',
      props: {
        style: { width: '100%' }
      },
      children: 'option'
    },
  ];

  const form = useSimpleForm();
  // const formrender = useSimpleFormRender()

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    const result = await form.validate();
    console.log(result, 'result');
  };

  return (
    <div>
      <FormRender
        form={form}
        wrapper={{ type: 'row' }}
        // formrender={formrender}
        widgetList={widgetList}
        components={defaultComponents}
        watch={watch} />
      <div style={{ marginLeft: '120px' }}>
        <Button onClick={onSubmit}>submit</Button>
      </div>
    </div>
  );
}
