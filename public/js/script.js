//counting time
let secondsElapsed = 0;
let interval = null;
const time = document.getElementById('time');

//Time
function padStart(value) {
    return String(value).padStart(2, "0"); 
}

function setTime() {
    const minutes = Math.floor(secondsElapsed / 60);    
    const seconds = secondsElapsed % 60;   
    time.innerHTML = `${padStart(minutes)}:${padStart(seconds)}`; 
}

function timer() {
    secondsElapsed++; 
    setTime(); 
}

function startClock() {
    if(interval) { 
        stopClock();
    }
    interval = setInterval(timer, 1000);
}

function stopClock() {
    clearInterval(interval);
}

function resetClock() {
    stopClock();        
    secondsElapsed = 0;
    setTime();
}

//game logic
document.addEventListener("DOMContentLoaded", function(){
    startClock();
    generateCards();
})

var firstCard  = null;
var secondCard = null;
var attempts = 0;

let newButton = document.getElementById('new-btn');
newButton.addEventListener("click", function(){
        setTimeout(function(){
            resetClock();
            startClock();
            generateCards();
    }, 700)
})

//The Fisher-Yates Shuffle
function shuffle(array){
    let currentIndex = array.length;
    while (currentIndex != 0) {

        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
    
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}

//Creates a whole new board with cards
function generateCards() {
    var existingBoard = document.getElementById('game-board');
    attempts = 0;
    document.getElementById('attempt-count').textContent = '0';

    if (existingBoard) {
        existingBoard.remove();
    }

    var newBoard = document.createElement('div');
    newBoard.id = 'game-board';
    document.body.insertBefore(newBoard, document.getElementById('message-board'));

    var gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = "";
    
    var cardValues = [
        "/images/img1.png", "/images/img1.png",
        "/images/img2.png", "/images/img2.png",
        "/images/img3.png", "/images/img3.png",
        "/images/img4.png", "/images/img4.png",
        "/images/img5.png", "/images/img5.png",
        "/images/img6.png", "/images/img6.png",
        "/images/img7.png", "/images/img7.png",
        "/images/img8.png", "/images/img8.png",
    ];

    cardValues = shuffle(cardValues);

    for (var i = 0; i < cardValues.length; i++) {
        var card = createCard(cardValues[i]); //Each card gets assigned a random value
        gameBoard.appendChild(card);

        card.addEventListener("click", function() {
            handleCardClick(this);
        });
    }

    firstCard = null;
    secondCard = null;  
}

//Creates empty cards
function createCard(imagePath) {

    var card = document.createElement('div');
    card.classList.add("card");

    var cardInner = document.createElement('div');
    cardInner.classList.add("card-inner");

    var cardFront = document.createElement('div');
    cardFront.classList.add("card-front");

    var cardBack = document.createElement('div');
    cardBack.classList.add("card-back");

    var backImage = document.createElement('img');
    backImage.src = imagePath;
    backImage.alt = "Memory Card";
    backImage.classList.add("card-image");
    cardBack.appendChild(backImage);


    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);

    //Enables flipping on click
    card.addEventListener("click", function () {
        card.classList.add("flipped");
    });

    return card;
}

function handleCardClick(card) {
    if (!firstCard) {
        firstCard = card; 
        card.classList.add("flipped");
    } else if (!secondCard && card !== firstCard) {
        secondCard = card;
        card.classList.add("flipped");
    }
    checkCards();
}

//Checks for matches
function checkCards() {
    attempts++;
    let firstCardImg = firstCard.querySelector(".card-back img").src;
    let secondCardImg = secondCard.querySelector(".card-back img").src;

    if (firstCardImg === secondCardImg) {
        setTimeout(function() {
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");
            firstCard = null;
            secondCard = null;
            checkGameEnd(); //Checks if all are matched
        }, 500); 
    } else {
        setTimeout(function() {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            firstCard = null;
            secondCard = null;
        }, 1000);
    }
}

function calculateScore(attempts, timeTaken, totalPairs) {
    const baseScore = 1000;
    const timePenalty = timeTaken * 3;
    const attemptPenalty = (attempts - totalPairs) * 20;

    return Math.max(0, baseScore - timePenalty - attemptPenalty);
}

async function saveScore(score) {
    try {
        const response = await fetch('/savescore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score: score })
        });
        const data = await response.json();
        if(response.ok) {
            console.log('Score saved successfully:', data.message);
            return data.message;
        } else {
            console.log('Error:', data.message);
            return null;
        } 
    } catch(err) {
        console.log('Error:', data.message);
        return null;
    }
}


function checkGameEnd() {
    var unmatchedCards = document.querySelectorAll(".card:not(.matched)");
    const timeTaken = parseInt(document.getElementById("time").textContent.split(":").reduce((a, b) => 60 * a + +b));
    var finalAttempts = Math.floor(attempts/2);
    let attemptCount = document.getElementById('attempt-count');
    attemptCount.innerHTML = finalAttempts;
    let finalScore = calculateScore(finalAttempts/2, timeTaken, 8);

    if (unmatchedCards.length === 0) {
        setTimeout(async function() {
            stopClock();

            const gameBoard = document.getElementById('game-board');
            gameBoard.innerHTML = "";
            gameBoard.className = "message-container";
            gameBoard.style.display = "flex";

            const messageBox = document.createElement("div");
            messageBox.classList.add("end-message");

            const congrats = document.createElement("h2");
            congrats.textContent = "Congratulations!";

            const attemptsInfo = document.createElement("p");
            attemptsInfo.textContent = `You completed the game in ${attempts / 2} attempts`;

            const timeInfo = document.createElement("p");
            timeInfo.textContent = `Time taken: ${document.getElementById("time").textContent}`;

            const scoreInfo = document.createElement("p");
            scoreInfo.textContent = `Score: ${finalScore}`;

            // Save score if user is logged in
            if (typeof loggedIn !== 'undefined' && loggedIn) {
                const saveMessage = await saveScore(finalScore);
                if (saveMessage) {
                    const savedInfo = document.createElement("p");
                    savedInfo.textContent = saveMessage;
                    savedInfo.style.color = "green";
                    savedInfo.style.fontWeight = "bold";
                    messageBox.appendChild(savedInfo);
                }
            }

            const newGameButton = document.createElement("button");
            newGameButton.className = "end-btn";
            newGameButton.textContent = "Play Again";
            newGameButton.addEventListener("click", function () {
                resetClock();
                startClock();
                generateCards();
            });

            messageBox.appendChild(congrats);
            messageBox.appendChild(attemptsInfo);
            messageBox.appendChild(timeInfo);
            messageBox.appendChild(scoreInfo);
            messageBox.appendChild(newGameButton);

            gameBoard.appendChild(messageBox);
        }, 500);
    }
}



