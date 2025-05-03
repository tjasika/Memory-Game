# Memory Game 🧠
This is an interactive web game where players test their memory by matching pairs of cards. Users can sign up or log in to track their scores and compete on the global scoreboard.
Built with **Node.js, HTML, CSS, JavaScript, and EJS**, this project combines classic gameplay with user authentication and score tracking.

### File setup
I set up the project using Node.js, starting by installing the necessary modules: Express, express-session, nodemon, bcrypt, mysql2, EJS, and dotenv. I used EJS as the templating engine and placed all my .ejs files in a folder called "views". Static files like CSS and JavaScript are served from the "public" folder. I created a basic HTML structure for all my EJS templates and added simple GET routes to render each page.

### Styling
Though visual appearance and design weren't my main priority, I decided to style my project in a 'space' theme. The illustrations on the cards are from https://www.vecteezy.com/vector-art/419229-astronaut-and-rocket-in-space by Matt Cole. The color palette is from Pinterest and the font is "Poppins" from Google Fonts.

### User authentification
For this project, I kept the user authentication simple — players just need a unique username and password. When signing up (via the POST sign-up route), the code first checks that both the username and password are provided. Then, it verifies whether a user with the same username already exists. If those checks pass, it hashes the password using bcrypt and saves the username, hashed password, and high score in the database. At each step, the code also checks for errors, and if anything goes wrong, it renders the signup.ejs page again with an error message.

![Screenshot of the log-in interface](assets/screenshot1.png)
