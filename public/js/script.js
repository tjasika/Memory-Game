document.addEventListener("DOMContentLoaded", function(){
    generateCards();
})

var firstCard  = null;
var secondCard = null;
var attempts = 0;

let newButton = document.getElementById('new-btn');
newButton.addEventListener("click", function(){
        setTimeout(function(){
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
    var finalAttempts = Math.floor(attempts/2);
    let attemptCount = document.getElementById('attempt-count');
    attemptCount.innerHTML = finalAttempts;
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


//If all cards are matched it displays a message
function checkGameEnd() {
    var unmatchedCards = document.querySelectorAll(".card:not(.matched)");

    if (unmatchedCards.length === 0) {
        setTimeout(function() {

            var gameBoard = document.getElementById('game-board');
            if (!gameBoard) {
                gameBoard = document.createElement('div');
                gameBoard.id = 'game-board';
                document.body.insertBefore(gameBoard, document.getElementById('message-board'));
            }

            gameBoard.innerHTML = "";

            gameBoard.classList.add("message-container");

            var message = document.createElement('div');
            message.classList.add("message");
            
            message.innerHTML = `<b>You finished the game in ${attempts/2} attempts.</b>`;

            gameBoard.appendChild(message);

        }, 500);
    }
}



