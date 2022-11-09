
var appState = 0;   // 0 - Main menu    1 - Single Player    2 - Multiplayer Lobby    3 - Multiplayer    4 - Win state    5 - Lose state    6 - Tie state     7 - howToPlay screen

var dice_1_img, dice_2_img, dice_3_img, dice_4_img, dice_5_img, dice_6_img;
var gameOverFade;
var board_img;
var highlight_img;
var shadow_img;
var myPlayer = '1'; // If we are player 1 or 2
var currentGameState = "1000000000000000000000" // 1 or 2 for P1 or P2 turn, dice for current dice roll, last move's dice, 1-3 last move, 9 P1's board, 9 P2's board
var displayGameState;    // The gamestate we are currently displaying, differs from current game state which allows us to animate between game states
var highLightOpacities = [0, 0, 0];   // Lets us fade in and out the opacity of the column higlight images
var animationFrame;      // 1-30 - move dice, 60-120 roll dice
var diceRollVal = 1;      // What value is currently being shown on the die that is being rolled
var middleScreenOffset;   // pixels to translate everything to the middle of the screen
var myFont;
var gameMode = 0;         // 0 - singleplayer easy   1 - singleplayer medium   2 - singleplayer hard   3 - multiplayer

// Consts
//const diceSize = 0.05556 * 1.5; // Size of die relative to window height (1/6th of 1/3rd of screen width)
const diceSize = 0.11; // Size of die relative to window height

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(240);
  middleScreenOffset = (windowWidth - windowHeight * 1.5) / 2;

  // Load in our assets
  dice_1_img = loadImage('assets/dice_1.png');
  dice_2_img = loadImage('assets/dice_2.png');
  dice_3_img = loadImage('assets/dice_3.png');
  dice_4_img = loadImage('assets/dice_4.png');
  dice_5_img = loadImage('assets/dice_5.png');
  dice_6_img = loadImage('assets/dice_6.png');
  shadow_img = loadImage('assets/dice_shadow.png');
  board_img = loadImage('assets/board.jpg');
  highlight_img = loadImage('assets/highlight.png');

  myFont = loadFont('assets/JudgesSC.ttf');

  appState = 0;

}

function newGame() {

  if (Math.random() > 0.5) {
    currentGameState = "1100000000000000000000";
  } else {
    currentGameState = "2100000000000000000000";
  }

  currentGameState = setCharAt(currentGameState, 1, (1 + Math.floor(Math.random() * 6)));

  displayGameState = currentGameState;
  animationFrame = 31;  // Start by rolling a dice
  appState = 3;
  gameOverFade = 0;

}




///////////// DRAW //////////////
function draw() {

  background(5);

  // Translate everything to the middle of the screen
  translate(middleScreenOffset, 0);


  // In-game
  if (appState == 1 || appState == 3 || appState == 4 || appState == 5 || appState == 6) {

    image(board_img, 0, 0, windowHeight * 1.5, windowHeight);

    // If it's our turn to move, get the current mouse position and highlight that spot
    if (currentGameState.charAt(0) == myPlayer && animationFrame == -1) {
      drawColumnHighlight()
    }

    // Draw the dice on the board
    drawGameState(displayGameState, myPlayer);

    // If we are in the middle of an animation then play that
    if (animationFrame > -1 && (appState == 1 || appState == 3)) {
      doAnimations();

      // at frame 60 of the animation the dice smashes down, check here is there is a winner
      if (animationFrame == 60) {
        var winState = checkWin(currentGameState);
        if (winState == myPlayer) {
          appState = 4;
        } else if (winState == '3') {
          appState = 6;
        } else if (winState != '0') {
          appState = 5;
        }
      }

    }

    // If it is the other player's turn, get their move
    if (currentGameState.charAt(0) != myPlayer && animationFrame == -1 && gameMode == 4) {
      getOpponentMove(currentGameState);
    }

    // If it is the ai's turn, get it's move
    if (currentGameState.charAt(0) != myPlayer && animationFrame == -1 && gameMode != 4) {
      getAIMove(currentGameState, gameMode);
    }

  }


  // Game over screens
  if (appState == 4 || appState == 5 || appState == 6) {
    gameOverScreen();
  }

  // Title screen
  if (appState == 0) {
    titleScreen();
  }



}





