const express = require('express');

const path = require('path');

const nedb = require('nedb');

const router = require('./routes/exerciseRoutes');

const mustache = require('mustache-express');

const app = express();

const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:8080',
  clientID: 'awkkwd43YvCe0dpdwDA48qGRoN62V00X',
  issuerBaseURL: 'https://castortroy.eu.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));



const public = path.join(__dirname, 'public');

app.use(express.urlencoded({extended: false}));

app.use(express.static(public));

app.engine('mustache', mustache());

app.set('view engine', 'mustache');

app.use('/', router);

app.listen(8080, () => {
    console.log('Server started on port 8080. Ctrl & C to quit');
})