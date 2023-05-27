const startTimer = (seconds, minutes) => {
  const timer = setInterval(() => {
    seconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
    document.querySelector('.minutes').innerHTML = minutes > 9 ? `${minutes}:` : `0${minutes}:`;
    document.querySelector('.seconds').innerHTML = seconds > 9 ? seconds : `0${seconds}`;
  }, 1000);
  return timer;
}
const modalWindow = (isWin, seconds, move, sound) => {
  let audio;
  const modalWindow = document.createElement('div');
  modalWindow.classList.add('modal-window');
  const content = document.createElement('div');
  content.classList.add('modal-content');
  modalWindow.append(content);
  const closeBtn = document.createElement('button');
  closeBtn.classList.add('modal-close');
  closeBtn.innerHTML = '&times;';
  content.append(closeBtn);
  if (isWin) {
    if (sound) {
      audio = new Audio('assets/sound/win.wav');
      audio.play();
    }
    content.insertAdjacentHTML('beforeEnd', `<p>
    You win in ${move} ${move > 1 ? 'moves' : 'move'} and ${seconds} ${seconds > 1 ? 'seconds' : 'second'}! 
    </p>`);
  }
  if (!isWin) {
    if (sound) {
      audio = new Audio('assets/sound/lose.wav');
      audio.play();
    }
    content.insertAdjacentHTML('beforeEnd', `
    <p>F...</p>
    <img class="modal-img" src="assets/img/f.png" alt="F">`);
  }
  document.body.append(modalWindow);
  closeBtn.addEventListener('click', () => {
    if (sound) audio.pause();
    modalWindow.remove();
  });
}
const modalResult = (arr) => {
  const modalWindow = document.createElement('div');
  modalWindow.classList.add('modal-window');
  const content = document.createElement('div');
  content.classList.add('modal-content');
  modalWindow.append(content);
  const closeBtn = document.createElement('button');
  closeBtn.classList.add('modal-close');
  closeBtn.innerHTML = '&times;';
  if (arr.length > 0) {
    const table = document.createElement('table');
    table.classList.add('results');
    table.innerHTML = '<tr class="results__row"><th class="results__title">&nbsp;</th><th class="results__title">Seconds</th><th class="results__title">Clicks</th><th class="results__title">Level</th><th class="results__title">Mines</th></tr>';
    arr.forEach((el, i) => {
      let level = 'Easy';
      if (el[2] === 15) {
        level = 'Medium';
      }
      if (el[2] === 25) {
        level = 'Hard';
      }
      const tableRow = `<tr class="results__row"><td class="results__data">${i + 1}</td><td class="results__data">${el[0]}</td><td class="results__data">${el[1]}</td><td class="results__data">${level}</td><td class="results__data">${el[3]}</td></tr>`;
      table.insertAdjacentHTML('beforeend', tableRow);
    });
    content.append(table);
  } else {
    const p = document.createElement('p');
    p.innerHTML = 'The list of the last 10 winnings is displayed here. No results yet';
    content.append(p);
  }
  content.append(closeBtn);
  document.body.append(modalWindow);
  modalWindow.addEventListener('click', (e) => {
    if (e.target === modalWindow) {
      modalWindow.remove();
    }
  });
  closeBtn.addEventListener('click', () => {
    modalWindow.remove();
  });
}

let sizeBoard = 10;
let numMines = 20;
let isFirstClick = true;
let board = [];
let indexOfMines = [];
let boardFlat;
let timerInterval;
let isSoundOn = true;
let isLight = true;
let activeCells = {};
let activeFlags = [];
let lastResult = [];
let levelSelect = 'easy';

const colorCodingClasses = {
  0: 'zero-cell',
  1: 'one-cell',
  2: 'two-cell',
  3: 'three-cell',
  4: 'four-cell',
  5: 'five-cell',
  6: 'six-cell',
  7: 'seven-cell',
  8: 'eight-cell',
}