//  Mouse has clicked! see if we are making a move or not
function mouseClicked() {

  var mouseXOffset = mouseX - middleScreenOffset;

  // Make a move
  if (currentGameState.charAt(0) == myPlayer && (appState == 1 || appState == 3) && animationFrame == -1) {
    if (mouseY > windowHeight / 2 && mouseY < windowHeight * (9 / 10)) {
      if (mouseXOffset > (windowHeight * 1.5) / 3 && mouseXOffset < (windowHeight * 1.5) / 3 + (windowHeight * 1.5) / 9) {
        placeDie(currentGameState, myPlayer, 0);
      }
      else if (mouseXOffset > (windowHeight * 1.5) / 3 + (windowHeight * 1.5) / 9 && mouseXOffset < (windowHeight * 1.5) / 3 + 2 * (windowHeight * 1.5) / 9) {
        placeDie(currentGameState, myPlayer, 1);
      }
      else if (mouseXOffset > (windowHeight * 1.5) / 3 + 2 * (windowHeight * 1.5) / 9 && mouseXOffset < (windowHeight * 1.5) / 3 + 3 * (windowHeight * 1.5) / 9) {
        placeDie(currentGameState, myPlayer, 2);
      }

    }
  }

  if (appState == 7){
    appState = 0;
  }

  // If we are in a game over state, click to start a new game
  if (appState == 4 || appState == 5 || appState == 6) {
    newGame();
  }

  // Title screen
  if (appState == 0) {
    if (mouseXOffset > (windowHeight*1.5)/31 &&  mouseXOffset < (windowHeight*1.5)/4   &&   mouseY > windowHeight/2.1 && mouseY < windowHeight/1.9){
      appState = 7;
      // How to play
    }

    if (mouseXOffset > (windowHeight*1.5)/31 &&  mouseXOffset < (windowHeight*1.5)/3   &&   mouseY > windowHeight/1.85 && mouseY < windowHeight/1.7){
      //Singleplayer (easy) clicked
      newGame();
      gameMode = 1;
    }

    if (mouseXOffset > (windowHeight*1.5)/31 &&  mouseXOffset < (windowHeight*1.5)/3   &&   mouseY > windowHeight/1.65 && mouseY < windowHeight/1.5){
      //Singleplayer (Hard) clicked
      newGame();
      gameMode = 3;
    }

    if (mouseXOffset > (windowHeight*1.5)/31 &&  mouseXOffset < (windowHeight*1.5)/3   &&   mouseY > windowHeight/1.45 && mouseY < windowHeight/1.3){
      // Multiplayer button clicked
    }
  }

}



