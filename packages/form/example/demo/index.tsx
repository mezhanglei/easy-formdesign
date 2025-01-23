import React, { useState } from 'react';
import "./index.less";
// import { Form, useSimpleForm } from '../../lib';
import { Form, useFormValues, useSimpleForm } from '../../src';

export default function Demo() {

  const form = useSimpleForm();

  const onSubmit = async (e) => {
    e.preventDefault();
    const { error, values } = await form.validate();
    console.log(error, values, 'error ang values');
  };

  const validator = (value) => {
    if (value?.length < 2) {
      return Promise.reject(new Error('length is < 2'));
    }
  };
  const formData = useFormValues(form, ['[0].name1', '[1].name2']);
  console.log(formData, '值');
  return (
    <Form initialValues={[{ name1: 1111 }]} form={form} onSubmit={onSubmit}>
      <Form.Item tooltip='11111' label="Name1" name="[0].name1" rules={[{ required: true, message: 'name1 is Empty' }, { validator: validator, message: '自定义校验' }]}>
        {({ bindProps }) => (
          <div>
            <input {...bindProps} />
          </div>
        )}
      </Form.Item>
      <Form.Item label="Name2" name="[1].name2" rules={[{ required: true, message: 'name2 is empty' }]}>
        {({ bindProps }) => <input style={{ height: '100px' }} {...bindProps} />}
      </Form.Item>
      <Form.Item label="">
        <button>Submit</button>
      </Form.Item>
    </Form>
  );
};
