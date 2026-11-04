require('dotenv').config(); //read .env file and set environment variables

const mysql = require('mysql2');

const setting = {
    connectionLimit : 10, //set limit to 10 connection
    host     : process.env.DB_HOST, //get host from environment variable
    port     : process.env.DB_PORT || 4000, //tidb uses port 4000
    user     : process.env.DB_USER, //get user from environment variable
    password : process.env.DB_PASSWORD, //get password from environment variable
    database : process.env.DB_DATABASE, //get database from environment variable
    multipleStatements: true, //allow multiple sql statements
    dateStrings: true, //return date as string instead of Date object
    ssl: {
        minVersion: 'TLSv1.2', //tidb cloud requires a secure connection
        rejectUnauthorized: true
    }
}

const pool = mysql.createPool(setting);

module.exports = pool;