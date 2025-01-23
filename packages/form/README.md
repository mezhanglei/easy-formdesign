# `@simpleform/form`
English | [中文说明](./README_CN.md)

[![](https://img.shields.io/badge/version-2.2.3-green)](https://www.npmjs.com/package/@simpleform/form)

> The underlying form component, Binding of form values to display and update events is accomplished through callback functions.

# Matters
- The css style file needs to be introduced before it can be used, for example: `import '@simpleform/form/lib/css/main.css'`;

# Form.Item

The smallest unit of a component in a form, and nodes as an object can be nested within each other.

- Binding: Bind values and events to the target control by means of callback functions.
- Update: Setting the form value can be done through instance methods such as `form.setFieldValue`.
- Validation Rules: You can provide form validation rules property `rules` to customize form validation rules.

## install
- [Node.js](https://nodejs.org/en/) Version >= 14.0.0
- [react](https://react.docschina.org/) Version >= 16.8.0
```bash
npm install @simpleform/form --save
# or
yarn add @simpleform/form
```
