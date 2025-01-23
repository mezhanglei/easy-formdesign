# `@simpleform/render`

[English](./README.md) | 中文说明

[![](https://img.shields.io/badge/version-4.1.31-green)](https://www.npmjs.com/package/@simpleform/render)

> 轻量级动态表单引擎，实现动态渲染表单很简单.

## 介绍
- 组件注册(`components`属性): 使用之前需要注册表单控件和非表单组件，如果是表单控件需要控件内部支持`value`和`onChange`两个`props`.
- 组件描述(`widgetList`属性)：我们使用列表来描述界面UI结构, 列表中的每一项都表示一个组件节点.支持节点嵌套
- 组件渲染：`Form`组件处理表单的值, `FormChildren`组件处理表单的渲染, 一个`Form`组件可以支持多个`FormChildren`组件在内部渲染.
- 组件联动：表单属性均可以支持字符串表达式描述联动条件(`widgetList`属性除外).

## 安装
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/render --save
# 或者
yarn add @simpleform/render
```
