class GameManager {
  constructor() {
    this.totalScore = 0;
    this.generation = 0;
    this.image = new Image();
    this.imageData = null;
    this.gameObjects = new Map();

    this.image.onload = () => {
      this.imageOnLoad();
    };

    this.#addSettingButtons();
    this.#addInfo();
  }

  #addSettingButtons() {
    this.btnLoadBrain = document.getElementById('load-brain');

    this.btnLoadBrain.onclick = (e) => {
      gameOver(this.getBestBrain());
    };
  }

  #addInfo() {
    this.textGenerationCount = document.getElementById('generation-text');
    this.textTotalScore = document.getElementById('total-score-text');
  }

  saveImageData() {
    console.log('saveImageData');
    this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.#pixelToGameObjects(this.imageData);

    this.textTotalScore.innerText =
      'Total Obtainable Score: ' + this.totalScore;

    const uMap = {
      imageData: canvas.toDataURL(),
      hash: CryptoJS.MD5(canvas.toDataURL()),
      totalObtainableScore: this.totalScore,
    };
    localStorage.setItem('map', JSON.stringify(uMap));
  }

  loadImageData() {
    console.log('loadImageData');
    let map = JSON.parse(localStorage.getItem('map'));
    if (map) {
      this.image.src = map.imageData;
      this.totalScore = map.totalObtainableScore;
      this.mapHash = map.hash;
    }
  }

  imageOnLoad() {
    console.log('imageOnLoad');
    ctx.drawImage(this.image, 0, 0);
    this.saveImageData();
  }

  #pixelToGameObjects(imageData) {
    this.totalScore = 0;
    this.gameObjects.clear();

    for (let i = 0; i < imageData.data.length; i += 4) {
      let r = imageData.data[i + 0];
      let g = imageData.data[i + 1];
      let b = imageData.data[i + 2];
      let a = imageData.data[i + 3];

      if (a != 0) {
        let position = indexTo2D(i / 4, imageData.width, imageData.height);
        let _brush = Object.values(brush).find((v) =>
          listEqual(v.color, [r, g, b])
        );

        if (_brush) {
          this.totalScore += _brush.reward;
          let obj = {
            bId: _brush.id,
            blocker: _brush.blocker,
            reward: _brush.reward,
            position,
          };
          // collisionMap.push(position);
          this.gameObjects.set(xyGen(position.x, position.y), obj);
        }
      }
    }
  }

  getGameObjectWithBrush(_brush) {
    const points = [];
    for (let go of this.gameObjects.values()) {
      if (go.bId === _brush.id) points.push(go);
    }
    return points;
  }

  getBestBrain() {
    let brainStr = localStorage.getItem('best-brain');
    let score = localStorage.getItem('best-brain-score') ?? 0;
    let brain = JSON.parse(brainStr);
    return { bestBrain: brain, bestScore: score };
  }

  saveBestBrain(brain, score) {
    let _brain = brain.map((v) => {
      return {
        shape: v.shape,
        mData: v.dataSync().slice(),
      };
    });
    localStorage.setItem('best-brain', JSON.stringify(_brain));
    localStorage.setItem('best-brain-score', score / this.totalScore);
  }
}
