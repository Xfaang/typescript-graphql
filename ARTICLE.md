# Easiest way to create GraphQL API for a TypeScript module

GraphQL is a popular API query language that offers more structured, performant
and secure ways of accessing data from another service than REST. It requires
the server to define a schema that lists all types of data available for clients
of the API.

When building a GraphQL server to allow access to a TypeScript module, one needs
to make sure that the types in GraphQL Schema reflect accurately what data is
expected. Let's take a look at the following example of a simple bookstore module.

## Bookstore module

```ts
// bookstore.ts (part 1/3)

type int = number;

type Book = {
  id: int;
  title: string;
  authorId: int;
};

type Author = {
  id: int;
  name: string;
};
```

We use a custom type alias `int` here to indicate that given properties are
integers rather than use the generic JavaScript `number`.

Here is a simple database for our bookstore:

```ts
// bookstore.ts (part 2/3)

const booksDb: Book[] = [
  {
    id: 0,
    title: 'Romeo and Juliet',
    authorId: 0,
  },
  {
    id: 1,
    title: 'The Mysterious Affair at Styles',
    authorId: 1,
  },
  {
    id: 2,
    title: 'Endless Night',
    authorId: 1,
  },
];

const authorsDb: Author[] = [
  {
    id: 0,
    name: 'William Shakespeare',
  },
  {
    id: 1,
    name: 'Agatha Christie',
  },
];
```

The functions below allow reading data from the bookstore:

```ts
// bookstore.ts (part 3/3)

/** get all books */
export function getBooks() {
  return booksDb;
}

/** get all authors */
export function getAuthors() {
  return authorsDb;
}

/** get the author of the given book */
export function author(book: Book) {
  return authorsDb.find((author) => author.id === book.authorId);
}
```

In order to make these functions available in GraphQL, we need to define a
GraphQL Schema. Let's compare a few ways of doing this.

## The native way

```ts
// schema.ts (the native way)

import {
  graphql,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import { author, books, getAuthors, getBooks } from './bookstore';

const bookType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Book',
  fields: () => ({
    id: {
      type: GraphQLInt,
    },
    title: {
      type: GraphQLString,
    },
    authorId: {
      type: GraphQLInt,
    },
    author: {
      type: authorType,
      resolve: author,
    },
  }),
});

const authorType = new GraphQLObjectType({
  name: 'Author',
  fields: () => ({
    id: {
      type: GraphQLInt,
    },
    name: {
      type: GraphQLString,
    },
  }),
});

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      getBooks: {
        type: new GraphQLList(bookType),
        resolve: getBooks,
      },
      getAuthors: {
        type: new GraphQLList(authorType),
        resolve: getAuthors,
      },
    },
  }),
});
```

With `schema` object defined above we can use GraphiQL that comes with
`express-graphql` to preview our server:

```ts
// server.ts

import express from 'express';
import { graphqlHTTP } from 'express-graphql';

import { schema } from './schema';

const port = 4000;

express()
  .use(
    '/graphql',
    graphqlHTTP({
      schema,
      graphiql: true,
    })
  )
  .listen(port);
```

Here's the result:

[Image - screenshot from GraphiQL]

Unfortunately, to define GraphQL schema to reflect the bookstore module _we had
to repeat all the type and resolver information_ in a way that GraphQL could
undestand. This form of code repretition is undesirable because it is tedious
and error prone. For example TypeScript won't be able to check if the GraphQL
types you provided are correct.

# The easy way

At xFAANG we like finding solutions to problems like this to empower developers
to spend more time writing meaningful code. If your module is already written in
TypeScript it's possible to look into its definitions and derive from them what
GraphQL types need to be used. We have created `typescript-graphql` package that
allows just that!

When using the package you first need to export `Query` object that includes any
top level resolvers. You may also export additonal object that include field
resolvers for your custom types. Any addtional functions exported from the
module are ignorred.

```ts
// bookstore.ts (additional exports)

export const Query = {
  getAuthors,
  getBooks,
};

export const Book = {
  author,
};
```

Secondly, you need to provide the absolute path to the module you wish to expose in GraphQL:

```ts
// schema.ts (the easy way)

import { buildSchemaFromCode } from 'typescript-graphql';

export const schema = buildSchemaFromCode({
  modulePath: path.resolve(__dirname, './bookstore'),
});
```

Also, if your build phase include compilation of TypeScript into JavaScript with
`tsc`, you also need to run `npx tsgc` on any modules that you wish to expose
with GraphQL.

`npx tsgc bookstore.ts`

This will create `bookstore.graphql.json` file in your `outDir` that include
type information necessary to generate schema at runtime. That's it! You just
saved yourself writing and maintaining a lot of GraphQL code.

At the time of writing this article, `typescript-graphql` is published in a
proof-of-concept alpha version as an open source project. We're looking forward
to hearing feedback from you!
