import { readFileSync } from 'fs';
import * as ts from 'typescript';

export function processFile(fileName: string) {
  const sourceFile = ts.createSourceFile(
    fileName,
    readFileSync(fileName).toString(),
    ts.ScriptTarget.ES2015,
    /*setParentNodes */ true
  );

  console.log(sourceFile.statements);
}
