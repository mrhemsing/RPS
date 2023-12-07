const emojiNames = {
  '🪨': 'rock',
  '📄': 'paper',
  '✂️': 'scissors',
};

const isSmallScreen = () => {
  const SMALL_SCREEN_BREAKPOINT = 1199;
  return window.innerWidth < SMALL_SCREEN_BREAKPOINT;
};
const hideAll = () => {
  document
    .querySelectorAll('canvas, #win-screen, #round-screen, #intro-screen')
    .forEach((node) => (node.style.display = 'none'));
};
const showStartButton = (visibility) => {
  document.querySelector('#startButton').style.display = visibility
    ? 'inline-block'
    : 'none';
};
const showCanvas = () => {
  hideAll();
  document.querySelector('canvas').style.display = 'block';
};
const showWinScreen = () => {
  hideAll();
  document.querySelector('#win-screen').style.display = 'flex';
};
const showRoundScreen = () => {
  hideAll();
  document.querySelector('#round-screen').style.display = 'flex';
};
const showIntroScreen = () => {
  hideAll();
  document.querySelector('#intro-screen').style.display = 'flex';
};
const displayWinner = (p) => {
  showWinScreen(true);
  document
    .querySelectorAll('#win-screen img')
    .forEach((img) => (img.style.display = 'none'));

  const winnerName = emojiNames[p];
  document.querySelector(`#win-${winnerName}`).style.display = 'block';
};


const SMALL_SCREEN_CANVAS_HEIGHT = 550;
let c = a.getContext('2d'), // no more $type conditional
  w = window,
  M = Math,
  r = M.random,
  ruleSets = [
    {
      id: 1,
      name: '🪨📄✂️',
      rules: '✂️ cuts 📄 covers 🪨 crushes ✂️',
    },
  ],
  FPS = 30, //50fps
  SIZE = 0,
  SPEED = isSmallScreen() ? 1.5 : 2;
(TOUCH_DISTANCE = 20),
  (gameOn = false),
  (targetMap = {}),
  (center = {}),
  (emojis = []),
  (killFeed = []),
  (pieces = new Array(60).fill().map(() => ({ o: '', x: 0, y: 0 }))),
  (myInterval = null),
  (gameRestartTimeout = null),
  (gameStartTimeout = null),
  (selected = ruleSets[0]);

const startButton = document.querySelector('#startButton');
startButton.addEventListener('click', () => {
  showWinScreen(false);
  showRoundScreen(false);
  //startButton.innerHTML = 'Starting...';
  gameStartTimeout = setTimeout(() => {
    gameOn = true;
    //startButton.remove();
    showStartButton(false);
    //startButton.innerHTML = 'Start';
  }, 1000);
});
rounds = 1;
victories_dict = {};
winner = null;

let init = () => {
  w.addEventListener('resize', resize);
  resize();
  ruleSets.map((r) => (r.rulesArr = r.rules.split(' ')));
  if (!myInterval) myInterval = setInterval(update, FPS);
  start();
};
const initEmojis = () => {
  const size = selected.rulesArr.length;
  targetMap = {};
  let emoji;
  for (let i = 0; i < selected.rulesArr.length; i += 2) {
    emoji = selected.rulesArr[i];
    if (!targetMap[emoji]) targetMap[emoji] = [];
    if (i < size - 1) targetMap[emoji].push(selected.rulesArr[i + 2]);
  }
  emojis = Object.keys(targetMap);
};
const start = () => {
  const rock = document.querySelector('#rock');
  rock.classList.remove('score-animation');
  const paper = document.querySelector('#paper');
  paper.classList.remove('score-animation');
  const scissors = document.querySelector('#scissor');
  scissors.classList.remove('score-animation');

  const playArea = document.querySelector('#play-area-wrap');


  if (rounds > 1) {
    showRoundScreen(true);
    showStartButton(true);
  } else showIntroScreen();
  document
    .querySelectorAll('.round-number')
    .forEach((x) => (x.innerHTML = rounds));

  initEmojis();
  let o;
  for (let i = 0; i < 60; i++) {
    o = pieces[i];
    o.o = emojis[i % emojis.length];
    o.x = r() * playArea.clientWidth;
    o.y = isSmallScreen()
      ? r() * SMALL_SCREEN_CANVAS_HEIGHT
      : r() * playArea.clientHeight;
  }
  killFeed = [];
  if (gameRestartTimeout) clearTimeout(gameRestartTimeout);
  if (gameStartTimeout) clearTimeout(gameStartTimeout);
  resize();
  gameOn = false;
};
let pieceMap = {};

let isTarget = (p1, p2) =>
  p2.o && targetMap[p1.o] && targetMap[p1.o].includes(p2.o);
let t = Date.now(),
  elapsed = 0,
  targets,
  weakness,
  closest,
  pangle,
  winIndex,
  tempY;
