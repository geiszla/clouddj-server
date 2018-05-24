// const { addSong, getQueue, removeSong } = require('./queue');
const { getQueue } = require('./queue');

const compression = require('compression');
const database = require('./database');
const express = require('express');
const fs = require('fs');
const graphqlHTTP = require('express-graphql');
const graphQLSchema = require('./api');
const https = require('https');
const path = require('path');
const { print } = require('./utils');

global.Promise = require('bluebird');

main();

async function main() {
  // MongoDB Database
  const mongoAddress = 'localhost:27017';
  print('Connecting to the database....');
  if (!await database.connect(mongoAddress)) process.exit(1);
  print(`Connected to MongoDB server at mongodb://${mongoAddress}`);

  // HTTPS Webserver
  const app = express();
  app.use(compression());

  // Additional express middlewares
  // app.use(bodyParser.json());
  // app.use(cookieParser());
  // app.use(session({
  //   secret: '98414c22d7e2cf27b3317ca7e19df38e9eb221bd',
  //   resave: true,
  //   saveUninitialized: false
  // }));

  // GraphQL express middleware
  app.use(
    '/api',
    (req, res, next) => {
      print(`GraphQL API request: ${req.body.operationName}`);
      next();
    },
    graphqlHTTP(req => ({
      schema: graphQLSchema,
      rootValue: { session: req.session },
      graphiql: true
    })),
  );

  const options = {
    key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.crt')),
    passphrase: 'iManT'
  };

  // Start server
  const port = 443;
  https.createServer(options, app).listen(port);
  print(`HTTPS webserver is listening at https://localhost:${port}/`);
  console.log();

  // await addSong('https://youtu.be/dQw4w9WgXcQ');
  // await removeSong('5af8c957d400c55dfc612101');
  const queue = await getQueue();
  console.log(queue);
}
