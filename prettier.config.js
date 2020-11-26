module.exports = {
  overrides: [
    {
      files: ['*.md'],
      options: {
        singleQuote: true,
      },
    },
    {
      files: ['*.js', '*.ts', '*.jsx', '*.tsx'],
      options: {
        parser: 'typescript',
        singleQuote: true,
        endOfLine: 'lf',
      },
    },
  ],
};
