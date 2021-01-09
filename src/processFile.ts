import * as ts from 'typescript';

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
  param?: {
    typeName: string;
    objectProps: Record<string, string>;
  };
}

/** returns DocEntry objects to be stored as a type information dump */
export function processFile(fileName: string) {
  return generateDocumentation([fileName], {
    target: ts.ScriptTarget.ES5, // ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
  });
}

/** Generate documentation for all classes in a set of .ts files */
function generateDocumentation(
  fileNames: string[],
  options: ts.CompilerOptions
): Record<string, DocEntry[]> {
  // Build a program using the set of root file names in fileNames
  let program = ts.createProgram(fileNames, options);

  // Get the checker, we will use it to find more about classes
  let checker = program.getTypeChecker();
  let output: Record<string, DocEntry[]> = {};

  // Visit every sourceFile in the program
  for (const sourceFile of program.getSourceFiles()) {
    //
    // TODO use program.getSourceFile
    //
    if (!fileNames.includes(sourceFile.fileName)) {
      // skip non-root files
      continue;
    }

    if (sourceFile.isDeclarationFile) {
      // skip declartion files
      continue;
    }

    // console.log('visiting file', sourceFile.fileName);

    const exportedSymbols = checker.getExportsOfModule(
      checker.getSymbolAtLocation(sourceFile)!
    );

    exportedSymbols.forEach((exportedSymbol) => {
      const { valueDeclaration } = exportedSymbol;

      if (!valueDeclaration) {
        throw new Error(`Expecting value declaration in the exported symbol`);
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
  }

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

    const returnType = signature.getReturnType();
    if (returnType.getFlags() === ts.TypeFlags.Object) {
      // NOTE: isClassOrInterface returns true for interface but false for type
      const objectReturnType = returnType as ts.ObjectType;
      // console.log('return type object flags', objectReturnType.objectFlags);
      retTypeObjProps = objectReturnType.getProperties().map((symbol) => ({
        name: symbol.getName(),
        type: checker.typeToString(
          checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
        ),
      }));
    }

    // checker.typeToTypeNode(signature.getReturnType(), undefined, undefined);
    return {
      parameters: signature.parameters.map(serializeParameterSymbol),
      returnType: signature.declaration!.type?.getText(),
      checkerReturnType: checker.typeToString(returnType),
      retTypeObjProps,
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

export function getCompilerOptions() {
  const basePath = process.cwd();
  const configFileName = ts.findConfigFile(
    basePath,
    ts.sys.fileExists,
    'tsconfig.json'
  );
  if (!configFileName) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    basePath
  );

  return options;
}
