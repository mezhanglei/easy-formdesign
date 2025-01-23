import Interpreter from '../../src';
import * as Babel from '@babel/standalone';
// 使用解释器执行一段包含多种操作和自定义变量的脚本
const script = `
 let a = 3;
 let b = 5;
 let sum = a + b;
 let randomValue = Math.random();
 let currentDate = new Date();
 const arr = [1,2]
 arr.pop()
 console.log(arr, 333)
 let currentYear = currentDate.getFullYear();

 console.log("Sum:", sum);
 console.log("Random Value:", randomValue);
 console.log("Current Year:", currentYear);

 // 条件语句
 if (sum > 7) {
   console.log("The sum is greater than 7");
 }

 // 循环
 for (let i = 0; i < 3; i++) {
   console.log("Loop iteration", i);
 }

 // 算术和逻辑运算
 let complexExpression = (a * b) / (a + b) && (randomValue > 0.5);
 console.log("Complex Expression Result:", complexExpression);
`;

const script1 = 'customVar1 + "--" + customVar2 + "---"';

var initFunc = function (interpreter, globalObject) {
  // Object
  var object = { log: window.console.log };
  interpreter.setProperty(globalObject, 'console', interpreter.nativeToPseudo(object));
  // Func(同步/异步)
  var fun = function alert(text) {
    return window.alert(text);
  };
  interpreter.setProperty(globalObject, 'alert', interpreter.createNativeFunction(fun));
  // interpreter.setProperty(globalObject, 'alert', interpreter.createAsyncFunction(fun));
  // Other
  interpreter.setProperty(globalObject, 'customVar1', 'customVar1');
  interpreter.setProperty(globalObject, 'customVar2', 'customVar2');
};

// 使用 Babel 转译代码
// const transpiledCode = Babel.transform(script, {
//   presets: ['env'],
// }).code;
// console.log(transpiledCode, '转换');
var myInterpreter = new Interpreter(script, initFunc);
myInterpreter.run();
// var myInterpreter = new Interpreter({ init: initFunc });
// myInterpreter.run(transpiledCode);
console.log(myInterpreter.value, '如果是表达式则返回值');