// If there is a free row in the selected column, place the die there and go on to the next move
function placeDie(gameState, player, pos) {

  var board = gameState.substring(4, 22);
  var offset = 0;   // If this is player 2, offset board indicies by 9
  var placePos;

  if (player == '2') {
    offset = 9;
  }

  if (board.charAt(pos + offset) == '0') {
    currentGameState = setCharAt(currentGameState, 4 + offset + pos, gameState.charAt(1)); // Put the dice in the next free location in this column
    placePos = offset + pos;
  } else if (board.charAt(pos + offset + 3) == '0') {
    currentGameState = setCharAt(currentGameState, 4 + offset + pos + 3, gameState.charAt(1));
    placePos = offset + pos + 3;
  } else if (board.charAt(pos + offset + 6) == '0') {
    currentGameState = setCharAt(currentGameState, 4 + offset + pos + 6, gameState.charAt(1));
    placePos = offset + pos + 6;
  } else {
    return; // No free spaces in this col, ignore the move
  }


  // Delete any of this value dice from the opponent's column
  currentGameState = fightDice(currentGameState, player, pos, gameState.charAt(1));


  // Move was made successfully, pass the game state over to other player and get their dice roll
  if (player == '1') {
    currentGameState = setCharAt(currentGameState, 0, '2');
  } else {
    currentGameState = setCharAt(currentGameState, 0, '1');
  }

  currentGameState = setCharAt(currentGameState, 3, toLetterPos(placePos));
  currentGameState = setCharAt(currentGameState, 2, gameState.charAt(1));
  currentGameState = setCharAt(currentGameState, 1, 1 + Math.floor(Math.random() * 6));  // Next dice roll for next player

  //console.log("Place pos: " + placePos);
  //console.log(currentGameState);

  animationFrame = 0;
  displayGameState = displayGameState.charAt(0) + "000" + displayGameState.substring(4, 22);  // Remove the rolled dice from displaying

}


// Obliterates opponent's dice and shuffles the dice down
function fightDice(gameState, player, pos, diceVal) {

  if (player == '1') {
    if (gameState.charAt(4 + 9 + pos) == diceVal) {
      gameState = setCharAt(gameState, 4 + 9 + pos, '0');
    }
    if (gameState.charAt(4 + 9 + pos + 3) == diceVal) {
      gameState = setCharAt(gameState, 4 + 9 + pos + 3, '0');
    }
    if (gameState.charAt(4 + 9 + pos + 6) == diceVal) {
      gameState = setCharAt(gameState, 4 + 9 + pos + 6, '0');
    }
  } else {
    if (gameState.charAt(4 + pos) == diceVal) {
      gameState = setCharAt(gameState, 4 + pos, '0');
    }
    if (gameState.charAt(4 + pos + 3) == diceVal) {
      gameState = setCharAt(gameState, 4 + pos + 3, '0');
    }
    if (gameState.charAt(4 + pos + 6) == diceVal) {
      gameState = setCharAt(gameState, 4 + pos + 6, '0');
    }
  }

  return gameState;

}






