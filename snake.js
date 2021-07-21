//TODO: Add background for the canvas
//TODO: Add snake length reducer food
//TODO: Add a way to enable and disable borders

// Modal initialisations
const modal = document.getElementById("myModal");
const monkeyImg = document.getElementById("monkeyImg");

// Sounds initialisations
let sounds = true;
toggleSounds(true);
const biteAudio = new Audio("http://freesoundeffect.net/sites/default/files/insect-eat-chew-bu01-238-sound-effect-64440918.mp3");
const crashAudio = new Audio("crash.mp3");

let snakesize = 10;
const board = document.getElementById('snakeBoard');
// Set the with and height of the canvas
board.width  = board.offsetWidth;
board.height = board.offsetHeight;
const board_cxt = board.getContext("2d");

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

function setSnakeSize() {
    if(board_height > 550 || board_width > 800) {
        snakesize = 20;
    } else {
        snakesize = 10;
    }
}

// Deboucer function to wait till the window resize is done
function debounce(func){
    var timer;
    return function(event){
      if(timer) clearTimeout(timer);
      timer = setTimeout(func,100,event);
    };
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

// horizontal velocity
let dx = snakesize;
// Vertical velocity
let dy = 0;
let changing_directon = false;
let mainInterval;
let food_x;
let food_y;
let score = 0;

// Add key press event
document.addEventListener("keydown", changeDirection);

function main() {
    // Reset initial values
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
    // Loop and set the board
    mainInterval = setInterval(() => {
        changing_directon = false;
        clearBoard();
        draw_food();
        moveForward();
        setSnake();
    }, 100);
    get_food();
    draw_food();
}

function start() {
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("restart").style.display = "block";
    main();
}

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

// Set the initial position for snake
function setSnake() {
    snake.forEach(s => drawSnake(s));
}

// Based on cordinates draw the snake
function drawSnake(cordinates, strokeColor = snake_border, fillColor = snake_background) {
    board_cxt.strokeStyle = strokeColor;
    board_cxt.fillStyle = fillColor;
    board_cxt.strokeRect(cordinates.x, cordinates.y, snakesize, snakesize);
    board_cxt.fillRect(cordinates.x, cordinates.y, snakesize, snakesize);
}

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

function moveForward() {
    if(hasGameEnded()) {
        gameEnded();
        return;
    }
    let next_x = snake[0].x + dx;
    let next_y = snake[0].y + dy;
    if(next_x === food_x && next_y === food_y) {
        playBiteAudio();
        get_food();
        draw_food();
        score += 5;
        document.getElementById("score").innerHTML = ''+score;
        increaseSnake();
    }
    snake.unshift({x: next_x, y: next_y});
    snake.pop();
}

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const key = event.keyCode;
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

function random_food(min, max) {
    return Math.round((Math.random() * (max-min) + min) / snakesize) * snakesize;
}

function get_food() {
    food_x = random_food(0, board_width - 20);
    food_y = random_food(0, board_height - 20);
    // Verify if the food is in snake place
    snake.forEach(s => {
        if(s.x === food_x || s.y === food_y) {
            draw_food();
        }
    });
    // console.log("-----------------");
    // console.log(food_x, food_y);
    // console.log(snake[0].x, snake[0].y);
    food_x = stabilizeFoodPosition(food_x, snake[0].x);
    food_y = stabilizeFoodPosition(food_y, snake[0].y);
    // console.log(food_x, food_y);
}

// Check if the food is in align with the snakes trajectory else
// sanke will ne are 200 and food will be ta 205 and it will never match
function stabilizeFoodPosition(food, snakeCoordinate) {
    let adjustValue = (snakeCoordinate - snakesize) % snakesize;
    return food + ((adjustValue > 0) ? adjustValue : -1*adjustValue);
}

function draw_food() {
    board_cxt.fillStyle = 'lightgreen';
    board_cxt.strokeStyle = 'darkgreen';
    board_cxt.fillRect(food_x, food_y, snakesize, snakesize);
    board_cxt.strokeRect(food_x, food_y, snakesize, snakesize);
}

function increaseSnake() {
    snake.push({x: snake[snake.length-1].x, y: snake[snake.length-1].y});
}

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

function setPreviousBestScore() {
    document.getElementById("prevScore").innerHTML = localStorage.getItem('prevScore');
}

function restartGame() {
    clearInterval(mainInterval);
    document.getElementById("score").innerHTML = '0';
    main();
}

function playBiteAudio() {
    if(sounds) {
        biteAudio.play();
    }
}

function playCrashAudio() {
    if(sounds) {
        crashAudio.play();
    }
}

function toggleSounds(val = false) {
    console.log(val);
    sounds = val;
    if(sounds) {
        document.getElementById("soundOff").style.display = "none";
        document.getElementById("soundOn").style.display = "block";
    } else {
        document.getElementById("soundOff").style.display = "block";
        document.getElementById("soundOn").style.display = "none";
    }
}


// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
    monkeyImg.style.display = "none";
}
