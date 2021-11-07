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

export const Query = {
  hello() {
    return 'world!';
  },
};
```

2. Snapshot generator

JavaScript code doesn't provide any information about types at runtime. That's why we need to
generate these from the source code using `typescript-graphql` CLI tool. Use

`npx tsgc query.ts`

This will generate corresponding `*.graphql.json` files for you that are used at runtime.

3. Entry point

```ts
// app.ts

import { buildSchemaFromCode } from 'typescript-graphql';
import * as express from 'express';
import { graphqlHTTP } from 'express-graphql';

const schema = buildSchemaFromCode({
  modulePath: path.resolve(__dirname, './module'),
});

const app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);
app.listen(4000);

console.log('Running a GraphQL API server at http://localhost:4000/graphql');
```
