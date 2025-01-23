import * as acorn from 'acorn';

export type InterpreterOtionFun = (interpreter, globalObject) => void;

export type AcornSourceLocation = acorn.SourceLocation;
export type AcornNode = acorn.Node;
export type AcornProgram = acorn.Program;
