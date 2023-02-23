const emojiNames = {
  '🪨': 'rock',
  '📄': 'paper',
  '✂️': 'scissors'
};
const hideAll = () => {
  document
    .querySelectorAll('canvas, #win-screen, #round-screen, #intro-screen')
    .forEach(node => (node.style.display = 'none'));
};
const showStartButton = visibility => {
  document.querySelector('#startButton').style.display = visibility
    ? 'block'
    : 'none';
};
const showCanvas = () => {
  hideAll();
  document.querySelector('canvas').style.display = 'block';
};
const showWinScreen = () => {
  hideAll();
  document.querySelector('#win-screen').style.display = 'block';
};
const showRoundScreen = () => {
  hideAll();
  document.querySelector('#round-screen').style.display = 'block';
};
const showIntroScreen = () => {
  hideAll();
  document.querySelector('#intro-screen').style.display = 'block';
};
const displayWinner = p => {
  showWinScreen(true);
  document
    .querySelectorAll('#win-screen img')
    .forEach(img => (img.style.display = 'none'));

  const winnerName = emojiNames[p];
  document.querySelector(`#win-${winnerName}`).style.display = 'block';
};

let c = a.getContext('2d'), // no more $type conditional
  w = window,
  d = document,
  M = Math,
  r = M.random,
  ruleSets = [
    {
      id: 1,
      name: '🪨📄✂️',
      rules: '✂️ cuts 📄 covers 🪨 crushes ✂️'
    }
  ],
  FPS = 30, //50fps
  SIZE = 10,
  PIECES_COUNT = 3 * 5 * 7 * 10,
  SPEED = 3,
  TOUCH_DISTANCE = 9,
  gameOn = false,
  targetMap = {},
  center = {},
  emojis = [],
  killFeed = [],
  pieces = new Array(90).fill().map(() => ({ o: '', x: 0, y: 0 })),
  myInterval = null,
  gameRestartTimeout = null,
  gameStartTimeout = null,
  selected = ruleSets[0];
startButton = document.querySelector('#startButton');
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