const drawBoard = (size) => {
  const boardWithButtons = document.createElement('div');
  boardWithButtons.classList.add('board');
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('button');
    cell.classList.add('cell');
    cell.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const counterFlag = document.querySelector('.counter-flag');
      const counterMines = document.querySelector('.counter-mines');
      if (!cell.innerHTML && !cell.classList.contains('active')) {
        counterFlag.textContent = +counterFlag.textContent + 1;
        counterMines.textContent = +counterMines.textContent - 1;
        cell.innerHTML = '<svg class="flag__img" viewBox="0 0 60 104"><path d="M4 67V7L55.1 32.5C58.8 34.3 58.8 39.6 55.1 41.4L4 67Z" fill="#FF6D60"/><path d="M4 102C2.9 102 2 101.1 2 100V4C2 2.9 2.9 2 4 2C5.1 2 6 2.9 6 4V100C6 101.1 5.1 102 4 102Z" fill="#FF6D60"/><path d="M4.00001 103.2C1.90001 103.2 0.200012 101.5 0.200012 99.4V3.99999C0.200012 2.19999 1.70001 0.799988 3.40001 0.799988H4.40001C6.20001 0.799988 7.60001 2.29999 7.60001 3.99999V99.5C7.80001 101.6 6.10001 103.2 4.00001 103.2ZM3.50001 3.19999C3.10001 3.19999 2.70001 3.49999 2.70001 3.99999V99.5C2.70001 100.2 3.30001 100.7 3.90001 100.7C4.50001 100.7 5.10001 100.1 5.10001 99.5V3.99999C5.10001 3.59999 4.80001 3.19999 4.30001 3.19999H3.50001Z" fill="#FF6D60"/></svg>';
        cell.classList.add('flag');
        activeFlags.push(i);
        if (isSoundOn) {
          new Audio('assets/sound/flag.wav').play();
        }

      } else if (cell.classList.contains('flag')) {
        counterFlag.textContent = +counterFlag.textContent - 1;
        counterMines.textContent = +counterMines.textContent + 1;
        cell.innerHTML = '';
        cell.classList.remove('flag');
        activeFlags = activeFlags.filter(el => el !== i);
      }
    });
    boardWithButtons.append(cell);
  }
  boardWithButtons.style.setProperty("--size", size);
  return boardWithButtons;
};

