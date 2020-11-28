import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { generateGraphQLSchema } from './generateGraphQLSchema';

const port = 4000;

// load saved file schema

// - save serialized type information to a file
// - retrieve this information and use to generate GraphQL schema
// - decide whether given imports are query or mutation

const schema = generateGraphQLSchema(require('../module.ts.graphql.json'));

// const schema = buildSchema({
//   queryModulePath: './query', // ts -> require(...)
//   mutationModulePath: './mutation', // ts -> require(...)
//   // ...
// });
// use queryModulePaths, mutationModulePaths
// - field resolvers

const app = express();

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.listen(port);

console.log(`GraphiQL listening at http://localhost:${port}/graphql`);
