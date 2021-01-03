# typescript-graphql

## Requirements

You need to have `rootDir` compiler options set in TypeScript so that the script can generate
data in proper places.

## Installation

1. `npm install typescript-graphql`

### Make sure you have the peer dependencies installed

2. `npm install graphql` GraphQL
3. `npm install typescript --save-dev` TypeScript (development dependency)

## How it works

1. Module with resolvers

```ts
// query.ts
export function hello(): string {
  return 'world!';
}
```

2. Snapshot generator

JavaScript code doesn't provide any information about types at runtime. That's why we need to
generate these from the source code using `typescript-graphql` CLI tool. Use

`npx tsgc query.ts`

<!-- tsgc [options] [file ...] -->

### idea

Instead of requiring paths here support a config file typescript-graphql.json or tsgconfig.json

This will generate corresponding `*.graphql.json` files for you that are used at runtime.

3. Entry points

```ts
// app.ts
import { buildSchema } from 'typescript-graphql';
import * as express from 'express';
import { graphqlHTTP } from 'express-graphql';

const schema = buildSchema({
  queryModulePath: './query', // ts -> require(...)
  mutationModulePath: './mutation', // ts -> require(...)
  // ...
});

const app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    // rootValue: root,
    graphiql: true,
  })
);
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
```

## Plan of action

1. Introspect existing TypeScript code to get all function exported from a given
   model. These will be used for generating GraphQL Schema.

## TODO

1. Use https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API to translate a module into JSONable definition of declarations
2. Use this information to produce schema at runtime for client Library (client provides options)
