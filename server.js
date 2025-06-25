const express = require('express');
const app = express();
require('dotenv').config();

const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt');

//Database
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

//For logged in
app.use((req, res, next) => {
    res.locals.username = req.session.loggedin ? req.session.username : null;   //makes the logged-in username a global variable
    next();
});

app.set("view engine", "ejs");          
app.use(express.static('public'));     

app.set("views", path.join(__dirname, "views"));    
app.use(express.json());                            
app.use(express.urlencoded({ extended: true }));

//Get Handlers
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
    res.render('game.ejs', {err: "", feedback: "", loggedIn: req.session.loggedIn || false });
});

app.get('/scoreboard', (req, res)=> {
    pool.query(
        `SELECT Username, High_score, High_score_date, Last_played
        FROM user
        ORDER BY High_score DESC
        LIMIT 5`, (err, results) => {
            if(err) {
                return res.render('scoreboard.ejs', {err: "", feedback: "", topPlayers:[]});
            }
            res.render('scoreboard.ejs', {err: "", feedback: "", topPlayers: results});
        }
    )
});

//Post Handlers
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
                                    console.log('User added successfully.');
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

app.post('/login', (req, res)=> {
	const data = req.body;
	pool.query (
		`SELECT * FROM User WHERE Username = ?`, [data.username], (err, response)=>{
			if(err) {
				return res.render("login.ejs", {err: err.message, feedback: ""});
			}
			
			if (response.length > 0) {
                const user = response[0];
                bcrypt.compare(data.password, user.Password, (err, isMatch) => {
                    if (err) {
                        return res.render("login.ejs", { err: err.message, feedback: "" });
                    }
    
                    if (isMatch) {
                        req.session.loggedin = true;
                        req.session.username = user.Username;
                        req.session.userId = user.ID;
    
                        return res.redirect('/');
                    } else {
                        res.render("login.ejs", { err: "Incorrect username or password", feedback: "" });
                    }
                });
    
            } else {
                res.render("login.ejs", { err: "Incorrect username or password", feedback: "" });
            }
		}
	);
});

app.post('/savescore', (req, res) => {
    if(!req.session.loggedin || !req.session.userId) {
        return res.status(401).json({ message: 'User not logged in' });
    }
    const { score } = req.body;
    const userId = req.session.userId;
    
    pool.query(
        `SELECT High_score FROM user WHERE ID = ?`, [userId], (err, result) => {
            if(err) {
                return res.status(500).json({message: "Database error"});
            }

            const currentHigh = result[0].High_score;
            const now = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format for MySQL DATETIME
            
            if(score > currentHigh) {
                pool.query(
                    `UPDATE user SET High_score = ?, High_score_date = ?, Last_played = ? WHERE ID = ?`, 
                    [score, now, now, userId], (err, updateResult) => {
                        if(err) {
                            console.error('Database error updating high score:', err);
                            return res.status(500).json({message: "Database error"});
                        }
                        console.log('High score updated successfully');
                        return res.json({ message: 'New high score saved!' });
                    }
                )
            } else {
                pool.query(
                    `UPDATE user SET Last_played = ? WHERE ID = ?`, 
                    [now, userId], (err) => {
                        if(err) {
                            console.error('Database error updating last played:', err);
                            return res.status(500).json({message: "Database error"});
                        }
                        console.log('Last played updated successfully');
                        return res.json({ message: 'Score recorded!' });
                    }
                )
            }
        }
    )
});

//Log out
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send("Error logging out");
        }
        res.redirect("/login");
    });
});


app.listen(4000, ()=> {
    console.log('App listening on port 4000...');
});