const drawHTMl = () => {
  const wrapper = document.createElement('div');
  wrapper.classList.add('container');
  const title = document.createElement('h1');
  title.classList.add('title');
  title.textContent = 'Minesweeper';
  const paragraph = document.createElement('p');
  paragraph.textContent = 'Right-click on the cell to set the flag\nFor a new game select the level, the number of minutes and click on the button';
  paragraph.classList.add('subtitle');
  const info = document.createElement('div');
  info.classList.add('info');
  const click = document.createElement('p');
  click.textContent = 0;
  click.classList.add('click');
  const timer = document.createElement('div');
  timer.classList.add('timer');
  timer.innerHTML = '<p class="minutes">00:</p> <p class="seconds">00</p>';
  const counterMines = document.createElement('p');
  counterMines.classList.add('counter-mines-flags');
  counterMines.innerHTML = `<p>Mines: </p> <p class="counter-mines">${numMines}</p> <p>Flags: </p> <p class="counter-flag">0</p>`;
  const options = document.createElement('div');
  options.classList.add('options');
  const chooseLevel = document.createElement('div');
  chooseLevel.classList.add('choose-level');
  const level = document.createElement('label');
  level.textContent = 'Choose a level:';
  level.classList.add('level');
  level.setAttribute('for', 'level');
  const selectLevel = document.createElement('select');
  selectLevel.classList.add('select-level');
  selectLevel.setAttribute('name', 'level');
  for (let i = 0; i < 3; i++) {
    const option = document.createElement('option');
    if (i === 0) {
      option.textContent = 'Easy';
      option.setAttribute('value', '10');
    }
    if (i === 1) {
      option.textContent = 'Medium';
      option.setAttribute('value', '15');
    }
    if (i === 2) {
      option.textContent = 'Hard';
      option.setAttribute('value', '25');
    }
    selectLevel.appendChild(option);
  }
  chooseLevel.append(level);
  chooseLevel.append(selectLevel);
  const chooseMines = document.createElement('div');
  chooseMines.classList.add('choose-mines');
  const mines = document.createElement('label');
  mines.textContent = 'Enter the count of mines:';
  mines.classList.add('mines');
  mines.setAttribute('for', 'mines');
  const inputMines = document.createElement('input');
  inputMines.classList.add('input-mines');
  inputMines.setAttribute('type', 'number');
  inputMines.setAttribute('name', 'mines');
  inputMines.setAttribute('min', '10');
  inputMines.setAttribute('max', '99');
  inputMines.setAttribute('value', '20');
  chooseMines.append(mines);
  chooseMines.append(inputMines);
  const buttonNewGame = document.createElement('button');
  buttonNewGame.textContent = 'New Game';
  buttonNewGame.classList.add('button-new-game');
  buttonNewGame.addEventListener('click', (e) => {
    if (+inputMines.value < 100 && +inputMines.value > 9) {
      sizeBoard = +selectLevel.options[selectLevel.selectedIndex].value;
      numMines = +inputMines.value;
      newGame(+selectLevel.options[selectLevel.selectedIndex].value, +inputMines.value);
      levelSelect = selectLevel.options[selectLevel.selectedIndex].text.toLowerCase();
      document.querySelector('.board').classList.add(`${levelSelect}`);
    } else {
      alert('Only numbers between 10 and 99 are allowed!');
    }
  });
  const buttonAudio = document.createElement('button');
  buttonAudio.innerHTML = '<svg class="button-audio__img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" fill="#6b8659"/></svg>';
  buttonAudio.classList.add('button-audio');
  buttonAudio.addEventListener('click', (e) => {
    if (isSoundOn) {
      isSoundOn = false;
      buttonAudio.innerHTML = '<svg class="button-audio__img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z" fill="#6b8659"/></svg>';
    } else {
      isSoundOn = true;
      buttonAudio.innerHTML = '<svg class="button-audio__img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" fill="#6b8659"/></svg>';
    }
  });
  const buttonTheme = document.createElement('button');
  buttonTheme.innerHTML = '<svg class="button-theme__img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z" fill="#6b8659"/></svg>';
  buttonTheme.classList.add('button-theme');
  buttonTheme.addEventListener('click', (e) => {
    if (isLight) {
      isLight = false;
      buttonTheme.innerHTML = '<svg class="button-theme__img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" fill="#6b8659"/></svg>';
      document.body.classList.add('dark');
    } else {
      isLight = true;
      buttonTheme.innerHTML = '<svg class="button-theme__img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z" fill="#6b8659"/></svg>';
      document.body.classList.remove('dark');
    }
  });
  const buttonList = document.createElement('button');
  buttonList.classList.add('button-list');
  buttonList.innerHTML = '<svg class="button-list__img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M24 56c0-13.3 10.7-24 24-24H80c13.3 0 24 10.7 24 24V176h16c13.3 0 24 10.7 24 24s-10.7 24-24 24H40c-13.3 0-24-10.7-24-24s10.7-24 24-24H56V80H48C34.7 80 24 69.3 24 56zM86.7 341.2c-6.5-7.4-18.3-6.9-24 1.2L51.5 357.9c-7.7 10.8-22.7 13.3-33.5 5.6s-13.3-22.7-5.6-33.5l11.1-15.6c23.7-33.2 72.3-35.6 99.2-4.9c21.3 24.4 20.8 60.9-1.1 84.7L86.8 432H120c13.3 0 24 10.7 24 24s-10.7 24-24 24H32c-9.5 0-18.2-5.6-22-14.4s-2.1-18.9 4.3-25.9l72-78c5.3-5.8 5.4-14.6 .3-20.5zM224 64H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32z" fill="#6b8659"/></svg>';
  buttonList.addEventListener('click', (e) => { modalResult(lastResult) });
  info.append(click);
  info.append(counterMines);
  info.append(timer);
  wrapper.append(title);
  wrapper.append(paragraph);
  wrapper.append(info);
  wrapper.append(drawBoard(sizeBoard));
  options.append(chooseLevel);
  options.append(chooseMines);
  wrapper.append(options);
  wrapper.append(buttonNewGame);
  wrapper.append(buttonAudio);
  wrapper.append(buttonTheme);
  wrapper.append(buttonList);
  document.body.append(wrapper);
};

