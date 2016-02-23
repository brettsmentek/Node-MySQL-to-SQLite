Express MySQL to SQLite converter
======================
This project creates an interface for converting raw SQL queries to a MySQL database into a downloadable SQLite file.

## Installation
- Clone
- Make sure MongoDB is installed
- Create a MongoDB database named 'MyMongoDB'
- Install packages and start the Express.js web service (`npm install && npm start`)
- Navigate to `http://127.0.0.1:3000`

## Usage Instructions
Only SELECT statements are supported. There is currently no support for creating empty databases.

Query objects are called 'blobs' and they are created through the 'Create a new query' interface.

Licensing
---------
MIT License