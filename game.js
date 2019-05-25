/*
 *
 * 15 Puzzle
 *
 * author:     Nikita Lisnyak
 * email:      mackuta@gmail.com
 * linkedin:   https://www.linkedin.com/in/uber1337
 * github:     https://github.com/so1337
 *
 *
 */

// score = moves. Lesser -> better
let score = 0;
let difficulty;

// toggle visibility of win block
function toggleWin(show) {
  if (show) {
    document.getElementsByClassName('win-block')[0].classList.remove('hidden');
  } else {
    document.getElementsByClassName('win-block')[0].classList.add('hidden');
  }
}

// get X Y coordinates based on index
function getXY(number) {
  return `x${((number - 1) % 4) + 1}y${Math.ceil((number) / 4)}`;
}

// check if player won
function checkWin() {
  const cells = document.getElementsByClassName('block');
  // if all cells are sorted by their index - then player has won (and score is not 0)
  const win = Array.from(cells).every((cell, index) => cell.classList.contains(getXY(index + 1))) && score;

  // If player won...
  if (win) {
    // check if player was playing casual game or on preset difficulty
    if (difficulty) {
      // get scores from local storage, if not present - use empty object
      let scores = localStorage.getItem('scores') || {};
      if (Object.entries(scores).length) {
        scores = JSON.parse(scores);
      }
      // if there's already some people in this Top list
      if (scores[difficulty]) {
        // check if player has beat anyones record (lesser -> better)
        const lesserScore = scores[difficulty].find(item => item.score >= score);
        // if list is already full and all Top players have better score
        if (!lesserScore && scores[difficulty].length === 3) {
          document.getElementById('win-text').innerHTML = 'Winner 🍾! <br /> Unfortunatly - players in Top list scored better';
          // don't allow to claim score by hiding claim block
          document.getElementsByClassName('claim-block')[0].classList.add('hidden');
        } else {
          document.getElementById('win-text').innerHTML = 'Winner 🍾! <br /> Claim your score to appear in Top list';
          // allow player to claim his score
          document.getElementsByClassName('claim-block')[0].classList.remove('hidden');
        }
      } else {
        // if player is first one who beat the game
        document.getElementById('win-text').innerHTML = '1st Winner 🍾! <br /> Claim your score to appear in Top list';
        document.getElementsByClassName('claim-block')[0].classList.remove('hidden');
      }
    } else {
      // if player won game in casual game
      document.getElementById('win-text').innerHTML = 'Winner 🍾! <br /> Try new game on any difficulty to get listed in Top list';
      document.getElementsByClassName('claim-block')[0].classList.add('hidden');
    }
    toggleWin('show');
  } else {
    toggleWin(false);
  }
}

// get empty cell position
function getEmptyCell() {
  for (let x = 1; x < 5; x += 1) {
    for (let y = 1; y < 5; y += 1) {
      if (!document.getElementsByClassName(`x${x}y${y}`).length) {
        return { x, y };
      }
    }
  }
  return false;
}

// set current score and update it on UI
function setScore(newScore) {
  document.getElementById('score').innerHTML = newScore;
  score = newScore;
}

// filter class string searching for formatted position class e.g. x1y1
function findPositionClass(classes) {
  return classes.find(name => /(x[1-4]y[1-4])/.test(name));
}


// toggle disabling all buttons on page
function toggleButtons(show) {
  const inputs = document.getElementsByTagName('input');
  // "for of"  is too heavyweight so I'll use array iteration
  Array.from(inputs).forEach((element) => {
    element.disabled = !show;
  });
  document.getElementById('fast-shuffle').disabled = !show;
}

// reset game, difficulty and score
function reset() {
  for (let i = 1; i <= 15; i += 1) {
    const block = document.getElementsByClassName(`block-${i}`)[0];
    const position = findPositionClass(block.className.split(' '));
    block.classList.remove(position);
    block.classList.add(getXY(i));
  }
  document.getElementsByClassName('win-block')[0].classList.add('hidden');
  difficulty = null;
  setScore(0);
}


// creating blocks and filling board with them
function createBlocks() {
  for (let i = 1; i <= 15; i += 1) {
    const block = document.createElement('div');
    block.classList.add('block', `block-${i}`, getXY(i));
    block.innerHTML = i;
    document.getElementById('game-block').appendChild(block);
  }
}

// handling click on block
function cellClick(event) {
  // getting position of empty cell
  const emptyCell = getEmptyCell();
  const { target } = event;
  const targetClasses = target.className.split(' ');
  const position = targetClasses.find(name => /(x[1-4]y[1-4])/.test(name));
  // if block was not empty cell himself (empty cell don't have positioning class)
  if (position) {
    // position is string (e.g. x1y1) so we take x and y values from it and convert to number
    const x = Number(position[1]);
    const y = Number(position[3]);

    // check if clicked block is nearby empty cell
    if (
      ((x - 1 === emptyCell.x || x + 1 === emptyCell.x) && y === emptyCell.y)
            || ((y - 1 === emptyCell.y || y + 1 === emptyCell.y) && x === emptyCell.x)
    ) {
      // increase score and move clicked block to empty cell, check if game was won
      setScore(score + 1);
      target.classList.remove(position);
      target.classList.add(`x${emptyCell.x}y${emptyCell.y}`);
      checkWin();
    }
  }
}


