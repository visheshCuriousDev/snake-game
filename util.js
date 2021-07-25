/**
 * This is a debouncer that waits till the function excuted multiple times calls only once
 * @param {*} func 
 * @returns a function
 */
 function debounce(func){
    var timer;
    return function(event){
      if(timer) clearTimeout(timer);
      timer = setTimeout(func,100,event);
    };
}

/**
 * Function to get a random number for snake's food
 * @param {*} min Always 0
 * @param {*} max Max boards width or height
 * @returns number
 */
function random_number(min, max, snakesize) {
    // Get a rondom number
    // Multiple with max-min because it will give  number that mostly lies within the min and max
    // Divide my snake size so it falls within the snakes trajectory
    // As the values will be very small. Multipley by snake size at last
    // To avoid float numbers round the result
    return Math.round((Math.random() * (max-min) + min) / snakesize) * snakesize;
}

/**
 * Function to set best score
 */
function setPreviousBestScore() {
    document.getElementById("prevScore").innerHTML = localStorage.getItem('prevScore');
}
