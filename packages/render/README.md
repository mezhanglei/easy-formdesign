# `@simpleform/render`

English | [中文说明](./README_CN.md)

[![](https://img.shields.io/badge/version-4.1.31-green)](https://www.npmjs.com/package/@simpleform/render)

> A lightweight dynamic forms engine that makes it easy to dynamically render forms.

## Introduction
- Component registration (`components` property): We need to register form controls and non-form components before using them, in case of form controls we need to support `value` and `onChange` `props` inside the control.
- Component Description (`widgetList` property): We use a list to describe the UI structure, each item in the list represents a component node. Node nesting is supported.
- Component Rendering: `Form` component handles form values, `FormChildren` component handles form rendering, a `Form` component can support multiple `FormChildren` components for internal rendering.
- Component linkage: All form properties can support string expressions to describe linkage conditions (except `widgetList` property).

## install
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/render --save
# 或者
yarn add @simpleform/render
```
