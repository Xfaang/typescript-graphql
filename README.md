# typescript-graphql

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

`npx typescript-graphql query.ts`

This will generate corresponding `*.graphql.ts` files for you that are used at runtime.

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
