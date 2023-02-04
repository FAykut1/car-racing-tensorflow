let rewardId = 0;

class Reward {
  constructor(x, y) {
    this.id = rewardId++;
    this.x = x;
    this.y = y;
    this.r = 24;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.r, this.r, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
