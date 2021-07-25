//TODO: Add background for the canvas
//TODO: Add snake length reducer food
//TODO: Add a way to enable and disable borders

// Modal initialisations
const modal = document.getElementById("myModal");
const joystickModal = document.getElementById("joystickModal");
const descModal = document.getElementById("descModal");
const monkeyImg = document.getElementById("monkeyImg");

// Sounds initialisations
let sounds = true;
toggleSounds(true);
const biteAudio = new Audio("eat.mp3");
const crashAudio = new Audio("crash.mp3");

// General variables
let snakesize = 10;
let dx = snakesize; // horizontal velocity
let dy = 0; // Vertical velocity
let changing_directon = false;
let mainInterval;
let food_x;
let food_y;
let score = 0;
let showControls = false;
const snakeSpeedReducerWitdh = 764; // Always check if this alligns with the media query in CSS

// Board sizing
const board = document.getElementById('snakeBoard');
// Set the with and height of the canvas
board.width  = board.offsetWidth;
board.height = board.offsetHeight;
const board_cxt = board.getContext("2d");

// Wait till the window resize is done reset tehboard
window.addEventListener("resize", debounce ( () => {
    board.width  = board.offsetWidth;
    board.height = board.offsetHeight;
    board_width = parseInt(board_cxt.canvas.width);
    board_height = parseInt(board_cxt.canvas.height);
    setSnakeSize();
    if(mainInterval) {
        clearInterval(mainInterval);
        main();
    }
}));

/**
 * Function to determine the size of the snake
 * This will check the board size and increase or decrease snake size based on that
 */
function setSnakeSize() {
    if(board_height > 550 || board_width > 800) {
        snakesize = 20;
    } else {
        snakesize = 10;
    }
}

const snake_border = "darkblue"
const snake_background = "lightblue"
const board_border = "black";
const board_background = "white";
let board_width = parseInt(board_cxt.canvas.width);
let board_height = parseInt(board_cxt.canvas.height);
setSnakeSize();

// Initial snake position
const centerHeigth = parseInt(board_height/2);
const centerWidth = parseInt(board_width/2);
let snake = [];

// Add key press event
document.addEventListener("keydown", changeDirection);

/**
 * Main function that will recursively keep moving the snake
 */
function main(resetValues = true) {
    // Reset initial values
    if(resetValues) {
        dx = snakesize;
        dy = 0;
        snake = [
            {x: centerWidth, y: centerHeigth},
            {x: centerWidth - snakesize, y: centerHeigth},
            {x: centerWidth - (snakesize*2), y: centerHeigth},
            {x: centerWidth - (snakesize*3), y: centerHeigth},
            {x: centerWidth - (snakesize*4), y: centerHeigth}
        ];
        score = 0;
        setPreviousBestScore();
    };
    // check if board is small and chnage the movement direction to up
    if(board_width < snakeSpeedReducerWitdh) {
        dy = -snakesize;
        dx = 0;
    }
    // Loop and set the board
    mainInterval = setInterval(() => {
        changing_directon = false;
        clearBoard();
        draw_food();
        moveForward();
        setSnake();
    }, board_width < snakeSpeedReducerWitdh ? 120 : 70);
    get_food();
    draw_food();
}

/**
 * Function to start the game
 */
function start() {
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("restart").style.display = "block";
    main();
}

/**
 * Function that will clear the board
 */
function clearBoard() {
    // Set stroke style
    board_cxt.strokeStyle = board_border;
    // Set fill style
    board_cxt.fillStyle = board_background;
    // Draw border
    board_cxt.strokeRect(0, 0, board.width, board.height);
    // Draw backgroung color
    board_cxt.fillRect(0, 0, board.width, board.height);
}

/**
 * Function will set the position for snake. Prefarably center of the canvas
 */
function setSnake() {
    snake.forEach(s => drawSnake(s));
}

/**
 * Function to draw the snake based on the cordinates
 */