// moving piece according to pressed arrow key
// if it's part of simulation - pass "auto" argument so score won't be affected
function keyPress(type, auto) {
  const emptyCell = getEmptyCell();
  let from;
  let to;
  // calculating block positioning class of block that need to be moved according to empty cell
  switch (type) {
    case 'up':
      from = `x${emptyCell.x}y${emptyCell.y + 1}`;
      to = `x${emptyCell.x}y${emptyCell.y}`;
      break;
    case 'down':
      from = `x${emptyCell.x}y${emptyCell.y - 1}`;
      to = `x${emptyCell.x}y${emptyCell.y}`;
      break;
    case 'left':
      from = `x${emptyCell.x + 1}y${emptyCell.y}`;
      to = `x${emptyCell.x}y${emptyCell.y}`;
      break;
    case 'right':
      from = `x${emptyCell.x - 1}y${emptyCell.y}`;
      to = `x${emptyCell.x}y${emptyCell.y}`;
      break;
    default:
      console.log('only arrow keys are allowed for cell movement');
  }
  // if this block present - move to empty cell
  if (document.getElementsByClassName(from).length) {
    const movingBlock = document.getElementsByClassName(from)[0];
    movingBlock.classList.remove(from);
    movingBlock.classList.add(to);
    // if movement is not part of shuffling - increase score and check for win
    if (!auto) {
      setScore(score + 1);
      checkWin();
    }
  }
}

// getting random int
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }


// handling keyboard event
function keyboardEvent(e) {
  switch (e.keyCode) {
    case 38:
      keyPress('up');
      break;
    case 40:
      keyPress('down');
      break;
    case 37:
      keyPress('left');
      break;
    case 39:
      keyPress('right');
      break;
    default:
      console.log('only arrow keys are allowed for cell movement');
  }
}

// Shuffling and clearing score
function newGame(steps) {
  reset();
  // if "Fast shuffle" is checked - then make shuffle without "human-like" delays
  const slow = document.getElementById('fast-shuffle').checked ? 0 : 1;
  // disable buttons so user can't interact with them during shuffling
  toggleButtons(false);
  // shuffling by simulating keypress
  // algorithm could be improved by detecting "backward" moves
  // but on >5 amount of steps current implementation works ok
  // and it's only noticeable when fast shuffle is disabled
  for (let step = 1; step <= steps; step += 1) {
    setTimeout(() => {
      switch (getRandomInt(1, 4)) {
        case 1:
          keyPress('up', 'not-increase-score');
          break;
        case 2:
          keyPress('down', 'not-increase-score');
          break;
        case 3:
          keyPress('left', 'not-increase-score');
          break;
        case 4:
          keyPress('right', 'not-increase-score');
          break;
        default:
          console.log('unexpected input');
      }
      if (step === steps) {
        toggleButtons('enable');
      }
    }, 100 * step * slow);
  }
}

// draw top scores list
function drawScores() {
  const difficulties = ['test', 'easy', 'medium', 'hard'];
  let scores = localStorage.getItem('scores') || {};
  if (Object.entries(scores).length) {
    scores = JSON.parse(scores);
  }
  // fill each difficulty list with list items according ot local storage
  difficulties.forEach((name) => {
    const list = document.getElementById(`${name}-list`);
    list.innerHTML = '';
    if (scores[name]) {
      scores[name].sort((a, b) => a.score - b.score).forEach((item) => {
        const listElement = document.createElement('li');
        listElement.innerHTML = `${item.nickname}: ${item.score} `;
        list.appendChild(listElement);
      });
    } else {
      // if list is empty - they display message about it
      list.innerHTML = 'No top scores, yet';
    }
  });
}

// set custom amounts of shuffle steps and shuffle
function customGame() {
  const steps = document.getElementById('steps-amount').value;
  newGame(Number(steps));
}

// claim score and get nickname and score saved in top scores list
function claimScore() {
  let scores = localStorage.getItem('scores') || {};
  if (Object.entries(scores).length) {
    scores = JSON.parse(scores);
  }
  // if nickname input is empty - replace with 'no-name'
  const nickname = document.getElementById('score-nickname').value || 'no-name';
  if (!scores[difficulty]) {
    scores[difficulty] = [{ nickname, score }];
  } else if (scores[difficulty].length !== 3) {
    scores[difficulty].push({ nickname, score });
  } else {
    const lesserScore = scores[difficulty].find(item => item.score >= score);
    if (lesserScore) {
      // only 3 records can be in top list at same time
      const lesserIndex = scores[difficulty].indexOf(lesserScore);
      scores[difficulty].splice(lesserIndex, 0, { nickname, score }).slice(0, 3);
      scores[difficulty] = scores[difficulty].slice(0, 3);
    }
  }
  // update scores, re-draw them and reset game board
  localStorage.setItem('scores', JSON.stringify(scores));
  drawScores();
  reset();
}


// clear scores from local storage, redraw them and check for win
function clearScores() {
  localStorage.removeItem('scores');
  checkWin();
  drawScores();
}

// initialize app
function init() {
  // draw blocks
  createBlocks();
  // draw scores
  drawScores();
  // attach listeners
  window.addEventListener('keydown', keyboardEvent, false);
  document.getElementById('game-block').onclick = cellClick;
  document.getElementById('difficulty-test').onclick = () => {
    newGame(5);
    difficulty = 'test';
  };
  document.getElementById('difficulty-easy').onclick = () => {
    newGame(100);
    difficulty = 'easy';
  };
  document.getElementById('difficulty-medium').onclick = () => {
    newGame(300);
    difficulty = 'medium';
  };
  document.getElementById('difficulty-hard').onclick = () => {
    newGame(500);
    difficulty = 'hard';
  };
  document.getElementById('difficulty-custom').onclick = customGame;
  document.getElementById('reset').onclick = reset;
  document.getElementById('clear-score').onclick = () => {
    setScore(0);
    difficulty = null;
    toggleWin(false);
  };
  document.getElementById('clear-all-scores').onclick = clearScores;
  document.getElementById('claim-score').onclick = claimScore;
}

init();
