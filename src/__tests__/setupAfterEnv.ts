import * as graphql from 'graphql';

expect.extend({
  toEqualSchema(
    receivedSchema: graphql.GraphQLSchema,
    expectedSchemaSource: string
  ) {
    if (!graphql.isSchema(receivedSchema)) {
      throw new Error(
        `Expecting to receive a GraphQLSchema in toBeSchema matcher`
      );
    }
    if (typeof expectedSchemaSource !== 'string') {
      throw new Error(
        `Expecting the argument of toBeSchema matcher to be a string`
      );
    }
    const expectedSchema = graphql.buildSchema(expectedSchemaSource);

    const receivedSource = graphql.printSchema(receivedSchema);
    const expectedSource = graphql.printSchema(expectedSchema);

    expect(receivedSource).toEqual(expectedSource);

    return {
      pass: true,
      message: () => '',
    };
  },
});
