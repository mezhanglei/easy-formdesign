---
title: 介绍
nav:
  title: 指南
---

## 简述

表单方案存在三个包，渐进式实现简易到复杂的富表单交互场景功能:
- [@simpleform/form](./form)：构建表单的基础包，提供基本的表单数据双向绑定功能和列表显示功能.
- [@simpleform/render](./render)：动态渲染表单引擎，基于`@simpleform/form`, 可根据`JSON`数据动态渲染表单，实现表单项联动非常简单.
- [@simpleform/rule](./render)：规则构建器和渲染引擎，自由配置符合`json-logic-js`的规则条件.
- [@simpleform/editor](./editor)：表单设计器，基于`@simpleform/render`开发。可快速在`react`项目中嵌入表单设计功能，无痛实现低代码模块.<a href="https://mezhanglei.github.io/simpleform/demo/#/" target="_blank" rel="noopener noreferrer">在线预览</a>

## 特性

- ✅ 运行环境: `react>=16.8`均可以运行.
- ✅ UI无关：开发过程中可自行更换UI库
- ✅ API简易：轻量简易的API设计，开箱即用，容易上手

