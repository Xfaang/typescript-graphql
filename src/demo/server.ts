import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import * as path from 'path';
import { buildSchemaFromCode } from '..';

const port = 4000;

const schema = buildSchemaFromCode({
  modulePath: path.resolve(__dirname, './module'),
});

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
