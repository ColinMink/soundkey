require('dotenv').config({ silent: true });

module.exports = {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || "development",
  
    // Environment-dependent settings
    development: {
      db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'sound_key'
      }
    },
    production: {
      db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
      }
    }
  };