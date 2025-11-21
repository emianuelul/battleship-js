import { Player } from './modules/player';
import { Ship } from './modules/ship';
import { DomStuff } from './modules/domStuff';
import { CPU } from './modules/cpu';

import './styles/cssReset.css';
import './styles/mainPage.css';

const Processor = (() => {
  const body = document.querySelector('body');
  const app = DomStuff.createDiv('.mainContainer');

  body.appendChild(app);

  const board1 = DomStuff.createDiv('.gameBoard');
  const boardWithCoords1 = DomStuff.createBoardWithCoords(board1);
  board1.setAttribute('player', 1);

  const board2 = DomStuff.createDiv('.gameBoard');
  const boardWithCoords2 = DomStuff.createBoardWithCoords(board2);
  board2.setAttribute('player', 2);

  let turn = 1;
  let cpuIsPlaying = false;

  let player1;
  let player1_ships = {};

  let player2;
  let player2_ships = {};

  let cpu;

  let setupPhase = true;

  let isDragging = false;
  let draggedCells = [];
  let dragStartPos;
  let draggingShipId;

  function getShipStartCoords(draggedParts) {
    let rotation;
    let startI;
    let startJ;

    let posI = [];
    let posJ = [];

    draggedParts.forEach((part) => {
      const coordStr = part.getAttribute('coord');
      const [i, j] = coordStr.split('-').map(Number);
      posI.push(i);
      posJ.push(j);
    });

    startI = Math.min(...posI);
    startJ = Math.min(...posJ);

    if (posI.length > 1) {
      if (Math.abs(posI[0] - posI[1]) >= 1) {
        rotation = 'y';
      } else if (Math.abs(posJ[0] - posJ[1]) >= 1) {
        rotation = 'x';
      }
    } else {
      rotation = 'x';
    }

    return [startI, startJ, rotation];
  }

  function findShipParts(pixel) {
    const shipId = pixel.getAttribute('data-ship');
    const shipCells = Array.from(board1.querySelectorAll(`.ship[data-ship="${shipId}"]`));
    return shipCells;
  }

  board1.addEventListener('mousedown', (e) => {
    if (!setupPhase) return;
    if (e.target.classList.contains('ship')) {
      isDragging = true;
      draggedCells = findShipParts(e.target);
      dragStartPos = getShipStartCoords(draggedCells);
      draggingShipId = e.target.getAttribute('data-ship');

      draggedCells.forEach((cell) => cell.classList.add('dragging'));
    }
  });

  function hasAdjacentShips(coords, draggingShipId) {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [ni, nj] of coords) {
      for (const [di, dj] of directions) {
        const checkI = ni + di;
        const checkJ = nj + dj;

        if (checkI < 0 || checkI >= 10 || checkJ < 0 || checkJ >= 10) continue;

        if (coords.some(([ci, cj]) => ci === checkI && cj === checkJ)) continue;

        const cellContent = player1.getBoard().getBoard()[checkI][checkJ];
        if (
          cellContent !== 0 &&
          cellContent.getName &&
          cellContent.getName() !== draggingShipId
        ) {
          return true;
        }
      }
    }

    return false;
  }

  board1.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const rect = board1.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cellSize = board1.offsetWidth / 10;
    const hoverI = Math.floor(mouseY / cellSize);
    const hoverJ = Math.floor(mouseX / cellSize);

    board1
      .querySelectorAll('.preview, .invalid')
      .forEach((cell) => cell.classList.remove('preview', 'invalid'));

    if (hoverI >= 0 && hoverI < 10 && hoverJ >= 0 && hoverJ < 10) {
      const [startI, startJ, rotation] = dragStartPos;
      const shipLen = draggedCells.length;
      let valid = true;
      let cellsToHighlight = [];
      let targetCoords = [];

      for (let k = 0; k < shipLen; k++) {
        let ni = rotation === 'y' ? hoverI + k : hoverI;
        let nj = rotation === 'x' ? hoverJ + k : hoverJ;

        if (ni < 0 || ni >= 10 || nj < 0 || nj >= 10) {
          valid = false;
        } else {
          const cellContent = player1.getBoard().getBoard()[ni][nj];
          if (
            cellContent !== 0 &&
            cellContent.getName() &&
            cellContent.getName() !== draggingShipId
          ) {
            valid = false;
          }
          targetCoords.push([ni, nj]);
        }

        const cell = board1.querySelector(`[coord="${ni}-${nj}"]`);
        if (cell) cellsToHighlight.push(cell);
      }

      if (valid && hasAdjacentShips(targetCoords, draggingShipId)) {
        valid = false;
      }

      cellsToHighlight.forEach((cell) => {
        cell.classList.add('preview');
        if (!valid) cell.classList.add('invalid');
      });
    }
  });

  board1.addEventListener('mouseup', (e) => {
    if (!isDragging) return;

    const rect = board1.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cellSize = board1.offsetWidth / 10;
    const dropI = Math.floor(mouseY / cellSize);
    const dropJ = Math.floor(mouseX / cellSize);

    const [startI, startJ, rotation] = dragStartPos;
    const shipLen = draggedCells.length;
    let canDrop = true;
    let newCoords = [];

    for (let k = 0; k < shipLen; k++) {
      let ni = rotation === 'y' ? dropI + k : dropI;
      let nj = rotation === 'x' ? dropJ + k : dropJ;

      if (ni < 0 || ni >= 10 || nj < 0 || nj >= 10) {
        canDrop = false;
        break;
      }

      const cellContent = player1.getBoard().getBoard()[ni][nj];
      if (
        cellContent !== 0 &&
        cellContent.getName() &&
        cellContent.getName() !== draggingShipId
      ) {
        canDrop = false;
        break;
      }
      newCoords.push([ni, nj]);
    }

    if (canDrop && hasAdjacentShips(newCoords, draggingShipId)) {
      canDrop = false;
    }

    board1
      .querySelectorAll('.preview, .invalid, .dragging')
      .forEach((cell) => cell.classList.remove('preview', 'invalid', 'dragging'));

    if (canDrop) {
      const shipObject = player1_ships[draggingShipId];

      draggedCells.forEach((cell) => {
        const [oi, oj] = cell.getAttribute('coord').split('-').map(Number);
        player1.getBoard().getBoard()[oi][oj] = 0;
        cell.classList.remove('ship');
        cell.removeAttribute('data-ship');
      });

      newCoords.forEach(([ni, nj]) => {
        player1.getBoard().getBoard()[ni][nj] = shipObject;
        const cell = board1.querySelector(`[coord="${ni}-${nj}"]`);
        if (cell) {
          cell.classList.add('ship');
          cell.setAttribute('data-ship', draggingShipId);
        }
      });
    }

    isDragging = false;
    draggedCells = [];
    draggingShipId = undefined;
  });

  function playUntilMiss_cpu() {
    if (turn !== 2) {
      cpuIsPlaying = false;
      return;
    }

    cpuIsPlaying = true;
    const hit = cpu.play_move();

    if (hit === true) {
      setTimeout(() => {
        playUntilMiss_cpu();
      }, 1500);
    } else {
      cpuIsPlaying = false;
      turn = 1;
      setTimeout(() => {
        updateBoardInteract();
      }, 750);
    }
  }

  function updateBoardInteract() {
    if (turn === 1) {
      enableBoard(board2);
      disableBoard(board1);
      document.querySelector('.playerSection[player="1"]').classList.add('active');
      document.querySelector('.playerSection[player="2"]').classList.remove('active');
    } else if (turn === 2) {
      enableBoard(board1);
      disableBoard(board2);
      document.querySelector('.playerSection[player="2"]').classList.add('active');
      document.querySelector('.playerSection[player="1"]').classList.remove('active');

      if (player2.getType() === 'cpu') {
        disableBoard(board1);
        board1.classList.add('cpu');
        setTimeout(() => {
          playUntilMiss_cpu();
        }, 1500);
      }
    }
  }

  function enableBoard(board) {
    board.classList.remove('disabled');
  }

  function disableBoard(board) {
    board.classList.add('disabled');
    if (board.classList.contains('cpu')) {
      board.classList.remove('cpu');
    }
  }

  function renderBoardPixelsForPlayer(player, board) {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        let pixel = DomStuff.createDiv('.boardPixel');
        pixel.setAttribute('coord', `${i}-${j}`);

        const cellContent = player.getBoard().getBoard()[i][j];
        if (cellContent !== 0) {
          if (player === player1) {
            pixel.classList.add('ship');
            pixel.setAttribute('shipType', cellContent.getName());
            pixel.setAttribute('data-ship', cellContent.getName());
          }
        }

        pixel.addEventListener('mouseover', () => {
          if (setupPhase) return;
          pixel.classList.add('hover');
        });

        pixel.addEventListener('mouseleave', () => {
          if (setupPhase) return;
          pixel.classList.remove('hover');
        });

        function makeAttackHandler(pixel, player, i, j) {
          return function handleClick() {
            if (setupPhase) {
              return;
            }

            const isHit = player.getBoard().receiveAttack(i, j);

            if (isHit) {
              pixel.classList.add('hit');
              if (player.getBoard().checkSunk()) {
                alert(`Player ${turn} won`);
                return;
              }
            } else {
              pixel.classList.add('miss');
              if (!cpuIsPlaying) {
                turn = turn === 1 ? 2 : 1;
                updateBoardInteract();
              }
            }

            pixel.removeEventListener('click', handleClick);
          };
        }

        pixel.addEventListener('click', makeAttackHandler(pixel, player, i, j));

        board.appendChild(pixel);
      }
    }
  }

  function placeShipOnPlayerBoard(player, ship, x, y, rotation) {
    return player.getBoard().placeShip(x, y, rotation, ship);
  }

  function generateClassicShips(obj) {
    obj['carrier'] = new Ship(5, 'carrier');
    obj['battleship'] = new Ship(4, 'battleship');
    obj['cruiser'] = new Ship(3, 'cruiser');
    obj['sub'] = new Ship(3, 'sub');
    obj['destroyer'] = new Ship(2, 'destroyer');
  }

  const boards = DomStuff.createDiv('.boards');
  function generateCoords(ship, board) {
    let i = Math.floor(Math.min(Math.random(), 0.99) * 10);
    let j = Math.floor(Math.min(Math.random(), 0.99) * 10);
    let rotation = Math.random();

    if (rotation <= 0.5) {
      rotation = 'x';
    } else {
      rotation = 'y';
    }

    let coords = [i, j, rotation];

    while (!board.canPlace(i, j, rotation, ship.getLength())) {
      i = Math.floor(Math.min(Math.random(), 0.99) * 10);
      j = Math.floor(Math.min(Math.random(), 0.99) * 10);
      rotation = Math.random();

      if (rotation <= 0.5) {
        rotation = 'x';
      } else {
        rotation = 'y';
      }
    }
    return coords;
  }

  function placeOnRandomPos(player_ships, player) {
    for (const ship in player_ships) {
      let coords = generateCoords(player_ships[ship], player.getBoard());

      let placed = false;
      while (!placed) {
        coords = generateCoords(player_ships[ship], player.getBoard());
        placed = placeShipOnPlayerBoard(
          player,
          player_ships[ship],
          coords[0],
          coords[1],
          coords[2]
        );
      }
    }
  }

  function cleanBoard(player, board) {
    player.getBoard().resetBoard();
    board.innerHTML = '';
  }

  function startGame() {
    prepGameScreen();

    player1 = new Player('player', 'p1');
    generateClassicShips(player1_ships);
    placeOnRandomPos(player1_ships, player1);

    player2 = new Player('cpu', 'p2');
    cpu = new CPU(player1.getBoard());
    generateClassicShips(player2_ships);
    placeOnRandomPos(player2_ships, player2);

    // updateBoardInteract();

    renderBoardPixelsForPlayer(player1, board1);
    renderBoardPixelsForPlayer(player2, board2);
  }

  function updateSetupPhaseButtons(isSetup) {
    const buttons = Array.from(document.querySelectorAll('.Btn'));
    console.log(buttons);
    buttons.forEach((btn) => {
      if (isSetup) {
        btn.classList.remove('disabled');
      } else {
        btn.classList.add('disabled');
      }
    });

    const p = document.querySelector('.movingInfo > p');
    if (isSetup) {
      p.classList.remove('disabled');
    } else {
      p.classList.add('disabled');
    }
  }

  function prepGameScreen() {
    const currentPlayerDiv = DomStuff.createDiv('.playerArrows');

    const player1Sec = DomStuff.createDiv('.playerSection');

    const div = DomStuff.createDiv('.movingInfo');
    const randomizeBtn = DomStuff.createButton('Randomize Positions', '.Btn');
    const moveHint = DomStuff.createP('Move ships by dragging them around.');

    div.append(randomizeBtn, moveHint);

    player1Sec.append(DomStuff.createP('Player 1'));
    player1Sec.setAttribute('player', 1);

    randomizeBtn.addEventListener('click', () => {
      if (setupPhase) {
        cleanBoard(player1, board1);
        placeOnRandomPos(player1_ships, player1);
        renderBoardPixelsForPlayer(player1, board1);
      }
    });

    const startBtnDiv = DomStuff.createDiv('.startBtnDiv');
    const startBtn = DomStuff.createButton('Start Game', '.Btn');
    startBtn.addEventListener('click', () => {
      if (setupPhase) {
        setupPhase = false;
        updateSetupPhaseButtons(setupPhase);

        updateBoardInteract();
      }
    });

    startBtnDiv.append(startBtn);

    const player2Sec = DomStuff.createDiv('.playerSection');
    player2Sec.appendChild(DomStuff.createP('Player 2'));
    player2Sec.setAttribute('player', 2);

    currentPlayerDiv.append(player1Sec, div, player2Sec);

    boards.appendChild(boardWithCoords1);
    boards.append(startBtnDiv);
    boards.appendChild(boardWithCoords2);
    document.querySelector('.middle').appendChild(boards);
    document.querySelector('.middle').appendChild(currentPlayerDiv);
  }

  function initPage() {
    const header = DomStuff.createHeader();
    const middle = DomStuff.createDiv('.middle');
    const footer = DomStuff.createDiv('.footer');

    app.appendChild(header);
    app.appendChild(middle);
    app.appendChild(footer);
  }

  initPage();
  startGame();

  document.querySelector('.headerBtn').addEventListener('click', () => {
    cleanBoard(player1, board1);
    placeOnRandomPos(player1_ships, player1);
    renderBoardPixelsForPlayer(player1, board1);

    cleanBoard(player2, board2);
    placeOnRandomPos(player2_ships, player2);
    renderBoardPixelsForPlayer(player2, board2);

    board1.classList.remove('disabled');
    board1.classList.remove('cpu');
    board2.classList.remove('disabled');

    if (document.querySelector(document.querySelector('.playerSection.active'))) {
      document.querySelector('.playerSection.active').classList.remove('active');
    }

    setupPhase = true;
    updateSetupPhaseButtons(setupPhase);
    turn = 1;
  });
})();