function drawSnake(cordinates, strokeColor = snake_border, fillColor = snake_background) {
    board_cxt.strokeStyle = strokeColor;
    board_cxt.fillStyle = fillColor;
    board_cxt.strokeRect(cordinates.x, cordinates.y, snakesize, snakesize);
    board_cxt.fillRect(cordinates.x, cordinates.y, snakesize, snakesize);
}

/**
 * Checks if game and ended and performs few actions
 * @returns Boolean
 */
function hasGameEnded() {
    // If snake hit the board
    if(snake[0].x > board_width || snake[0].x < 0 || snake[0].y > board_height || snake[0].y < 0) {
        return true;
    }
    // If the snake hit itself
    let selfKill = false;
    snake.forEach(s => {
        if(s.x === snake[0].x + dx && s.y === snake[0].y + dy) {
            selfKill = true;
            setTimeout(() => drawSnake(s, 'red', 'red'), 200);
        }
    });
    if(selfKill){
        return true;
    }
    return false;
}

/**
 * Move the snake to its next position
 * @returns 
 */
function moveForward() {
    if(hasGameEnded()) {
        gameEnded();
        return;
    }
    let next_x = snake[0].x + dx;
    let next_y = snake[0].y + dy;
    if((next_x === food_x && next_y === food_y) || isSnakeOnFood(next_x-snakesize, next_y-snakesize, next_x+snakesize, next_y+snakesize, food_x, food_y)) {
        playBiteAudio();
        get_food();
        draw_food();
        score += 5;
        document.getElementById("score").innerHTML = ''+score;
        increaseSnake();
        setTip();
    }
    snake.unshift({x: next_x, y: next_y});
    snake.pop();
}

/**
 * When the food is miss placed with snakes trajectory. Then this function will check if snake is within the foods boundry
 * @param {*} x1 Top left x position of snake
 * @param {*} y1 Top left y position of snake
 * @param {*} x2 Bottom right x position of snake
 * @param {*} y2 Bottom right y position of snake
 * @param {*} x  Food's x position
 * @param {*} y  Food's y position
 * @returns 
 */
function isSnakeOnFood(x1, y1, x2, y2, x, y) {
    if (x > x1 && x < x2 && y > y1 && y < y2)
        return true; 
    return false;
}

/**
 * Function to change the direction of the snake
 * @param {*} event 
 * @returns 
 */
function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const key = (event.keyCode) ? event.keyCode : event;
    // Check this condition so that when two array keys are press only one is executed by the time the interval comes back ot moe the snake
    if(changing_directon){
        return;
    }
    changing_directon = true;
    if(key === LEFT_KEY && dx !== snakesize){
        dx = -snakesize;
        dy = 0;
        return;
    }
    if(key === RIGHT_KEY && dx !== -snakesize){
        dx = snakesize;
        dy = 0;
        return;
    }
    if(key === UP_KEY && dy !== snakesize){
        dx = 0;
        dy = -snakesize;
        return;
    }
    if(key === DOWN_KEY && dy !== -snakesize){
        dx = 0;
        dy = snakesize;
        return;
    }
}

function get_food() {
    food_x = random_number(0, board_width - 20, snakesize);
    food_y = random_number(0, board_height - 20, snakesize);
    // Verify if the food is in snake place
    snake.forEach(s => {
        if(s.x === food_x || s.y === food_y) {
            draw_food();
        }
    });
    food_x = stabilizeFoodPosition(food_x, snake[0].x, board_width-(snakesize/2));
    food_y = stabilizeFoodPosition(food_y, snake[0].y, board_height-(snakesize/2));
}

/**
 * Check if the food is in align with the snakes trajectory else
 * sanke will be at 200 and food will be ta 205 and it will never match
 * @param {number} food food position
 * @param {number} snakeCoordinate snake position
 * @param {number} max Max value allowed
 * @returns stabilised point
 */