// Draws the game state on the board for 1 or 2 player's perspective
function drawGameState(gameState, player) {

  var board = gameState.substring(4, 22);

  // Place dice on the board
  for (var i = 0; i < 18; i++) {
    if (board.charAt(i) != '0') {
      image(shadow_img, boardScreenPos(i, player)[0], boardScreenPos(i, player)[1], windowHeight * diceSize, windowHeight * diceSize * 1.171875);
      image(diceImg(board.charAt(i)), boardScreenPos(i, player)[0], boardScreenPos(i, player)[1], windowHeight * diceSize, windowHeight * diceSize);
    }
  }

  // If there is a rolled dice, place that now
  if (gameState.charAt(1) != '0') {

    if (player == gameState.charAt(0)) { // check if this is our dice or the other player's
      image(shadow_img, (windowHeight * 1.5) / 6 - windowHeight * diceSize / 2, windowHeight * (3 / 4), windowHeight * diceSize, windowHeight * diceSize * 1.171875);
      image(diceImg(gameState.charAt(1)), (windowHeight * 1.5) / 6 - windowHeight * diceSize / 2, windowHeight * (3 / 4), windowHeight * diceSize, windowHeight * diceSize);
    } else {
      image(shadow_img, (windowHeight * 1.5) * (5 / 6) - windowHeight * diceSize / 2, windowHeight * (1 / 4) - windowHeight * diceSize, windowHeight * diceSize, windowHeight * diceSize * 1.171875);
      image(diceImg(gameState.charAt(1)), (windowHeight * 1.5) * (5 / 6) - windowHeight * diceSize / 2, windowHeight * (1 / 4) - windowHeight * diceSize, windowHeight * diceSize, windowHeight * diceSize);
    }
  }

  // Draw the text at the top of each col
  fill(255);
  textSize(windowHeight / 30);
  textAlign(CENTER, CENTER);
  textFont(myFont);
  if (myPlayer == '1') {
    text(getScore(gameState, '1', 0), (windowHeight * 1.5) / 3 + ((windowHeight * 1.5) / 18) + 0 * ((windowHeight * 1.5) / 9), windowHeight * (11 / 20));
    text(getScore(gameState, '1', 1), (windowHeight * 1.5) / 3 + ((windowHeight * 1.5) / 18) + 1 * ((windowHeight * 1.5) / 9), windowHeight * (11 / 20));
    text(getScore(gameState, '1', 2), (windowHeight * 1.5) / 3 + ((windowHeight * 1.5) / 18) + 2 * ((windowHeight * 1.5) / 9), windowHeight * (11 / 20));

    text(getScore(gameState, '2', 0), (windowHeight * 1.5) / 3 + ((windowHeight * 1.5) / 18) + 0 * ((windowHeight * 1.5) / 9), windowHeight * (9 / 20));
    text(getScore(gameState, '2', 1), (windowHeight * 1.5) / 3 + ((windowHeight * 1.5) / 18) + 1 * ((windowHeight * 1.5) / 9), windowHeight * (9 / 20));
    text(getScore(gameState, '2', 2), (windowHeight * 1.5) / 3 + ((windowHeight * 1.5) / 18) + 2 * ((windowHeight * 1.5) / 9), windowHeight * (9 / 20));

    textSize(windowHeight / 15);
    text(getScore(gameState, '1', 0) + getScore(gameState, '1', 1) + getScore(gameState, '1', 2), (windowHeight * 1.5) / 6, windowHeight * (2 / 3));
    text(getScore(gameState, '2', 0) + getScore(gameState, '2', 1) + getScore(gameState, '2', 2), (windowHeight * 1.5) * (5 / 6), windowHeight * (1 / 3));
  } else {

  }

}


// Gets the pixel coords of dice 'i' of player 'player'
function boardScreenPos(i, player) {

  // If we are player 2, swap the positions fo the dice around so that our dice are always in front of us
  if (player == '2') {
    i -= 9;
    if (i < 0) {
      i += 18;
    }
  }

  // Find the positions of this die on the screen
  if (i < 9) {
    var x = (windowHeight * 1.5) / 2 + ((i % 3) - 1) * (windowHeight * 1.5 / 9) - diceSize * 0.5 * windowHeight;
    var y = windowHeight / 2 + windowHeight / 12 + floor(i / 3) * windowHeight * diceSize * 1.1;
    return [x, y];
  } else {
    var x = (windowHeight * 1.5) / 2 + ((i % 3) - 1) * (windowHeight * 1.5 / 9) - diceSize * 0.5 * windowHeight;
    var y = windowHeight / 2 - windowHeight / 12 - floor((i - 9) / 3) * windowHeight * diceSize * 1.1 - windowHeight * diceSize;
    return [x, y];
  }

}



// Computes the animations for this move
function doAnimations() {
  if (animationFrame > -1) {
    animationFrame++;
    highLightOpacities = [0, 0, 0];
    if (animationFrame <= 30) {
      diceGlide(currentGameState.charAt(2), myPlayer, animationFrame);  // No idea if this is right lmao
    }
    if (animationFrame >= 30) { // Dice has finished move
      displayGameState = currentGameState;
      displayGameState = setCharAt(displayGameState, 1, '0');
    }
    if (animationFrame > 60 && animationFrame <= 120) {
      rollDie(myPlayer, animationFrame - 60);
    }
    if (animationFrame == 120) { // finished animating
      animationFrame = -1;
      displayGameState = currentGameState;
    }
  }
}