const createMinesweeperBoard = (size, mines, coordinates) => {
  for (let i = 0; i < size; i++) {
    board[i] = new Array(size).fill(0);
  }
  const shuffledCoordinates = generateShuffledCoordinates(size, coordinates);
  for (let i = 0; i < mines; i++) {
    const [row, col] = shuffledCoordinates[i];
    board[row][col] = -1;
    updateNeighborCells(row, col);
  }

  boardFlat = board.flat();
  for (let i = 0; i < boardFlat.length; i++) {
    if (boardFlat[i] === -1) {
      indexOfMines.push(i);
    }
  }
  return board;

  function generateShuffledCoordinates(size, excludedCoordinates) {
    const coordinates = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!(row === excludedCoordinates[0] && col === excludedCoordinates[1])) {
          coordinates.push([row, col]);
        }
      }
    }

    for (let i = coordinates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [coordinates[i], coordinates[j]] = [coordinates[j], coordinates[i]];
    }

    return coordinates;
  }

  function updateNeighborCells(row, col) {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;

      if (isValidCoordinate(newRow, newCol) && board[newRow][newCol] !== -1) {
        board[newRow][newCol] += 1;
      }
    }
  }

  function isValidCoordinate(row, col) {
    return row >= 0 && row < size && col >= 0 && col < size;
  }
};

const gameOver = () => {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    cell.setAttribute('disabled', true);
    if (indexOfMines.includes(index)) {
      cell.innerHTML = '<svg class="gameover__img" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M571 589q-10-25-34-35t-49 0q-108 44-191 127t-127 191q-10 25 0 49t35 34q13 5 24 5 42 0 60-40 34-84 98.5-148.5t148.5-98.5q25-11 35-35t0-49zm942-356l46 46-244 243 68 68q19 19 19 45.5t-19 45.5l-64 64q89 161 89 343 0 143-55.5 273.5t-150 225-225 150-273.5 55.5-273.5-55.5-225-150-150-225-55.5-273.5 55.5-273.5 150-225 225-150 273.5-55.5q182 0 343 89l64-64q19-19 45.5-19t45.5 19l68 68zm8-56q-10 10-22 10-13 0-23-10l-91-90q-9-10-9-23t9-23q10-9 23-9t23 9l90 91q10 9 10 22.5t-10 22.5zm230 230q-11 9-23 9t-23-9l-90-91q-10-9-10-22.5t10-22.5q9-10 22.5-10t22.5 10l91 90q9 10 9 23t-9 23zm41-183q0 14-9 23t-23 9h-96q-14 0-23-9t-9-23 9-23 23-9h96q14 0 23 9t9 23zm-192-192v96q0 14-9 23t-23 9-23-9-9-23v-96q0-14 9-23t23-9 23 9 9 23zm151 55l-91 90q-10 10-22 10-13 0-23-10-10-9-10-22.5t10-22.5l90-91q10-9 23-9t23 9q9 10 9 23t-9 23z" fill="#FF6D60"/></svg>';
      cell.style.boxShadow = 'none';
    }
    clearInterval(timerInterval);
  });
  Object.keys(activeCells).forEach(key => delete activeCells[key]);
  activeFlags = [];
}

const checkWin = (size, mines) => {
  let countActive = 0;
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    if (cell.classList.contains('active') && !indexOfMines.includes(index)) {
      countActive++;
    }
  });
  if (countActive === size ** 2 - mines) {
    cells.forEach(cell => cell.setAttribute('disabled', true));
    return true;
  }
  return false;
}

