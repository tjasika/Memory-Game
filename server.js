const express = require('express');
const app = express();
require('dotenv').config();

const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
});
module.exports = pool;

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
app.post('/signup', (req, res)=> {
    const data = req.body;
    if(!data.username || !data.password) {
		return res.render('signup.ejs', {err: "All fields required", feedback: ""});
	}

    pool.query(
        `SELECT Username, Password FROM User WHERE Username = ?`,
        [data.username],
        (err, response) => {
            if(err) {
                return res.render('signup.ejs', {err: err.message, feedback:""});
            }
            if(response.length > 0) {
                const userExists = response.some(user => user.Username === data.username);

                if (userExists) {
                    return res.render('signup.ejs', {err: "User with that username already exists.", feedback: ""});
                }
            } else {
                const saltRounds = 10;
                bcrypt.hash(data.password, saltRounds, (err, hashedPassword) => {
					if(err) {
						return res.render('signup.ejs', {err: err.message, feedback: ""});
					} else {
						pool.query(
							`INSERT INTO User (Username, Password, High_score) VALUES (?, ?, ?)`,
							[data.username, hashedPassword, 0],
							(err, response) => {
								if(err) {
									return res.render('signup.ejs', {err: err.message, feedback: ""});
								} else {
									res.redirect('/login');
								}
							}
						)
					}
				});
            }
        }
    )
});


app.listen(4000, ()=> {
    console.log('App listening on port 4000...');
});