// Draws the dice at a position between the throw and the board
function diceGlide(dice, player, frame) {
  var distance = 1.0 / (1 + Math.pow(2.14, ((-frame + 10.0) / 2.5))); // Smooth sigmoid

  var xInit, yInit;
  if (player != currentGameState.charAt(0)) {
    xInit = (windowHeight * 1.5) / 6 - windowHeight * diceSize / 2;
    yInit = windowHeight * (3 / 4);
  } else {
    xInit = (windowHeight * 1.5) * (5 / 6) - windowHeight * diceSize / 2;
    yInit = windowHeight * (1 / 4) - windowHeight * diceSize;
  }

  var xEnd, yEnd;
  if (player != currentGameState.charAt(0)) {
    xEnd = boardScreenPos(fromLetterPos(currentGameState.charAt(3)), '1')[0];
    yEnd = boardScreenPos(fromLetterPos(currentGameState.charAt(3)), '1')[1];
  } else {
    xEnd = boardScreenPos(fromLetterPos(currentGameState.charAt(3)), '1')[0];
    yEnd = boardScreenPos(fromLetterPos(currentGameState.charAt(3)), '1')[1];
  }


  var x = xEnd * distance + xInit * (1.0 - distance);
  var y = yEnd * distance + yInit * (1.0 - distance);

  image(diceImg(dice), x, y, (windowHeight * diceSize) * (1.0 + distance * 0.3), (windowHeight * diceSize) * (1.0 + distance * 0.3));

}

// Animates the rolling of a die
function rollDie(player, frame) {
  var distance = Math.max(Math.cos(frame / 30), 0.0);


  var x, y;
  if (player == currentGameState.charAt(0)) {
    x = (windowHeight * 1.5) / 6 - windowHeight * diceSize / 2;
    y = windowHeight * (3 / 4);
  } else {
    x = (windowHeight * 1.5) * (5 / 6) - windowHeight * diceSize / 2;
    y = windowHeight * (1 / 4) - windowHeight * diceSize;
  }

  if (frame % 6 == 0) {
    diceRollVal = 1 + Math.floor(Math.random() * 6);
  }
  if (frame > 40) {
    diceRollVal = currentGameState.charAt(1);
  }


  image(diceImg(diceRollVal), x, y, (windowHeight * diceSize) * (1.0 + distance * 0.3), (windowHeight * diceSize) * (1.0 + distance * 0.3));

}



// Return the image variable of dice 'diceNumber'
function diceImg(diceNumber) {
  if (diceNumber == 1) { return dice_1_img; }
  if (diceNumber == 2) { return dice_2_img; }
  if (diceNumber == 3) { return dice_3_img; }
  if (diceNumber == 4) { return dice_4_img; }
  if (diceNumber == 5) { return dice_5_img; }
  if (diceNumber == 6) { return dice_6_img; }
}





// Fades in and out the highlight images on mouseover
function drawColumnHighlight() {
  var mouseXOffset = mouseX - middleScreenOffset;
  if (mouseY > windowHeight / 2 && mouseY < windowHeight * (9 / 10)) {
    if (mouseXOffset > (windowHeight * 1.5) / 3 && mouseXOffset < (windowHeight * 1.5) / 3 + (windowHeight * 1.5) / 9) {
      highLightOpacities[0] = min(highLightOpacities[0] + 20, 128);
    }
    if (mouseXOffset > (windowHeight * 1.5) / 3 + (windowHeight * 1.5) / 9 && mouseXOffset < (windowHeight * 1.5) / 3 + 2 * (windowHeight * 1.5) / 9) {
      highLightOpacities[1] = min(highLightOpacities[1] + 20, 128);
    }
    if (mouseXOffset > (windowHeight * 1.5) / 3 + 2 * (windowHeight * 1.5) / 9 && mouseXOffset < (windowHeight * 1.5) / 3 + 3 * (windowHeight * 1.5) / 9) {
      highLightOpacities[2] = min(highLightOpacities[2] + 20, 128);
    }

  }

  tint(255, highLightOpacities[0]);
  image(highlight_img, (windowHeight * 1.5) / 3, windowHeight / 2 + windowHeight / 24, (windowHeight * 1.5) / 9, windowHeight * (5 / 12));
  tint(255, highLightOpacities[1]);
  image(highlight_img, (windowHeight * 1.5) / 3 + (windowHeight * 1.5) / 9, windowHeight / 2 + windowHeight / 24, (windowHeight * 1.5) / 9, windowHeight * (5 / 12));
  tint(255, highLightOpacities[2]);
  image(highlight_img, (windowHeight * 1.5) / 3 + 2 * (windowHeight * 1.5) / 9, windowHeight / 2 + windowHeight / 24, (windowHeight * 1.5) / 9, windowHeight * (5 / 12));
  tint(255, 255);
  highLightOpacities[0] = max(highLightOpacities[0] - 5, 0);
  highLightOpacities[1] = max(highLightOpacities[1] - 5, 0);
  highLightOpacities[2] = max(highLightOpacities[2] - 5, 0);
}



