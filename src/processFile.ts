import * as ts from 'typescript';
import { getCompilerOptions } from './getCompilerOptions';

export interface DocEntry {
  name?: string;
  fileName?: string;
  documentation?: string;
  type?: string;
  calls?: DocEntry[];
  parameters?: DocEntry[];
  returnType?: string;
  checkerReturnType?: string;
  retTypeObjProps?: {
    // properties of an object in returnType
    name: string;
    type: string;
  }[];
  retTypeIsArray?: boolean;
  retTypeIsNullable?: boolean;
  retTypeIsOptional?: boolean;
  param?: {
    typeName: string;
    objectProps: Record<string, string>;
  };
}

/** returns DocEntry objects to be stored as a type information dump */
export function processFile(fileName: string): Record<string, DocEntry[]> {
  // Build a program using the provide fileName as the root file name
  const program = ts.createProgram([fileName], getCompilerOptions());

  // Get the checker, we will use it to find more about classes
  const checker = program.getTypeChecker();
  const output: Record<string, DocEntry[]> = {};

  const sourceFile = program.getSourceFile(fileName);

  if (!sourceFile) {
    throw new Error(`Missing source file for ${fileName}`);
  }

  if (sourceFile.isDeclarationFile) {
    throw new Error(
      `Provided source file ${fileName} is a declaration and missing implementation`
    );
  }

  const exportedSymbols = checker.getExportsOfModule(
    checker.getSymbolAtLocation(sourceFile)!
  );

  exportedSymbols.forEach((exportedSymbol) => {
    const exportedSymbolName = exportedSymbol.getName();
    const exportedSymbolFlags = exportedSymbol.getFlags();
    if (exportedSymbolFlags === ts.SymbolFlags.Alias) {
      throw new Error(
        `Symbol ${exportedSymbolName} is exported as an alias which is not
supported yet. Please export the value directly.`
      );
    }

    if (exportedSymbolFlags === ts.SymbolFlags.Function) {
      // ignore exported functions
      return;
    }

    if (exportedSymbolFlags !== ts.SymbolFlags.BlockScopedVariable) {
      // ignore anything that is not a block scoped varialbe
      return;
    }

    const { valueDeclaration } = exportedSymbol;

    if (!valueDeclaration) {
      throw new Error(
        `Exported symbol ${exportedSymbolName} is missing value declaration`
      );
    }

    const symbolType = checker.getTypeOfSymbolAtLocation(
      exportedSymbol,
      valueDeclaration
    );

    if (symbolType.getFlags() !== ts.TypeFlags.Object) {
      // not an object type
      return output;
    }

    const objectType = symbolType as ts.ObjectType;
    output[exportedSymbol.name] = objectType
      .getProperties()
      .map((symbol) => serializeFunction(symbol));
  });

  return output;

  function symbolDocumentationToString(symbol: ts.Symbol): string {
    return ts.displayPartsToString(symbol.getDocumentationComment(checker));
  }

  /** Serialize a class symbol information */
  function serializeFunction(symbol: ts.Symbol) {
    const details: DocEntry = {
      name: symbol.getName(),
      documentation: symbolDocumentationToString(symbol),
      type: checker.typeToString(
        checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
      ),
    };

    // Get the construct signatures
    const functionType = checker.getTypeOfSymbolAtLocation(
      symbol,
      symbol.valueDeclaration!
    );
    details.calls = functionType
      .getCallSignatures()
      .map(serializeCallSignature);
    return details;
  }

  function serializeCallSignature(signature: ts.Signature) {
    let retTypeObjProps = undefined;
    let retTypeIsArray = undefined;

    let returnType = signature.getReturnType();

    let retTypeIsNullable = false;
    let retTypeIsOptional = false;

    if (returnType.isUnion()) {
      const otherReturnTypes = returnType.types.filter((type) => {
        switch (type.getFlags()) {
          case ts.TypeFlags.Null:
            retTypeIsNullable = true;
            return false;

          case ts.TypeFlags.Undefined:
            retTypeIsOptional = true;
            return false;

          default:
            return true;
        }
      });

      if (otherReturnTypes.length !== 1) {
        throw new Error(
          `Union return type of ${checker.typeToString(
            returnType
          )} is not supported`
        );
      }

      [returnType] = otherReturnTypes;
    }

    if (returnType.getFlags() === ts.TypeFlags.Object) {
      // NOTE: isClassOrInterface returns true for interface but false for type
      let objectReturnType = returnType as ts.ObjectType;

      if (objectReturnType.objectFlags === ts.ObjectFlags.Reference) {
        const refReturnType = objectReturnType as ts.TypeReference;

        // assuming the reference is an array, subsitute it with the type
        // argument
        retTypeIsArray = true;
        returnType = checker.getTypeArguments(
          refReturnType
        )![0] as ts.ObjectType;
        objectReturnType = returnType as ts.ObjectType;
      }

      retTypeObjProps = objectReturnType.getProperties().map((symbol) => ({
        name: symbol.getName(),
        // type: checker.typeToString(
        //   checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
        // ),
        // hacky way to get type belo
        type: symbol.valueDeclaration.getChildAt(2).getText(),
      }));
    }

    // checker.typeToTypeNode(signature.getReturnType(), undefined, undefined);
    return {
      parameters: signature.parameters.map(serializeParameterSymbol),
      returnType:
        signature.declaration!.type?.getText() ??
        checker.typeToString(returnType),
      checkerReturnType: checker.typeToString(returnType),
      retTypeObjProps,
      retTypeIsArray,
      retTypeIsNullable,
      retTypeIsOptional,
      documentation: ts.displayPartsToString(
        signature.getDocumentationComment(checker)
      ),
    };
  }

  /** Serialize a symbol into a json object */
  function serializeParameterSymbol(symbol: ts.Symbol): DocEntry {
    const parameterDeclaration = symbol.valueDeclaration!;
    if (!ts.isParameter(parameterDeclaration)) {
      throw new Error('Expecting parameter declaration');
    }

    const type = checker.getTypeOfSymbolAtLocation(
      symbol,
      parameterDeclaration
    );

    return {
      name: symbol.getName(),
      documentation: ts.displayPartsToString(
        symbol.getDocumentationComment(checker)
      ),
      type: checker.typeToString(type),
      param: serializeParameterDeclaration(parameterDeclaration),
    };
  }

  function serializeParameterDeclaration(node: ts.ParameterDeclaration) {
    const objectProps: Record<string, string> = {};
    if (ts.isTypeLiteralNode(node.type!)) {
      node.type!.members.forEach((member) => {
        if (!ts.isPropertySignature(member) || !member.type) {
          return;
        }
        objectProps[member.name.getText()] = member.type!.getText();
      });
    }

    return {
      typeName: node.type!.getText(),
      objectProps,
    };
  }
}
