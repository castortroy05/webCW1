const express = require('express');

const path = require('path');

const nedb = require('nedb');

const router = require('./routes/exerciseRoutes');

const mustache = require('mustache-express');

const app = express();

const public = path.join(__dirname, 'public');

//const db = new nedb({filename: 'goals.db', autoload: true});

//const db = new nedb({filename:path.join(__dirname, 'goals.db'), autoload:true});

const dbFilePath = path.join(__dirname, '/goals.db')
console.log(dbFilePath) //THIS LINE
const db = new nedb({filename: dbFilePath , autoload:true});
//console.log(db);

app.use(express.urlencoded({extended: false}));

app.use(express.static(public));

app.engine('mustache', mustache());

app.set('view engine', 'mustache');

app.use('/', router);

app.listen(8080, () => {
    console.log('Server started on port 8080. Ctrl & C to quit');
})