// Get other player move (TODO: currently just grabs random)
function getOpponentMove(gameState) {
  if (Math.random() < 0.03) {
    var move = 0 + Math.floor(Math.random() * 3);
    //console.log("Player: " + gameState.charAt(0) + " Move: " + move);
    placeDie(gameState, gameState.charAt(0), move);
  }
}



function getAIMove(gameState, difficulty) {
  // Wait a random time so it's like a real boy
  if (Math.random() < 0.03) {


    if (difficulty == 1 || difficulty == 2){ // Easiest difficulty, random move
      var move = 0 + Math.floor(Math.random() * 3);
      //console.log("Player: " + gameState.charAt(0) + " Move: " + move);
      placeDie(gameState, gameState.charAt(0), move);
    }

    if (difficulty == 3){ // Hardest difficulty (TODO)
      var move = 0;
      placeDie(gameState, gameState.charAt(0), move);
    }

  }
}




// Gets the score of a column
function getScore(gameState, player, col) {
  var tallies = [0, 0, 0, 0, 0, 0];
  var offset = 0;
  if (player == '2') {
    offset = 9;
  }

  if (gameState.charAt(4 + offset + col) != '0') { tallies[(int)(gameState.charAt(4 + offset + col)) - 1]++; }
  if (gameState.charAt(4 + offset + col + 3) != '0') { tallies[(int)(gameState.charAt(4 + offset + col + 3)) - 1]++; }
  if (gameState.charAt(4 + offset + col + 6) != '0') { tallies[(int)(gameState.charAt(4 + offset + col + 6)) - 1]++; }

  var score = 0;

  for (var i = 0; i < 6; i++) {
    //score += tallies[i]*(i+1);
    //score += Math.pow((i+1),tallies[i]);  // Score is calculated by multiplying together dice of same value in same col
    if (tallies[i] == 1) {
      score += (i + 1);
    } else if (tallies[i] == 2) {
      score += 2 * ((i + 1) + (i + 1));
    } else if (tallies[i] == 3) {
      score += 3 * ((i + 1) + (i + 1) + (i + 1));
    }
  }

  return score;

}

// Checks for win state
function checkWin(gameState) {
  var p1Full = true;
  var p2Full = true;
  for (var i = 0; i < 9; i++) {
    if (gameState.charAt(4 + i) == '0') {
      p1Full = false;
    }
  }
  for (var i = 0; i < 9; i++) {
    if (gameState.charAt(4 + i + 9) == '0') {
      p2Full = false;
    }
  }

  if (p2Full || p1Full) {  // Someone has won! Calculate who it is
    if (getScore(gameState, '1', 0) + getScore(gameState, '1', 1) + getScore(gameState, '1', 2) > getScore(gameState, '2', 0) + getScore(gameState, '2', 1) + getScore(gameState, '2', 2)) {
      console.log("Player 1 wins");
      return '1';
    } else if (getScore(gameState, '1', 0) + getScore(gameState, '1', 1) + getScore(gameState, '1', 2) < getScore(gameState, '2', 0) + getScore(gameState, '2', 1) + getScore(gameState, '2', 2)) {
      console.log("Player 2 wins");
      return '2';
    } else {
      console.log("Tie");
      return '3';  // TIE!
    }
  }

  return '0'; // Nobody has won yet

}


