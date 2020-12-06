import * as graphql from 'graphql';

expect.extend({
  toEqualSchema(
    receivedSchema: graphql.GraphQLSchema,
    expectedSchema: graphql.GraphQLSchema
  ) {
    if (![receivedSchema, expectedSchema].every(graphql.isSchema)) {
      throw new Error(
        `Expecting to receive GraphQLSchema objects for toBeSchema matcher`
      );
    }

    const receivedSource = graphql.printSchema(receivedSchema);
    const expectedSource = graphql.printSchema(expectedSchema);

    expect(receivedSource).toEqual(expectedSource);

    return {
      pass: true,
      message: () => '',
    };
  },
});
