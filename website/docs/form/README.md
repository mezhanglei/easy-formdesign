---
title: Form
order: 0
nav:
  title: Form
  order: 0
---

# @simpleform/form
[![](https://img.shields.io/badge/version-2.2.2-green)](https://www.npmjs.com/package/@simpleform/form)

> 表单底层组件，通过回调函数方式实现表单值的显示和更新事件的绑定.

## 安装

### npm安装
推荐使用 npm 的方式安装。
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/form --save
# 或者
yarn add @simpleform/form
```

### 引入样式
在使用之前需要先引入css样式文件
```javascript
import '@simpleform/form/lib/css/main.css'
```
### 基本使用
<code src="../../src/form/base.tsx"></code>

## API

### Hooks

- `useSimpleForm`: `(defaultValues) => SimpleForm` 等于`new SimpleForm()`
- `useFormError`: `(form: SimpleForm, path?: FormPathType) => [string, (val: string) => void]` 使用 hooks 获取指定的报错信息。
- `useFormValues`: `(form: SimpleForm, path?: FormPathType | Array<FormPathType>) => unknown`使用 hooks 获取表单值，支持单个或多个目标的表单值提取
:::warning
`>=2.2.2`版本`useFormValues`方法可以在完整表单值中提取对应路径的值组合成新的表单值，旧版本只会返回路径和值的映射。
:::

### Form

| `props`属性字段                | 说明                                   | 类型                                       | 默认值   |
| ------------------- | ------------- | -------- | -------- |
| `className`     | 类名     | `string`                                 | -        |
| `form`     | 表单实例，由`useSimpleForm()`创建| `Form`     | 必选        |
| `tagName`     | 默认`form`标签, 表单嵌套情况下需要更换标签      | `string`                                 | 默认`form`标签        |
| `initialValues`     | 表单的初始值     | -                                 | -        |
|  `onSubmit`    |  标签提交事件    |        `(e) => void`                          | -        |
|   `onReset`   |  重置默认值事件, 只有`htmlType=reset`的`button`标签才可以触发    |    `() => void`                              | -        |
|  `onFieldsChange`    |  表单控件`onChange` 变化时的事件函数，只会被控件主动`onChange`触发，不会被`form.setFieldValue`和`form.setFieldsValue`触发, 避免循环调用    |      `(item: {name: FormPathType, value: unknown}, values: unknown)=> void`       | -        |
|  `onValuesChange`    |   监听表单值的变化, 只要表单值有变化无论是初始值赋值场景还是其他场景下值的变更都会被监听到   |    `(item: {name: FormPathType, value: unknown}, values: unknown)=> void` | -        |
|  `watch`    |   监听表单中某个控件的`name`字段对应的表单值   |   -  | -        |

### component
`Form.Item`的`component`为表单域的显示组件，`props`如下：

| `props`字段     | 说明           | 类型                          | 默认值 |
| -------------- | -------- | ----------------------------- | ------ |
| `label` | 表单域的`label` | `string` | - |
| `labelStyle`    |  `label`的样式     |  `CSSProperties`   | -      |
| `labelWidth`    |    `label`的宽度    |  `CSSProperties['width']`   | -      |
| `labelAlign`    |   `label`标签的`textAlign`属性     |  `CSSProperties['textAlign']`   | -      |
| `inline`  |   是否设置行内布局     |   `boolean`  | -      |
| `layout`   |  布局类型, 水平对齐或者垂直对齐   |  `'horizontal'/'vertical'`   | `horizontal`      |
| `colon`    |   `label`是否添加冒号    |  `boolean`   | -      |
| `required` |  是否显示必填标记，不包含表单校验，仅用于显示   |  `number`   | -      |
| `gutter` |  `label`标签和表单组件间的距离   |  `number`   | -      |
| `error` |  展示的报错信息   |  `string`   | -      |
| `suffix` |  后缀节点   |  `React.ReactNode`   | -      |
| `footer` |  底部节点   |  `React.ReactNode`   | -      |
| `tooltip` |  展示`tooltip`提示   |  `string`   | -      |
| `compact` |  是否紧凑，会去掉表单域的`margin`   |  `boolean`   | -      |

### Form.Item
继承上面`Form.Item`的`component`显示组件的`props`，其他的`props`如下
| `props`属性字段      | 说明            | 类型    | 默认值 |
| -------------- | --------------- | ------- | ------ |
|`className`     | 类名     | `string` |  -  |
|`component`   | 控件外层的显示组件，可更换其他自定义样式的组件 |   | [跳转](#component)     |
|`name`   |  表单控件的字段名  | `type FormPathType = string/number/Array<string/number>`  | -      |
|`validateTrigger`| 设置表单域校验的触发事件, 默认`onChange` | `boolean`或`onChange/onBlur`等  | `onChange`      |
|`valueProp` | 给控件绑定值的`props`是哪个字符 | `string`  | `value` |
|`valueGetter`| 格式化输出表单值的函数，一般配合`valueSetter`使用 | `<T>(value: T)=> T`  | -      |
|`valueSetter`| 格式化输入表单值的函数，配合`valueGetter`使用 | `<T>(value: T)=> T`  | -      |
|`rules` | 表单域的校验规则 | `FormRule[]`  |    [跳转](#rules)    |
|`initialValue`| 表单域的初始值，只能表单初始化时渲染时赋值 |   | -      |
|  `onFieldsChange`    |  表单控件`onChange` 变化时的事件函数，只会被控件主动`onChange`触发，不会被`form.setFieldValue`和`form.setFieldsValue`触发, 避免循环调用    |      `(item: {name: FormPathType, value: unknown}, values: unknown)=> void`       | -        |
|  `onValuesChange`    |   监听表单值的变化, 只要表单值有变化无论初始值还是其他变更都会被监听到   |    `(item: {name: FormPathType, value: unknown}, values: unknown)=> void` | -        |
|`errorClassName` | 控件当有错误信息时，添加一个自定义类名 | `string`  | -      |

### rules

| `FormRule`参数字段     | 说明           | 类型                          | 默认值 |
| -------------- | -------- | ----------------------------- | ------ |
| `validateTrigger` | 校验表单规则的触发事件 | `boolean`或`onChange/onBlur`等 | `onChange`|
| `message`    |   校验规则报错时，默认的报错信息     |  `string`   | -      |
| `required`    |    是否必填    |  `boolean`   | -      |
| `validator`    |   自定义校验函数     |  `(value: unknown) => void/boolean`   | -      |
| `pattern`  |   正则表达式校验，不符合则报错     |   `RegExp/string`  | -      |
|  `whitespace`   |  空格校验   |  `boolean`   | -      |
| `max`    |   表单值为`string`类型时为字符串最大长度；`number` 类型时为数字最大值；`array` 类型时为数组最大长度     |  `number`   | -      |
|  `min`   |   表单值为`string`类型时为字符串最小长度；`number` 类型时为数字最小值；`array` 类型时为数组最小长度     |  `number`   | -      |


### Method

| form实例方法     | 说明           | 类型                          |
| -------------- | -------------- | ----------------------------- |
| `getFieldValue` | 返回指定`path`的表单域的值，不指定`path`返回整个表单的值。 | `(path?: FormPathType) => unknown ` | |
| `setFieldValue`    |   更新指定`name`字段的值    |  `(path: FormPathType, value: unknown) => void`   |
| `setFieldsValue`    |  设置整个表单的值(覆盖)    |  `(values: unknown) => void`   |
| `reset`    |   重置表单, 可以传值重置为目标值     |  `(values?: unknown) => void`   |
| `validate`  |   校验表单，并返回错误信息和表单值。支持单个或多个目标校验    |   `(path?: FormPathType/Array<FormPathType>) => {error: true/string; values: unknown}`  |
|  `getFieldError`   |  返回目标的错误信息或所有的错误信息   |  `(path?: FormPathType) => string | boolean`   |
