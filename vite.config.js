export default {
  server: {
    proxy: { '/api': 'http://localhost:4000' },   // npm run dev: send /api/* to the shop API (npm run api)
  },
};
