const { print, printError } = require('./utils');

const { addSong } = require('./playlist');
const compression = require('compression');
const database = require('./database');
const express = require('express');
const fetch = require('node-fetch');
const graphQLSchema = require('./api');
const fs = require('fs');
const graphqlHTTP = require('express-graphql');
const https = require('https');
const path = require('path');

global.fetch = fetch;
global.Promise = require('bluebird');

// MongoDB Database
database.connect().then((mongoServer) => {
  print(`Connected to MongoDB server at ${mongoServer}.`);
  startWebserver(443);
}).catch((err) => {
  printError(`Error: ${err.message}`);
  process.exit(1);
});

function startWebserver(port) {
  // HTTPS Webserver
  const app = express();
  app.use(compression());
  // app.use(bodyParser.json());
  // app.use(cookieParser());
  // app.use(session({
  //   secret: '98414c22d7e2cf27b3317ca7e19df38e9eb221bd',
  //   resave: true,
  //   saveUninitialized: false
  // }));

  // GraphQL
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
    key: fs.readFileSync(path.join(__dirname, '/ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '/ssl/cert.crt')),
    passphrase: 'iManT'
  };
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  https.createServer(options, app).listen(port);
  print(`HTTPS webserver is listening on port ${port}.`);

  addSong('https://youtu.be/dQw4w9WgXcQ');
}
