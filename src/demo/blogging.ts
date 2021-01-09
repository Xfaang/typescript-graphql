type Post = {
  id: number;
  title: string;
  text: string;
  authorId: number;
};

type Author = {
  id: number;
  name: string;
};

// root, args, context, info
function getPosts(_: never, { authorId }: { authorId?: number }): Post[] {
  return [];
}

function getAuthors() {
  return [];
}

function fullName(
  root: never,
  { firstName, lastName }: { firstName: string; lastName: string }
): string {
  return `${firstName} ${lastName}`;
}

function submitPost(
  _: never,
  { postInput }: { postInput: { title: string } }
): Post {
  throw new Error('Not implemented!');
}

// first argument in field resolvers is the parent object
// - additional are optional extra arguments like in Query and Mutation resolvers
function author(post: Post): Author {
  throw new Error('Not implemented!');
}

function posts(author: Author): Post[] {
  return [];
}

// things below need to be exported
// buildSchemaFromCode gets the modulePath to this file

export const Query = {
  getPosts,
  getAuthors,
  fullName,
};

export const Mutation = { submitPost };

export const Post = {
  author,
};

export const Author = {
  posts,
};
