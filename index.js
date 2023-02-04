/** @type{HTMLCanvasElement} */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 900;
canvas.height = 900;

const STATE = {
  WAITING: 'WAITING',
  DRAWING: 'DRAWING',
  GAME: 'GAME',
};

let gameManager = new GameManager();
let drawManager = new DrawManager();

tf.setBackend('cpu');

let frameCount = 0;
let isDrawing = false;
let drawColor = 'white';
let currentState = STATE.WAITING;
let map = null;
let collisionMap = [];
let mapImg = new Image();
let imageLoaded = false;

let totalCarCount = 100;
let cars = [];
// let car = new Car();

function gameLoop() {
  if (currentState !== STATE.DRAWING) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameManager.imageData) {
      ctx.putImageData(gameManager.imageData, 0, 0);
    }

    if (currentState === STATE.GAME) {
      const now = Date.now();

      for (let car of cars) {
        car.update();
        car.draw(ctx);

        let ld = now - car.lastScoreTime;
        if (ld > 2000) car.crashed = true;
      }

      // cars.filter(c => c.lastScoreTime )

      // if (frameCount % 100 === 0) {
      //   let scores = cars.filter((c) => !c.crashed).map((c) => c.score);
      //   console.log(scores);
      //   let worstCarScore = Math.min(...scores);
      //   let worstCar = cars
      //     .filter((c) => !c.crashed)
      //     .find((c) => c.score == worstCarScore);
      //   if (worstCar) {
      //     worstCar.crashed = true;
      //     console.log('Crashed', worstCar);
      //   }
      // }

      let isGameOver = cars.every((c) => c.crashed);

      if (isGameOver) gameOver({});
    }
  }

  drawManager.update();
  drawManager.draw();

  frameCount++;
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keyup', stopCar, false);
document.addEventListener('keydown', moveCar, false);

function moveCar(e) {
  if (e.key === 'a') {
    car.left = true;
  }
  if (e.key === 'd') {
    car.right = true;
  }
  if (e.key === 'w') {
    car.forward = true;
  }
  if (e.key === 's') {
    car.back = true;
  }

  if (e.key === 't') {
    console.log(car.score);
  }

  if (e.key === ' ') {
    startGame();
  }

  if (e.key === 'r') {
    clearMap();
    drawMap();
  }

  if (e.key === 'c') {
    gameManager.saveImageData();
  }

  if (e.key === 'l') {
    gameManager.loadImageData();
  }
}

function clearMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  map = null;
  collisionMap = [];
}

function drawMap() {
  currentState = STATE.DRAWING;
}

function stopCar(e) {
  if (e.key === 'a') {
    car.left = false;
  }
  if (e.key === 'd') {
    car.right = false;
  }
  if (e.key === 'w') {
    car.forward = false;
  }
  if (e.key === 's') {
    car.back = false;
  }
}

function mutate(weights) {
  const mutatedWeights = [];
  for (let i = 0; i < weights.length; i++) {
    let shape = weights[i].shape;
    let values = weights[i].mData
      ? weights[i].mData
      : toObject(weights[i].dataSync().slice());

    values = Object.values(values).map((v) =>
      Math.random() < 0.05 ? v + Math.random() * 0.1 - 0.05 : v
    );
    let newTensor = tf.tensor(values, shape);
    mutatedWeights[i] = newTensor;
  }
  return mutatedWeights;
}

function startGame() {
  currentState = STATE.GAME;
  initializeCars();
}

function gameOver({ bestBrain }) {
  console.log('Game Over...');

  const bestCar = findBestCar();
  let brain = null;
  if (bestBrain) {
    brain = bestBrain;
  } else {
    brain = bestCar.copyBrain();
    const { bestScore } = gameManager.getBestBrain();
    if (bestCar.score / gameManager.totalScore > bestScore) {
      gameManager.saveBestBrain(brain, bestCar.score);
    }
  }

  for (let car of cars) {
    if (car !== bestCar) {
      if (Math.random() < 0.5 && !bestBrain) {
        car.resetBrain();
      } else {
        car.learn(mutate(brain));
      }
    }
    car.reset();
  }
  gameManager.textGenerationCount.innerText =
    'Generation: ' + ++gameManager.generation;
}

function findBestCar() {
  let maxScore = Math.max(...cars.map((c) => c.score));
  return cars.find((c) => c.score === maxScore);
}

function initializeCars() {
  const startPoints = gameManager.getGameObjectWithBrush(brush.start);
  console.log(startPoints);
  for (let i = 0; i < totalCarCount; i++) {
    cars[i] = new Car(startPoints[0].position);
  }
}

function main() {
  requestAnimationFrame(gameLoop);
  gameManager.loadImageData();
}

main();