function stabilizeFoodPosition(food, snakeCoordinate, max) {
    let adjustValue = (snakeCoordinate - snakesize) % snakesize;
    let finalVal = food + ((adjustValue > 0) ? adjustValue : -1*adjustValue);
    if(finalVal >= max) {
        return max - 50;
    }
    return finalVal;
}

/**
 * Function to draw the randomly generated food
 */
function draw_food() {
    // Select alternating image
    let img;
    if(score % 2 === 0){
        img = document.getElementById("fg1");
    } else {
        img = document.getElementById("fg2");
    }
    board_cxt.drawImage(img, food_x, food_y, snakesize, snakesize);
}

/**
 * Function to add length to the snake
 */
function increaseSnake() {
    snake.push({x: snake[snake.length-1].x, y: snake[snake.length-1].y});
}

/**
 * Function to store the game ended
 */
function gameEnded() {
    let prevScore = localStorage.getItem('prevScore');
    if(prevScore) {
        prevScore = parseInt(prevScore);
        if(prevScore < score) {
            localStorage.setItem("prevScore", score);
        }
    } else {
        localStorage.setItem("prevScore", score);
    }
    playCrashAudio();
    // If score is lesser than 20
    if(score < 50) {
        setTimeout(() => {
            modal.style.display = "block";
            monkeyImg.style.display = "block";
        }, 300);
    }
    clearInterval(mainInterval);
    setPreviousBestScore();
}

/**
 * Function to restart the game
 */
function restartGame() {
    clearInterval(mainInterval);
    document.getElementById("score").innerHTML = '0';
    main();
}

/**
 * Function to play food eatten sound
 */
function playBiteAudio() {
    if(sounds) {
        biteAudio.play();
    }
}

/**
 * Function to play snake crashed sound
 */
function playCrashAudio() {
    if(sounds) {
        crashAudio.play();
    }
}

/**
 * Function to toggle sounds
 * @param {*} val 
 */
function toggleSounds(val = false) {
    sounds = val;
    if(sounds) {
        document.getElementById("soundOff").style.display = "none";
        document.getElementById("soundOn").style.display = "block";
    } else {
        document.getElementById("soundOff").style.display = "block";
        document.getElementById("soundOn").style.display = "none";
    }
}

/**
 * Function to display the tip occotionally
 */
function setTip() {
    if(score === 20) {
        document.getElementById("tip").style.display = "inline-flex";
        document.getElementById("tip-content").innerHTML = "Tip: Don't die !!! :-)";
        setTimeout(() => {
            document.getElementById("tip").style.display = "none";
        },10000);
    }
}

/**
 * Common steps to close a modal
 */
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("modalClose");
// When the user clicks on <span> (x), close the modal
for(let i=0; i<span.length; i++) {
    span[i].onclick = function() {
        if(modal) modal.style.display = "none";
        if(descModal) descModal.style.display = "none";
        if(monkeyImg) monkeyImg.style.display = "none";
    }
}
// Redraw the board after closing joystick popup
document.getElementById("joyModalClose").onclick = () => {
    joystickModal.style.display = "none";
    main(false);
}

/**
 * Funciton to enable the joystick
 */
function joystickMode() {
    if(!showControls) {
        document.getElementById("board_controls").style.display = "inline-flex";
        document.getElementById("show-joystick-btn").innerHTML = "Hide joystick";
        document.getElementById("show-joystick-btn").style.backgroundColor = "red";
        joystickModal.style.display = "block";
        if(mainInterval)
            clearInterval(mainInterval);
    } else {
        document.getElementById("board_controls").style.display = "none";
        document.getElementById("show-joystick-btn").innerHTML = "Show joystick";
        document.getElementById("show-joystick-btn").style.backgroundColor = "cornflowerblue";
    }
    showControls = !showControls;
}

/**
 * Function to display the explanation modal
 */
function explanation() {
    descModal.style.display = "block";
}
