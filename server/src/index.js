require('dotenv').config();
const { createApp } = require('./app');
const { initDatabase } = require('./config/db');

const PORT = Number(process.env.PORT || 5000);
const app = createApp();

if (require.main === module && !process.env.VERCEL) {
  initDatabase()
    .then((dbInfo) => {
      app.listen(PORT, () => {
        console.log(
          `[Figure Verse Server] Listening on http://localhost:${PORT} (DB mode: ${dbInfo.mode})`
        );
      });
    })
    .catch((err) => {
      console.error('Failed to start Figure Verse server:', err);
      process.exit(1);
    });
}

module.exports = app;
