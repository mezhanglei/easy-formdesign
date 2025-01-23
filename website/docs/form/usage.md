---
title: 高级用法
order: 1
---

# 高级用法

## 双向绑定
1. 通过`Form.Item`嵌套回调函数来提供值和事件双向绑定的`bindProps`参数, 此方法为推荐方法.
```javascript
...

<Form.Item label="object" name="name1">
  {({ bindProps }) =>  <input {...bindProps} />}
</Form.Item>
```
2. ~通过`form`实例的`getBindProps`方法来实现值和事件的双向绑定(`>2.x`已废弃)~
```javascript
...

const form = useSimpleForm();

<Form.Item label="object" name="name1">
  {<input {...form.getBindProps('name1')} />}
</Form.Item>
```

## 表单字段
`Form.Item`的`name`为表单的字段，支持数组，对象写法
- `a[0]`表示数组a下面的第一个选项
- `a.b` 表示a对象的b属性
- `a[0].b`表示数组a下面的第一个选项的b属性
- `['a', 0]` 字段等同于`a[0]`, 需要版本支持大于`2.2.0`
```javascript
// 数组写法

<Form.Item label="object" name="list[0]">
  {({ bindProps }) =>  <input {...bindProps} />}
</Form.Item>
```
```javascript
// 对象写法

<Form.Item label="object" name="obj.a">
  {({ bindProps }) =>  <input {...bindProps} />}
</Form.Item>
```