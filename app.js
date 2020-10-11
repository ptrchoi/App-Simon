(function () {
  //START Closure/IIFE

  /*-------------------------------- CONSTANTS -----------------------------*/
  // AUDIO FILES (Parcel Bundler only loads paths from 'imports/requires/workers')
  let sfx1 = require('./sfx/click.mp3');
  let sfx2 = require('./sfx/error.wav');
  let sfx3 = require('./sfx/reward.mp3');
  let sfx4 = require('./sfx/simonSound1.mp3');
  let sfx5 = require('./sfx/simonSound2.mp3');
  let sfx6 = require('./sfx/simonSound3.mp3');
  let sfx7 = require('./sfx/simonSound4.mp3');

  const SFX_CLICK = new Audio(sfx1);
  const SFX_ERROR = new Audio(sfx2);
  const SFX_REWARD = new Audio(sfx3);
  const SFX_GREEN = new Audio(sfx4);
  const SFX_RED = new Audio(sfx5);
  const SFX_YELLOW = new Audio(sfx6);
  const SFX_BLUE = new Audio(sfx7);

  // IMAGE FILES (Parcel Bundler only loads paths from 'imports/requires/workers')
  const BTN_START_0 = require('./images/start.png');
  const BTN_START_1 = require('./images/start-pressed.png');
  const BTN_STRICT_0 = require('./images/strict.png');
  const BTN_STRICT_1 = require('./images/strict-pressed.png');
  const BTN_GREEN_0 = require('./images/greenB.png');
  const BTN_GREEN_1 = require('./images/greenB-pressed.png');
  const BTN_BLUE_0 = require('./images/blueB.png');
  const BTN_BLUE_1 = require('./images/blueB-pressed.png');
  const BTN_YELLOW_0 = require('./images/yellowB.png');
  const BTN_YELLOW_1 = require('./images/yellowB-pressed.png');
  const BTN_RED_0 = require('./images/redB.png');
  const BTN_RED_1 = require('./images/redB-pressed.png');

  // CONSTS
  const GREEN = 0;
  const RED = 1;
  const BLUE = 2;
  const YELLOW = 3;
  const BUTTONS = [GREEN, RED, BLUE, YELLOW];
  const GAME_SPEED_DEFAULT = 1100;
  const GAME_SPEED_SLOW = 850;
  const GAME_SPEED_MEDIUM = 650;
  const GAME_SPEED_FAST = 500;
  const TIMEOUT_BUTTON_RESET = 400;
  const TIMEOUT_INPUT_BUFFER = 300;
  const TIMEOUT_ERROR = 800;
  const TIMEOUT_SCORE_UPDATE = 500;
  const TIMEOUT_END_GAME = 3000;
  const STEPS_TO_WIN = 20;

  /*-------------------------------- VARIABLES -----------------------------*/
  let score = 0;
  let strictOn = false;
  let inputSequence = [];
  let outputSequence = [];
  let listening = false;
  let incorrectInput = false;
  let currentButton = GREEN;
  let i_output = 0;
  let i_input = 0;
  let gameSpeed = GAME_SPEED_DEFAULT;
  let buttonReset = false;

  /*-------------------------------- INITIALIZATION -----------------------------*/
  $('document').ready(preloadButtonImages());

  function preloadButtonImages() {
    document.getElementById(
      'green'
    ).style.backgroundImage = `url(${BTN_GREEN_1})`;
    document.getElementById('red').style.backgroundImage = `url(${BTN_RED_1})`;
    document.getElementById(
      'yellow'
    ).style.backgroundImage = `url(${BTN_YELLOW_1})`;
    document.getElementById(
      'blue'
    ).style.backgroundImage = `url(${BTN_BLUE_1})`;
    resetButtons();
  }
  function resetButtons() {
    document.getElementById(
      'green'
    ).style.backgroundImage = `url(${BTN_GREEN_0})`;
    document.getElementById('red').style.backgroundImage = `url(${BTN_RED_0})`;
    document.getElementById(
      'yellow'
    ).style.backgroundImage = `url(${BTN_YELLOW_0})`;
    document.getElementById(
      'blue'
    ).style.backgroundImage = `url(${BTN_BLUE_0})`;
  }

  /*-------------------------------- MAIN GAME LOOP -----------------------------*/
  function startGame() {
    score = 0;
    updateScore();
    inputSequence = [];
    outputSequence = [];
    listening = false;
    incorrectInput = false;
    currentButton = GREEN;
    i_output = 0;
    i_input = 0;
    gameSpeed = GAME_SPEED_DEFAULT;
    buttonReset = true;

    doOutput();
  }

  function doOutput() {
    if (incorrectInput) {
      SFX_ERROR.play();
      incorrectInput = false;
    } else {
      recordOutput(getOutput());
    }

    if (outputSequence.length > 0) {
      i_output = 0;
      playbackLoop();
    }
  }

  function doInput(input) {
    currentButton = input;
    playButton();
    recordInput(input);
    checkInput();
    i_input++;

    if (inputSequence.length === outputSequence.length) {
      setTimeout(updateGameState, TIMEOUT_INPUT_BUFFER);
    }
  }

  function endTurn() {
    i_input = 0;
    inputSequence = [];
    listening = false;
    doOutput();
  }

  function endGame() {
    if (incorrectInput) {
      SFX_ERROR.play();
      $('#score').html('! !');
    } else {
      SFX_REWARD.play();
      $('#score').html('&#9786');
    }
    setTimeout(startGame, TIMEOUT_END_GAME);
  }

  /*-------------------------------- CORE GAME FUNCTIONS -----------------------------*/
  function updateGameState() {
    if (strictOn && incorrectInput) {
      setTimeout(endGame, TIMEOUT_ERROR);
    } else if (incorrectInput) {
      setTimeout(endTurn, TIMEOUT_ERROR);
    } else {
      score++;
      setTimeout(updateScore, TIMEOUT_SCORE_UPDATE);
      if (score >= STEPS_TO_WIN) {
        setTimeout(endGame, TIMEOUT_ERROR);
      } else {
        updateGameSpeed();
        endTurn();
      }
    }
  }

  function updateGameSpeed() {
    if (score > 12) {
      gameSpeed = GAME_SPEED_FAST;
    } else if (score > 8) {
      gameSpeed = GAME_SPEED_MEDIUM;
    } else if (score > 4) {
      gameSpeed = GAME_SPEED_SLOW;
    }
  }

  function updateScore() {
    $('#score').html(score);
  }

  function checkInput() {
    if (inputSequence[i_input] !== outputSequence[i_input]) {
      incorrectInput = true;
    }
  }

  function recordInput(input) {
    inputSequence.push(input);
  }

  function getOutput() {
    let randOutput = Math.floor(Math.random() * BUTTONS.length);
    return randOutput;
  }

  function recordOutput(output) {
    outputSequence.push(output);
  }

  function playbackLoop() {
    setTimeout(function () {
      currentButton = outputSequence[i_output];
      playButton();
      i_output++;
      if (i_output < outputSequence.length) {
        playbackLoop();
      }
      if (i_output === outputSequence.length) {
        listening = true;
      }
    }, gameSpeed);
  }

  function playButton() {
    buttonReset = false;

    if (currentButton === GREEN) {
      SFX_GREEN.play();
      document.getElementById(
        'green'
      ).style.backgroundImage = `url(${BTN_GREEN_1})`;
    }
    if (currentButton === RED) {
      SFX_RED.play();
      document.getElementById(
        'red'
      ).style.backgroundImage = `url(${BTN_RED_1})`;
    }
    if (currentButton === YELLOW) {
      SFX_YELLOW.play();
      document.getElementById(
        'yellow'
      ).style.backgroundImage = `url(${BTN_YELLOW_1})`;
    }
    if (currentButton === BLUE) {
      SFX_BLUE.play();
      document.getElementById(
        'blue'
      ).style.backgroundImage = `url(${BTN_BLUE_1})`;
    }
    setTimeout(resetButton, TIMEOUT_BUTTON_RESET);
  }

  function resetButton() {
    if (currentButton === GREEN) {
      document.getElementById(
        'green'
      ).style.backgroundImage = `url(${BTN_GREEN_0})`;
    }
    if (currentButton === RED) {
      document.getElementById(
        'red'
      ).style.backgroundImage = `url(${BTN_RED_0})`;
    }
    if (currentButton === YELLOW) {
      document.getElementById(
        'yellow'
      ).style.backgroundImage = `url(${BTN_YELLOW_0})`;
    }
    if (currentButton === BLUE) {
      document.getElementById(
        'blue'
      ).style.backgroundImage = `url(${BTN_BLUE_0})`;
    }
    buttonReset = true;
  }

  /*-------------------------------- INPUT EVENTS -----------------------------*/
  $('#start').mousedown(function () {
    SFX_CLICK.play();
    document.getElementById(
      'start'
    ).style.backgroundImage = `url(${BTN_START_1})`;
    startGame();
  });
  $('#start').mouseup(function () {
    document.getElementById(
      'start'
    ).style.backgroundImage = `url(${BTN_START_0})`;
  });
  $('#strict').mousedown(function () {
    SFX_CLICK.play();
    document.getElementById(
      'strict'
    ).style.backgroundImage = `url(${BTN_STRICT_1})`;
  });
  $('#strict').mouseup(function () {
    if (strictOn) {
      document.getElementById(
        'strict'
      ).style.backgroundImage = `url(${BTN_STRICT_0})`;
      strictOn = false;
    } else {
      document.getElementById(
        'strict'
      ).style.backgroundImage = `url(${BTN_STRICT_1})`;
      strictOn = true;
    }
  });

  $('#green').click(function () {
    if (listening && buttonReset) {
      doInput(GREEN);
    }
  });
  $('#red').click(function () {
    if (listening && buttonReset) {
      doInput(RED);
    }
  });
  $('#yellow').click(function () {
    if (listening && buttonReset) {
      doInput(YELLOW);
    }
  });
  $('#blue').click(function () {
    if (listening && buttonReset) {
      doInput(BLUE);
    }
  });
})(); //END Closure/IIFE
