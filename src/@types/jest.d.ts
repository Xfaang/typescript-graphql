import * as graphql from 'graphql';

declare global {
  namespace jest {
    interface Matchers<R> {
      toEqualSchema(expectedSchema: string): R;
    }
  }
}