let update = () => {
  if (!gameOn) return;

  showCanvas(true);

  elapsed = Date.now() - t;
  clear();
  pieces.sort((a, b) => {
    a.y - b.y;
  });
  pieces.map((p) => {
    if (!p.o) return;
    //render
    c.fillStyle = '#f4f4f4';
    c.font = '24px serif';
    c.fillText(p.o, p.x - SIZE / 2, p.y + SIZE / 2);

    //find closest target piece
    targets = pieces.filter((p2) => isTarget(p, p2));
    if (targets.length > 0) {
      targets.sort((a, b) => dist(p, a) - dist(p, b));
      closest = targets[0];
      pangle = angle(p, closest);
      p.x += SPEED * M.cos(pangle);
      p.y += SPEED * M.sin(pangle);

      // collision dection
      if (dist(p, closest) < TOUCH_DISTANCE) {
        winIndex = selected.rulesArr.indexOf(
          p.o,
          selected.rulesArr.indexOf(closest.o)
        );
        killFeed.unshift(getFeed(p.o, closest.o));
        closest.o = p.o;
        if (p.o === '🪨') {
          var audio = new Audio('./assets/rock_sound.mpeg');
          audio.play();
        } else if (p.o === '📄') {
          var audio = new Audio('./assets/paper_sound.mpeg');
          audio.play();
        } else if (p.o === '✂️') {
          var audio = new Audio('./assets/scissors_sound.mpeg');
          audio.play();
        }
        // c.fillText(selected.collision || '💥', p.x - SIZE / 2, p.y + SIZE / 2);
      }
    } else {
      //if no targets, run away from their weakness! ...at 1/2rd the speed
      weakness = pieces.filter((p2) => !isTarget(p, p2));
      if (weakness.length > 0) {
        weakness.sort((a, b) => dist(p, a) - dist(p, b));
        closest = weakness[0];
        pangle = revertAngle(angle(p, closest));
        p.x += (SPEED / 2) * M.cos(pangle);
        p.y += (SPEED / 2) * M.sin(pangle);
      }
    }
  });

  //draw score
  tempY = 0;
  emojis.map((o, i) => {
    pieceMap[o] = pieces.filter((p) => p.o === o);
    tempY = SIZE + i * SIZE * 1.2;
    //drawScore(o, tempY);
  });
  tempY += SIZE * 1.2;

  //draw kill feed
  //renderKillFeed();

  //check end condition
  if (isEndGame()) {
    updateWinCountInHeader(victories_dict);
    //showRoundScreen(true);
    gameRestartTimeout = setTimeout(start, 2000);
    //setTimeout(() => startButton.click(), 2002);
    gameOn = false;
  }
};
let getFeed = (a, b) => {
  //
  let stop = false;
  let startIndex = 0;
  while (!stop) {
    indexA = selected.rulesArr.indexOf(a, startIndex);
    if (indexA === -1) stop = true;
    if (b == selected.rulesArr[indexA + 2]) {
      return `${a} ${selected.rulesArr[indexA + 1]} ${b}`;
    }
    startIndex = indexA + 2;
  }
  return `${a} defeated ${b}`;
};

let isEndGame = () => emojis.filter((o) => didWin(o)).length === 1;
let isDead = (o) => !pieceMap[o] || pieceMap[o].length === 0;
let didWin = (p) => {
  if (emojis.filter((o) => o !== p && isDead(o)).length === emojis.length - 1) {
    clear();

    displayWinner(p);
    rounds += 1;
    winner = p;
    victories_dict[p] = (victories_dict[p] || 0) + 1;

    return true;
  }

  return false;
};
const updateWinCountInHeader = (dict = {}) => {
  const rock = document.querySelector('#rock');
  rock.textContent = dict['🪨'] || 0;
  winner === '🪨' && rock.classList.add('score-animation');

  const paper = document.querySelector('#paper');
  paper.textContent = dict['📄'] || 0;
  winner === '📄' && paper.classList.add('score-animation');

  const scissors = document.querySelector('#scissor');
  scissors.textContent = dict['✂️'] || 0;
  winner === '✂️' && scissors.classList.add('score-animation');
};

updateWinCountInHeader();
onload = () => init();

//---------------------------------------------------
// Utility functions
//---------------------------------------------------

const resize = () => {
  //adjust sizes of things whenever window is resized
  const SMALL_SCREEN_BREAKPOINT = 1199;
  const isSmallScreen = window.innerWidth < SMALL_SCREEN_BREAKPOINT;
  SPEED = isSmallScreen ? 1.5 : 2;
  const playArea = document.querySelector('#play-area-wrap');
  a.width = playArea.clientWidth;
  a.height = isSmallScreen ? SMALL_SCREEN_CANVAS_HEIGHT : playArea.clientHeight;
  SIZE = M.min(a.width, a.height) / 15;
  c.font = SIZE + 'px serif';
  center.x = playArea.clientWidth / 2;
  center.y = isSmallScreen
    ? SMALL_SCREEN_CANVAS_HEIGHT / 2
    : playArea.clientHeight / 2;

  clear();
};
let clear = () => {


  const playArea = document.querySelector('#play-area-wrap');
  c.fillStyle = '#1C263F';
  c.rect(
    0,
    0,
    playArea.clientWidth,
    isSmallScreen() ? SMALL_SCREEN_CANVAS_HEIGHT : playArea.clientHeight
  );
  c.fill();
};

let dist = (p1, p2) => {
  let a = p1.x - p2.x,
    b = p1.y - p2.y;
  return M.sqrt(a * a + b * b);
};
let angle = (p1, p2) => M.atan2(p2.y - p1.y, p2.x - p1.x);
let revertAngle = (radians) => (radians + M.PI) % (2 * Math.PI);
