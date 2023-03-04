require('dotenv').config(); // this is important!
module.exports = {
  "development": {
    "username": process.env.DATABASE_USER_NAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE_NAME,
    "host": process.env.DATABASE_HOST,
    "dialect": process.env.DATABASE_DIALECT
  }
};