// Draw the game over screens
function gameOverScreen() {
  if (appState == 4 || appState == 5 || appState == 6) {

    var gameOverText = "";
    if (appState == 4) {
      gameOverText = "You Win";
    }
    if (appState == 5) {
      gameOverText = "You Lose";
    }
    if (appState == 6) {
      gameOverText = "Tie";
    }
    background(20, 10, 10, gameOverFade * 0.8);
    fill(255, gameOverFade);
    textSize(windowHeight / 5);
    textAlign(CENTER, CENTER);
    textFont(myFont);
    text(gameOverText, (windowHeight * 1.5) / 2, (windowHeight * 1.5) / 4);
    textSize(windowHeight / 25);
    text("New Game", (windowHeight * 1.5) / 2, (windowHeight * 1.5) / 3);
    gameOverFade = min(gameOverFade + 2, 255);
    tint(255, 255);

  }
}

// Draw the title screen
function titleScreen() {

  var mouseXOffset = mouseX - middleScreenOffset;

  if (appState == 0) {

    fill(255);
    textSize(windowHeight / 5);
    textAlign(LEFT, CENTER);
    textFont(myFont);
    text("Knucklebones", (windowHeight * 1.5) / 30, (windowHeight * 1.5) / 4);
    textSize(windowHeight / 25);

    // Hover highlight stuff
    if (mouseXOffset > (windowHeight*1.5)/31 &&  mouseXOffset < (windowHeight*1.5)/4   &&   mouseY > windowHeight/2.1 && mouseY < windowHeight/1.9){
      fill (255, 0, 0);
    }
    text("How to play", (windowHeight * 1.5) / 30, windowHeight / 2);
    fill(255);

    if (mouseXOffset > (windowHeight*1.5)/31 &&  mouseXOffset < (windowHeight*1.5)/3   &&   mouseY > windowHeight/1.85 && mouseY < windowHeight/1.7){
      fill (255, 0, 0);
    }
    text("Singleplayer (Easy)", (windowHeight * 1.5) / 30, windowHeight / 1.8);
    fill(255);

    if (mouseXOffset > (windowHeight*1.5)/31 &&  mouseXOffset < (windowHeight*1.5)/3   &&   mouseY > windowHeight/1.65 && mouseY < windowHeight/1.5){
      fill (255, 0, 0);
    }
    text("Singleplayer (Hard)", (windowHeight * 1.5) / 30, windowHeight / 1.6);
    fill(255)

    if (mouseXOffset > (windowHeight*1.5)/31 &&  mouseXOffset < (windowHeight*1.5)/3   &&   mouseY > windowHeight/1.45 && mouseY < windowHeight/1.3){
      fill (255, 0, 0);
    }
    text("Multiplayer", (windowHeight * 1.5) / 30, windowHeight / 1.4);
    textSize(windowHeight / 60);
    fill(255);

    textAlign(RIGHT, CENTER);
    text("(Not associated with the Cult of the Lamb)", (windowHeight * 1.5) * (29 / 30), windowHeight * (29 / 30));

  }
}








function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  middleScreenOffset = (windowWidth - windowHeight * 1.5) / 2;
}

function setCharAt(str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

function toLetterPos(pos) {
  return "abcdefghijklmnopqrstuvwxyz".charAt(pos);
}

function fromLetterPos(pos) {
  return "abcdefghijklmnopqrstuvwxyz".indexOf(pos);
}