const openCells = (indexArray, size) => {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell) => {
    for (let x = indexArray[0] - 1; x <= indexArray[0] + 1; x++) {
      for (let y = indexArray[1] - 1; y <= indexArray[1] + 1; y++) {
        if (x >= 0 && y >= 0 && x < size && y < size) {
          const cellIndex = x * size + y;
          if (cells[cellIndex].classList.contains('flag')) {
            const counterFlag = document.querySelector('.counter-flag');
            cells[cellIndex].innerHTML = '';
            cells[cellIndex].classList.remove('flag');
            counterFlag.textContent = +counterFlag.textContent - 1;
          }
          if (board[x][y] > 0) {
            cells[cellIndex].classList.add('active');
            activeCells[`${x}, ${y}`] = board[x][y];
            cells[cellIndex].textContent = board[x][y];
            // cells[cellIndex].style.color = colorCoding[board[x][y]];
            cells[cellIndex].classList.add(`${colorCodingClasses[board[x][y]]}`);
          }
          if (board[x][y] === 0 && !cells[cellIndex].classList.contains('active')) {
            cells[cellIndex].classList.add('active');
            activeCells[`${x}, ${y}`] = board[x][y];
            openCells([x, y], size);
          }
        }
      }
    }
  });
}

const ckickOnCell = (size, mines) => {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    cell.addEventListener('click', (e) => {
      if (isSoundOn) {
        new Audio('assets/sound/click.mp3').play();
      }
      if (cell.classList.contains('flag')) {
        return;
      }
      const counter = document.querySelector('.click');
      if (!cell.textContent) {
        counter.textContent = +counter.textContent + 1;
      }
      const cellIndex = [Math.floor(index / size), index % size];
      if (isFirstClick) {
        createMinesweeperBoard(size, mines, cellIndex);
        timerInterval = startTimer(0, 0);
        isFirstClick = false;
      }
      cell.classList.add('active');
      activeCells[`${cellIndex[0]}, ${cellIndex[1]}`] = board[cellIndex[0]][cellIndex[1]];
      if (board[cellIndex[0]][cellIndex[1]] === -1) {
        cell.classList.remove('active');
        cell.classList.add('gameover');
        modalWindow(false, 0, counter.textContent, isSoundOn);
        return gameOver();
      }
      if (board[cellIndex[0]][cellIndex[1]] === 0) {
        cell.textContent = '';
        openCells(cellIndex, size);
      }
      cell.textContent = board[cellIndex[0]][cellIndex[1]] === 0 ? '' : board[cellIndex[0]][cellIndex[1]];
      // cell.style.color = colorCoding[board[cellIndex[0]][cellIndex[1]]];
      cell.classList.add(`${colorCodingClasses[board[cellIndex[0]][cellIndex[1]]]}`);
      if (checkWin(size, mines)) {
        let second = +document.querySelector('.seconds').textContent;
        let minute = +document.querySelector('.minutes').textContent.split(':')[0];
        const seconds = minute * 60 + second;
        modalWindow(true, seconds, counter.textContent, isSoundOn);
        clearInterval(timerInterval);
        lastResult.push([seconds, counter.textContent, size, mines]);
        if (lastResult.length > 10) {
          lastResult.shift();
        }
        Object.keys(activeCells).forEach(key => delete activeCells[key]);
        activeFlags = [];
      }
    });
  });
}

const newGame = (size, mines) => {
  Object.keys(activeCells).forEach(key => delete activeCells[key]);
  activeFlags = [];
  isFirstClick = true;
  indexOfMines = [];
  document.querySelector('.board').remove();
  const click = document.querySelector('.click');
  click.textContent = 0;
  const info = document.querySelector('.info');
  const counterFlags = document.querySelector('.counter-flag');
  counterFlags.textContent = 0;
  const counterMines = document.querySelector('.counter-mines');
  counterMines.textContent = mines;
  info.after(drawBoard(size));
  const seconds = document.querySelector('.seconds');
  const minutes = document.querySelector('.minutes');
  minutes.textContent = '00:';
  seconds.textContent = '00';
  clearInterval(timerInterval);
  ckickOnCell(size, mines);
}

