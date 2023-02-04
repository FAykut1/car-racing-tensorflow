class CarSensor {
  constructor(car, sensorCount) {
    this.car = car;
    this.rayCount = sensorCount;
    this.rayLength = 200;
    this.raySpread = Math.PI * 2;
    this.rayWidth = 2;

    this.rays = [];
    this.readings = [];
  }

  update() {
    this.rays = [];

    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle = i * (this.raySpread / this.rayCount) + this.car.angle;
      const start = { x: this.car.x, y: this.car.y };
      const end = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };

      this.rays.push([start, end]);
    }

    this.readings = [];
    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(this.#getReading(this.rays[i]));
    }
  }

  draw() {
    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i][1];
      if (this.readings[i]) {
        end = this.readings[i];
      }
      ctx.beginPath();
      ctx.lineWidth = this.rayWidth;
      ctx.strokeStyle = 'yellow';
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'red';
      ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }

  #getReading(ray) {
    let touches = [];

    let points = getPointsOnLine(ray[0], ray[1], 1);

    for (let point of points) {
      const go = gameManager.gameObjects.get(xyGen(point.x, point.y));
      if (go) {
        if (go.bId == brush.border.id) {
          // if (this.car.rewards.has(xyGen(go.position.x, go.position.y))) continue;
          const touch = isPointInterceptsLine(
            go.position,
            ray[0],
            ray[1],
            this.rayWidth
          );
          if (touch) {
            let t = {
              x: go.position.x,
              y: go.position.y,
              offset: distanceBetweenPoints(
                {
                  x: ray[0].x,
                  y: ray[0].y,
                },
                go.position
              ),
              blocker: go.blocker,
            };
            touches.push(t);
          }
        }
      }
    }

    if (touches.length === 0) {
      return null;
    } else {
      const offsets = touches.map((e) => e.offset);
      const minOffset = Math.min(...offsets);
      return touches.find((e) => e.offset == minOffset);
    }
  }
}
