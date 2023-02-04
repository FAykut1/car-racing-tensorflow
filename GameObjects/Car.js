class Car {
  constructor(startPosition) {
    this.startPosition = startPosition;
    this.resetBrain();
    this.reset();
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fillStyle = 'white';

    ctx.fill();

    this.sensor.draw();
  }

  update() {
    if (this.crashed) return;

    if (this.left) {
      this.angle += 0.03;
    }

    if (this.right) {
      this.angle -= 0.03;
    }

    if (this.forward) {
      this.speed += this.acceleration;
    }

    if (this.back) {
      this.speed -= this.acceleration;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }

    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    if (this.speed > 0) {
      this.speed -= this.friction;
    }

    if (this.speed < 0) {
      this.speed += this.friction;
    }

    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;

    this.polygon = this.#createPolygon();
    this.#collision();

    this.sensor.update();

    this.predictMove();
  }

  reset() {
    this.x = this.startPosition.x;
    this.y = this.startPosition.y;
    this.w = 50;
    this.h = 100;

    this.speed = 0;
    this.maxSpeed = 8;
    this.acceleration = 0.2;
    this.friction = 0.1;
    this.angle = -1.5;

    this.score = 0;
    this.lastScoreTime = Date.now();
    this.rewards = new Map();
    this.crashed = false;

    this.sensor = new CarSensor(this, this.sensorCount);

    this.left = false;
    this.right = false;
    this.forward = false;
    this.back = false;
  }

  resetBrain() {
    this.sensorCount = 5;
    if (this.model) {
      this.model.dispose();
    }
    this.model = tf.sequential();
    this.model.add(
      tf.layers.dense({
        inputShape: [this.sensorCount],
        units: 8,
        activation: 'relu',
      })
    );
    this.model.add(tf.layers.dense({ units: 4, activation: 'sigmoid' }));

    this.model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
  }

  learn(weights) {
    if (weights) {
      this.model.setWeights(weights);
      this.model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
    }
  }

  copyBrain() {
    return this.model.getWeights().slice();
  }

  predictMove() {
    // Prepare the input data for the model
    tf.tidy(() => {
      if (this.sensor?.readings) {
        const data = this.sensor.readings.map((v) =>
          v == null ? 0 : (v.offset / this.sensor.rayLength) * v.blocker
        );

        const inputTensor = tf.tensor2d([[...data]]);
        // .reshape([-1, this.sensorCount]);

        const output = this.model.predict(inputTensor);
        inputTensor.dispose();
        const prediction = output.dataSync();
        output.dispose();
        this.left = prediction[0] > 0.5;
        this.right = prediction[1] > 0.5;
        this.forward = prediction[2] > 0.5;
        this.back = prediction[3] > 0.5;
      }
    });
  }

  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.w, this.h) / 2;
    const alpha = Math.atan2(this.w, this.h);
    points.push({
      x: Math.round(this.x - Math.sin(this.angle - alpha) * rad),
      y: Math.round(this.y - Math.cos(this.angle - alpha) * rad),
    });
    points.push({
      x: Math.round(this.x - Math.sin(this.angle + alpha) * rad),
      y: Math.round(this.y - Math.cos(this.angle + alpha) * rad),
    });
    points.push({
      x: Math.round(this.x - Math.sin(Math.PI + this.angle - alpha) * rad),
      y: Math.round(this.y - Math.cos(Math.PI + this.angle - alpha) * rad),
    });
    points.push({
      x: Math.round(this.x - Math.sin(Math.PI + this.angle + alpha) * rad),
      y: Math.round(this.y - Math.cos(Math.PI + this.angle + alpha) * rad),
    });
    return points;
  }

  #collision() {
    let points = getPointsInPolygon(this.polygon, 1);

    for (let point of points) {
      const go = gameManager.gameObjects.get(xyGen(point.x, point.y));
      if (go) {
        if (go.bId == brush.border.id) {
          this.crashed = true;
          return;
        } else {
          if (!this.rewards.has(xyGen(go.position.x, go.position.y))) {
            this.rewards.set(xyGen(go.position.x, go.position.y), true);
            this.score += go.reward;
            this.lastScoreTime = Date.now();
          }
        }
      }
    }
  }
}
