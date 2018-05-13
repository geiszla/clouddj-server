const { print, printError } = require('./utils');

const { addSong } = require('./playlist');
const compression = require('compression');
const database = require('./database');
const express = require('express');
const fs = require('fs');
const graphqlHTTP = require('express-graphql');
const graphQLSchema = require('./api');
const https = require('https');
const path = require('path');

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

  https.createServer(options, app).listen(port);
  print(`HTTPS webserver is listening on port ${port}.`);

  addSong('https://youtu.be/dQw4w9WgXcQ');
}
