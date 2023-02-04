const brush = {
  border: {
    id: 0,
    blocker: 1,
    reward: 0,
    color: [255, 255, 255],
  },
  reward: {
    id: 1,
    blocker: -1,
    reward: 1,
    color: [0, 255, 0],
  },
  start: {
    id: 2,
    blocker: -1,
    reward: 0,
    color: [0, 0, 255],
  },
  finish: {
    id: 3,
    blocker: -1,
    reward: 100,
    color: [255, 0, 0],
  },
};

class DrawManager {
  constructor() {
    this.brush = brush.border;

    this.#addDrawButtons();
    this.#addMouseListeners();
  }

  draw() {}

  update() {
    if (currentState === STATE.GAME) return;
  }

  #addMouseListeners() {
    canvas.onmousedown = (e) => {
      isDrawing = true;
      ctx.beginPath();
      ctx.moveTo(e.clientX, e.clientY);
      e.preventDefault();
    };

    canvas.onmousemove = (e) => {
      if (currentState !== STATE.DRAWING) return;
      if (isDrawing) {
        ctx.lineTo(e.clientX, e.clientY);
        ctx.strokeStyle = `rgb(${this.brush.color[0]}, ${this.brush.color[1]}, ${this.brush.color[2]})`;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      e.preventDefault();
    };

    canvas.onmouseup = (e) => {
      if (currentState !== STATE.DRAWING) return;

      if (isDrawing) {
        ctx.stroke();
        ctx.closePath();
        isDrawing = false;
      }
      e.preventDefault();
    };

    canvas.onmouseout = (e) => {
      if (currentState !== STATE.DRAWING) return;

      if (isDrawing) {
        ctx.stroke();
        ctx.closePath();
        isDrawing = false;
      }
      e.preventDefault();
    };
  }

  #addDrawButtons() {
    this.btnDrawBorder = document.getElementById('draw-border');
    this.btnDrawReward = document.getElementById('draw-reward');
    this.btnDrawStart = document.getElementById('draw-start');
    this.btnDrawFinish = document.getElementById('draw-finish');

    this.btnDrawBorder.onclick = (e) => {
      if (currentState !== STATE.DRAWING) return;

      this.brush = brush.border;
    };
    this.btnDrawReward.onclick = (e) => {
      if (currentState !== STATE.DRAWING) return;
      // currentState = STATE.PLACING;

      this.brush = brush.reward;
    };
    this.btnDrawStart.onclick = (e) => {
      if (currentState !== STATE.DRAWING) return;

      this.brush = brush.start;
    };
    this.btnDrawFinish.onclick = (e) => {
      if (currentState !== STATE.DRAWING) return;

      this.brush = brush.finish;
    };
  }
}