const drawSaveGame = (size) => {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    Object.keys(activeCells).forEach(key => {
      const arrKey = key.split(',').map(e => +e);
      const keyIndex = arrKey[0] * size + arrKey[1];
      if (keyIndex === index) {
        cell.classList.add('active');
        // cell.style.color = colorCoding[activeCells[key]];
        cell.classList.add(colorCodingClasses[activeCells[key]]);
        cell.textContent = activeCells[key];
        if (activeCells[key] === 0) {
          cell.textContent = '';
        }
      }
    });
    activeFlags.forEach((element) => {
      if (element === index) {
        cell.innerHTML = '<svg class="flag__img" viewBox="0 0 60 104" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 67V7L55.1 32.5C58.8 34.3 58.8 39.6 55.1 41.4L4 67Z" fill="#FF6D60"/><path d="M4 102C2.9 102 2 101.1 2 100V4C2 2.9 2.9 2 4 2C5.1 2 6 2.9 6 4V100C6 101.1 5.1 102 4 102Z" fill="#FF6D60"/><path d="M4.00001 103.2C1.90001 103.2 0.200012 101.5 0.200012 99.4V3.99999C0.200012 2.19999 1.70001 0.799988 3.40001 0.799988H4.40001C6.20001 0.799988 7.60001 2.29999 7.60001 3.99999V99.5C7.80001 101.6 6.10001 103.2 4.00001 103.2ZM3.50001 3.19999C3.10001 3.19999 2.70001 3.49999 2.70001 3.99999V99.5C2.70001 100.2 3.30001 100.7 3.90001 100.7C4.50001 100.7 5.10001 100.1 5.10001 99.5V3.99999C5.10001 3.59999 4.80001 3.19999 4.30001 3.19999H3.50001Z" fill="#FF6D60"/></svg>';
        cell.classList.add('flag');
      }
    });
  });
}

const setLocalStorage = () => {
  localStorage.setItem('board', JSON.stringify(board));
  localStorage.setItem('indexOfMines', JSON.stringify(indexOfMines));
  localStorage.setItem('activeCells', JSON.stringify(activeCells));
  localStorage.setItem('activeFlags', JSON.stringify(activeFlags));
  localStorage.setItem('sizeBoard', sizeBoard);
  localStorage.setItem('numMines', numMines);
  localStorage.setItem('numOfClicks', +document.querySelector('.click').textContent);
  localStorage.setItem('seconds', +document.querySelector('.seconds').textContent);
  localStorage.setItem('minutes', +document.querySelector('.minutes').textContent.split(':')[0]);
  localStorage.setItem('lastResult', JSON.stringify(lastResult));
  localStorage.setItem('levelSelect', JSON.stringify(levelSelect));
}
window.addEventListener('beforeunload', setLocalStorage);

const getLocalStorage = () => {
  drawHTMl();
  if (JSON.parse(localStorage.getItem('lastResult')) !== null) {
    lastResult = JSON.parse(localStorage.getItem('lastResult'));
  }
  if (localStorage.getItem('activeCells') && Object.keys(JSON.parse(localStorage.getItem('activeCells'))).length !== 0) {
    activeFlags = JSON.parse(localStorage.getItem('activeFlags'));
    activeCells = JSON.parse(localStorage.getItem('activeCells'));
    board = JSON.parse(localStorage.getItem('board'));
    indexOfMines = JSON.parse(localStorage.getItem('indexOfMines'));
    sizeBoard = localStorage.getItem('sizeBoard');
    levelSelect = JSON.parse(localStorage.getItem('levelSelect'));
    let seconds = localStorage.getItem('seconds');
    let minutes = localStorage.getItem('minutes');
    numMines = localStorage.getItem('numMines');
    document.querySelector('.seconds').textContent = seconds > 9 ? seconds : '0' + seconds;
    document.querySelector('.minutes').textContent = minutes > 9 ? `${minutes}:` : `0${minutes}:`;
    document.querySelector('.click').textContent = localStorage.getItem('numOfClicks');
    document.querySelector('.counter-flag').textContent = activeFlags.length;
    document.querySelector('.counter-mines').textContent = numMines - activeFlags.length;
    isFirstClick = false;
    timerInterval = startTimer(seconds, minutes);
    document.querySelector('.board').remove();
    document.querySelector('.info').after(drawBoard(sizeBoard));
    document.querySelector('.board').classList.add(levelSelect);
    drawSaveGame(sizeBoard);
  }
  ckickOnCell(sizeBoard, numMines);
}
window.addEventListener('load', getLocalStorage);