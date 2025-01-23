import Interpreter from '@simpleform/interpreter';

const interpreter = new Interpreter();

export function evaluateCode(code, context) {
  interpreter.setCode(code, context);
  interpreter.run();
  return interpreter.value;
};

// 从序列化字符串转化为js
export const parseExpression = (value: unknown, variables?: object) => {
  if (typeof value === 'string') {
    return value.replace(/{{\s*([^}]*(?:\}[^}]*)*)\s*}}/g, (match, expr) => {
      try {
        // 尝试计算表达式的值
        const result = evaluateCode(expr, variables);
        // 返回计算后的字符串表示
        return String(result);
      } catch (e: any) {
        // 如果计算失败，返回原始的匹配文本，并打印错误信息
        console.error(`Error evaluating expression "${expr}: ${e?.message}"`);
        return match;
      }
    });
  } else {
    return value;
  }
};
