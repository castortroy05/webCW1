const express = require('express');

const path = require('path');

const router = require('./routes/exerciseRoutes');

const mustache = require('mustache-express');

const app = express();

const public = path.join(__dirname, 'public');

app.use(express.urlencoded({extended: false}));

app.use(express.static(public));

app.engine('mustache', mustache());

app.set('view engine', 'mustache');

app.use('/', router);

app.listen(8080, () => {
    console.log('Server started on port 8080. Ctrl & C to quit');
})