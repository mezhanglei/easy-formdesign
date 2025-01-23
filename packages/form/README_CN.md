# `@simpleform/form`

[English](./README.md) | 中文说明

[![](https://img.shields.io/badge/version-2.2.3-green)](https://www.npmjs.com/package/@simpleform/form)

> 表单底层组件，通过回调函数方式实现表单值的显示和更新事件的绑定.

# Matters
 - 在使用之前需要先引入css样式文件，例：`import '@simpleform/form/lib/css/main.css'`;

# Form.Item

表单域组件，用于双向绑定目标控件。

- 绑定：通过回调函数方式，对目标控件进行值和事件的绑定。
- 更新：可通过`form.setFieldValue`等实例方法设置表单值。
- 校验规则：可以提供表单校验规则属性`rules`，进行自定义表单校验规则。

## 安装
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/form --save
# 或者
yarn add @simpleform/form
```