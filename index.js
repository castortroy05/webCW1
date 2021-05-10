const express = require('express');

const path = require('path');

const weekNumber = require('current-week-number');

const nedb = require('nedb');

const router = require('./routes/exerciseRoutes');

const mustache = require('mustache-express');

const helmet = require("helmet");

const app = express();

app.use(helmet());

const { auth } = require('express-openid-connect');

//config for auth0
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  //baseURL: 'http://localhost:8080',
  baseURL: 'https://goalgettergcu.herokuapp.com',
  clientID: 'awkkwd43YvCe0dpdwDA48qGRoN62V00X',
  issuerBaseURL: 'https://castortroy.eu.auth0.com'

};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));



const public = path.join(__dirname, 'public');

app.use(express.urlencoded({extended: true}));

app.use(express.static(public));

app.engine('mustache', mustache());

app.set('view engine', 'mustache');

app.use('/', router);

app.listen(process.env.PORT ||8080, () => {
    console.log('Server started on port 8080 or ' , process.env.PORT , ' Ctrl & C to quit');
});