let init = () => {
  w.addEventListener('resize', resize);
  resize();
  ruleSets.map(r => (r.rulesArr = r.rules.split(' ')));
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
  if (rounds > 1) {
    showRoundScreen(true);
    showStartButton(true);
  } else showIntroScreen();
  document
    .querySelectorAll('.round-number')
    .forEach(x => (x.innerHTML = rounds));

  initEmojis();
  let o;
  for (i = 0; i < 90; i++) {
    o = pieces[i];
    o.o = emojis[i % emojis.length];
    o.x = r() * innerWidth;
    o.y = r() * innerHeight;
  }
  killFeed = [];
  if (gameRestartTimeout) clearTimeout(gameRestartTimeout);
  if (gameStartTimeout) clearTimeout(gameStartTimeout);
  resize();
  gameOn = false;

  if (rounds == 1) {
    tempY = center.y - SIZE * 2;
    write(selected.name, center.x, tempY + SIZE * 1.5, SIZE * 1, true);
  } else {
    // let text = '';
    // let count = '';
    // emojis.forEach(emoji => {
    //   if (victories_dict[emoji]) {
    //     text += emoji;
    //     count += victories_dict[emoji];
    //   } else {
    //     text += emoji;
    //     count += 0;
    //   }
    //   text += '\n';
    //   count += '\n';
    // });
    // clear();
    // text.split('\n').forEach((sc, index) => {
    //   if (window.innerWidth <= 450) {
    //     var tms = 1;
    //     if (index == 0) {
    //       tms = 130;
    //     }
    //     if (index == 1) {
    //       tms = 120;
    //     }
    //     if (index == 2) {
    //       tms = 120;
    //     }
    //     write(
    //       sc,
    //       center.x - window.innerWidth / 4 + index * tms,
    //       center.y,
    //       SIZE * 2,
    //       (c.fillStyle = 'white'),
    //       true
    //     );
    //   } else {
    //     write(
    //       sc,
    //       center.x - window.innerHeight / 4 + index * 180,
    //       center.y - SIZE * 2,
    //       SIZE * 2,
    //       (c.fillStyle = 'white'),
    //       true
    //     );
    //   }
    // });
    // count.split('\n').forEach((x, index) => {
    //   if (index <= 2) {
    //     if (window.innerWidth <= 450) {
    //       var tms = 1;
    //       if (index == 0) {
    //         tms = 130;
    //       }
    //       if (index == 1) {
    //         tms = 120;
    //       }
    //       if (index == 2) {
    //         tms = 120;
    //       }
    //       write(
    //         x,
    //         center.x - window.innerWidth / 4 + index * tms,
    //         center.y + SIZE * 3,
    //         SIZE * 2,
    //         (c.fillStyle = 'white'),
    //         true
    //       );
    //     } else {
    //       write(
    //         x,
    //         center.x - window.innerHeight / 4 + index * 180,
    //         center.y + SIZE * 2,
    //         SIZE * 2,
    //         (c.fillStyle = 'white'),
    //         true
    //       );
    //     }
    //   }
    // });
  }
  setTimeout(() => {
    c.fillStyle = '#0000';
    clear();

    //temp_div.appendChild(startButton);
  }, 3000);
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
  pieces.map(p => {
    if (!p.o) return;
    //render
    c.fillStyle = 'white';
    c.font = '30px serif';
    c.fillText(
      p.o,
      p.x - SIZE / 2,
      p.y + SIZE / 2 + ((elapsed + emojis.indexOf(p.o)) % 5)
    );

    //find closest target piece
    targets = pieces.filter(p2 => isTarget(p, p2));
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
        //c.fillText(selected.collision || '💥', p.x - SIZE / 2, p.y + SIZE / 2);
      }
    } else {
      //if no targets, run away from their weakness! ...at 1/3rd the speed
      weakness = pieces.filter(p2 => !isTarget(p, p2));
      if (weakness.length > 0) {
        weakness.sort((a, b) => dist(p, a) - dist(p, b));
        closest = weakness[0];
        pangle = revertAngle(angle(p, closest));
        p.x += (SPEED / 3) * M.cos(pangle);
        p.y += (SPEED / 3) * M.sin(pangle);
      }
    }
  });

  //draw score
  tempY = 0;
  emojis.map((o, i) => {
    pieceMap[o] = pieces.filter(p => p.o === o);
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

let isEndGame = () => emojis.filter(o => didWin(o)).length === 1;
let isDead = o => !pieceMap[o] || pieceMap[o].length === 0;
let didWin = p => {
  if (emojis.filter(o => o !== p && isDead(o)).length === emojis.length - 1) {
    clear();

    displayWinner(p);
    rounds += 1;
    if (Object.keys(victories_dict).includes(p)) {
      victories_dict[p] += 1;
    } else {
      victories_dict[p] = 1;
    }

    return true;
  }

  return false;
};
const updateWinCountInHeader = (dict = {}) => {
  console.log('Win count called', dict);
  const el = document.getElementById('wincount');
  let text = `<span>${dict['🪨'] || 0}</span><span>${
    dict['📄'] || 0
  }</span><span>${dict['✂️'] || 0}</span>`;
  el.innerHTML = text;
};

updateWinCountInHeader();
onload = () => init();

//---------------------------------------------------
// Utility functions
//---------------------------------------------------
const resize = () => {
  //adjust sizes of things whenever window is resized
  a.width = innerWidth;
  a.height = innerHeight;
  SIZE = M.min(a.width, a.height) / 15;
  c.font = SIZE + 'px serif';
  center.x = innerWidth / 2;
  center.y = innerHeight / 2;
};
let clear = () => {
  c.fillStyle = '#000';
  c.rect(0, 0, innerWidth, innerHeight);
  c.fill();
};
let write = (str, x, y, fontSize, centered) => {
  if (!(y < innerHeight && y > 0 && x > 0 && x < innerWidth)) return;
  c.font = fontSize + 'px serif';
  if (centered) x -= c.measureText(str).width / 2;
  c.fillText(str, x, y);
};
let dist = (p1, p2) => {
  let a = p1.x - p2.x,
    b = p1.y - p2.y;
  return M.sqrt(a * a + b * b);
};
let angle = (p1, p2) => M.atan2(p2.y - p1.y, p2.x - p1.x);
let revertAngle = radians => (radians + M.PI) % (2 * Math.PI);
