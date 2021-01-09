# Effortless GraphQL for your TypeScript modules

<!--
NoExpose your TypeScript modules via GraphQL
The easiest way to create a GraphQL API for your TypeScript modules
Quickly create
Create a GraphQL api

Effortless GraphQL for your TypeScript modules
Instant GraphQL for your TypeScript modules

IDEA

The easiest way to create GraphQL API for TypeScript modules

Create GraphQL API for TypeScript modules, the easiest way

How

- intro
- define functions to be exported
- showcase the basic ways
- show our way
- show other ways
- consclusion

include

simple blogging module
-->

```ts

```

1. GraphQL is a popular API query language that requires defining schema.
2. TypeScript already has a type system that can be leveraged to get the required information
3. Project - todo, author posts, reddit links

## Basic example

Let's take a look at an example from [a reference implementation of GraphQL for JavaScript](https://github.com/graphql/graphql-js).

There is a simple function that we want to make available over an API:

```js
function hello() {
  return 'world';
}
```

In order to do it we need to create a GraphQL schema:

```js
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

var schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: hello,
      },
    },
  }),
});
```

This schema already provides a custom resolver which is useful in certain cases.

This is a simple schema with a single `hello` field. You can use this schema as follows

```js
// outputs "world"
console.log(await graphql({ schema, source: '{ hello }' }));
```

Setting up GraphQL server requires us to be specific about types of data exposed with it.

It's worth noting that in case of simple schemas that are based on the default resolvers, there is a shorter way to provide the schema - we can build it from source:

```js
var schema = buildSchema(`
  type Query {
    hello: String
  }
`);
```

In such case, we also need to provide the root value which will include the fields listed in `Query` type:

```js
// outputs "world"
console.log(
  await graphql({
    schema,
    source: '{ hello }',
    rootValue: { hello },
  })
);
```

In both cases, additional code needed to be added in order to expose the GraphQL API.

### TypeScript

Once we migrate our code from typeless JavaScript to a TypeScript module like so:

```ts
// hello.ts

export function hello(): string {
  return 'world';
}
```

We already have a type information attached to our source code that GraphQL
could use to build its schema. This is exactly what a new library from xFAANG
has to offer
[typescript-graphql](https://www.npmjs.com/package/typescript-graphql).

In order to do it you just need to provide the paths for modules that you wish to expose in the schema.

```ts
import { resolve } from 'path';
import { getSchemaForModules } from 'typescript-graphql';

const schema = getSchemaForModules({
  queryPaths: [resolve(__dirname, './hello')],
});
```

If your workflow includes running `tsc` to compile TypeScript into JavaScript,
you'll also need to use `tsgc` command which comes with `typescript-graphql` to
create a `.graphql.json` files for all modules that you wish to expose.

`npx tsgc hello.ts`

It will create a `hello.graphql.json` file in your TypeScript `outDir` that will
provide necessary information to `getSchemaForModules` at runtime.

## A more complex example - blogging system
