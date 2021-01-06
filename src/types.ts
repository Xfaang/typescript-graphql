import { GraphQLResolveInfo } from 'graphql';

export type float = number;
export type id = string;
export type int = number;

export type ResolverThis<
  TParent,
  TContext,
  TArgs = { [argName: string]: any }
> = {
  parent: TParent;
  args: TArgs;
  context: TContext;
  info: GraphQLResolveInfo;
};
