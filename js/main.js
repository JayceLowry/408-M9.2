// set up canvas

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

// function to generate random number

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function to generate random RGB color value

function randomRGB() {
  return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

class Shape {
  constructor(x, y, velX, velY) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
  }
}

class Ball extends Shape {
  constructor(x, y, velX, velY, color, size) {
    super(x, y, velX, velY);
    this.color = color;
    this.size = size;
    this.exists = true;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    if (this.x + this.size >= width) {
      this.velX = -Math.abs(this.velX);
    }

    if (this.x - this.size <= 0) {
      this.velX = Math.abs(this.velX);
    }

    if (this.y + this.size >= height) {
      this.velY = -Math.abs(this.velY);
    }

    if (this.y - this.size <= 0) {
      this.velY = Math.abs(this.velY);
    }

    this.x += this.velX;
    this.y += this.velY;
  }

  collisionDetect() {
    if (!this.exists) {
      return;
    }
    for (const ball of balls) {
      if (!(this === ball)) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + ball.size) {
          ball.color = this.color = randomRGB();
        }
      }
    }
  }
}

class EvilCircle extends Shape {
  constructor(x, y) {
    super(x, y, 0, 0);
    this.color = "rgb(255, 255, 255)";
    this.size = 10;
    this.maxSpeed = 20;
    
    this.movement = {
      left: false,
      right: false,
      up: false,
      down: false
    };
    this.decay = false;

    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "a":
          this.movement.left = true;
          break;
        case "d":
          this.movement.right = true;
          break;
        case "w":
          this.movement.up = true;
          break;
        case "s":
          this.movement.down = true;
          break;
        case " ":
          this.decay = true;
          break;
      }
    });

    window.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "a":
          this.movement.left = false;
          break;
        case "d":
          this.movement.right = false;
          break;
        case "w":
          this.movement.up = false;
          break;
        case "s":
          this.movement.down = false;
          break;
        case " ":
          this.decay = false;
          break;
      }
    });
  }

  draw() {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
  }

  #decay() {
    if (this.velX > 0) {
      this.velX--;
    } else if (this.velX < 0) {
      this.velX++;
    }

    if (this.velY > 0) {
      this.velY--;
    } else if (this.velY < 0) {
      this.velY++;
    }
  }

  update() {
    if (this.decay) {
      this.#decay();
    }
    if (this.movement.left) {
      this.velX--;
    }
    if (this.movement.right) {
      this.velX++;
    }
    if (this.movement.up) {
      this.velY--;
    }
    if (this.movement.down) {
      this.velY++;
    }

    if (this.x + this.size >= width) {
      this.x -= this.size / 2;
      this.velX = 0;
    }

    if (this.x - this.size <= 0) {
      this.x += this.size / 2;
      this.velX = 0;
    }

    if (this.y + this.size >= height) {
      this.y -= this.size / 2;
      this.velY = 0;
    }

    if (this.y - this.size <= 0) {
      this.y += this.size / 2; 
      this.velY = 0;
    }
    
    if (this.velX > this.maxSpeed) {
      this.velX = this.maxSpeed;
    } else if (this.velX < -this.maxSpeed) {
      this.velX = -this.maxSpeed;
    }

    if (this.velY > this.maxSpeed) {
      this.velY = this.maxSpeed;
    } else if (this.velY < -this.maxSpeed) {
      this.velY = -this.maxSpeed;
    }

    this.x += this.velX;
    this.y += this.velY;
  }

  collisionDetect() {
    for (const ball of balls) {
      if (ball.exists) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + ball.size) {
          ball.exists = false;
        }
      }
    }
  }
}

const balls = [];
const evilCircle = new EvilCircle(0, 0);

while (balls.length < 25) {
  const size = random(10, 20);
  const ball = new Ball(
    // ball position always drawn at least one ball width
    // away from the edge of the canvas, to avoid drawing errors
    random(0 + size, width - size),
    random(0 + size, height - size),
    random(-7, 7),
    random(-7, 7),
    randomRGB(),
    size
  );

  balls.push(ball);
}

function loop() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, width, height);
  evilCircle.draw();
  evilCircle.update();
  evilCircle.collisionDetect();

  for (const ball of balls) {
    if (!ball.exists) {
      continue;
    }
    ball.draw();
    ball.update();
    ball.collisionDetect();
  }

  requestAnimationFrame(loop);
}

loop();