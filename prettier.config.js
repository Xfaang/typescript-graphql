module.exports = {
  overrides: [
    {
      files: ['*.md'],
      options: {
        singleQuote: true,
      },
    },
    {
      files: ['*.json'],
      options: {
        parser: 'javascript',
        endOfLine: 'lf',
      },
    },
    {
      files: ['*.js', '*.ts', '*.jsx', '*.tsx', '*.json'],
      options: {
        parser: 'typescript',
        singleQuote: true,
        endOfLine: 'lf',
      },
    },
  ],
};
