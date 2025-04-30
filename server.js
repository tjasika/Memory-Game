const express = require('express');
const app = express();
require('dotenv').config();

const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt');

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.set("view engine", "ejs");          
app.use(express.static('public'));     

app.set("views", path.join(__dirname, "views"));    
app.use(express.json());                            
app.use(express.urlencoded({ extended: true }));

/* Get handlers */
app.get('/', (req, res)=> {
    res.render('index.ejs', {err: "", feedback: ""});
});

app.get('/login', (req, res)=> {
    res.render('login.ejs', {err: "", feedback: ""});
});

app.get('/signup', (req, res)=> {
    res.render('signup.ejs', {err: "", feedback: ""});
});

app.get('/game', (req, res)=> {
    res.render('game.ejs', {err: "", feedback: ""});
});

app.get('/scoreboard', (req, res)=> {
    res.render('scoreboard.ejs', {err: "", feedback: ""});
});

/* Post handlers */

app.listen(4000, ()=> {
    console.log('App listening on port 4000...');
});