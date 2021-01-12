import { graphql } from 'graphql';
import { buildSchemaFromCode } from '..';
import { int } from '../types';
import { gql } from './utils';

test('Bookstore module', async () => {
  const schema = buildSchemaFromCode({
    modulePath: __filename,
  });

  expect(schema).toEqualSchema(gql`
    type Query {
      """
      get all authors
      """
      getAuthors: [Author]

      """
      get all books
      """
      getBooks: [Book]
    }

    type Author {
      id: Int
      name: String

      """
      get all books of the given author
      """
      books: Book
    }

    type Book {
      id: Int
      title: String
      authorId: Int

      """
      get the author of the given book
      """
      author: Author
    }
  `);

  expect(
    await graphql({
      schema,
      source: gql`
        query {
          getBooks {
            title
            author {
              name
            }
          }
        }
      `,
    })
  ).toEqual({
    data: {
      getBooks: [
        { title: 'Romeo and Juliet', author: { name: 'William Shakespeare' } },
        {
          title: 'The Mysterious Affair at Styles',
          author: { name: 'Agatha Christie' },
        },
        { title: 'Endless Night', author: { name: 'Agatha Christie' } },
      ],
    },
  });
});

type Book = {
  id: int;
  title: string;
  authorId: int;
};

type Author = {
  id: int;
  name: string;
};

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

/** get all books of the given author */
export function books(author: Author) {
  return booksDb.find((book) => book.authorId === author.id);
}

export const Query = {
  getAuthors,
  getBooks,
};

export const Author = {
  books,
};

const Book = {
  author,
};

// export Book as an alias
export { Book };
