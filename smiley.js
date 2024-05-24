document.addEventListener("DOMContentLoaded", () => {
  const mouse = new Mouse();

  const smiley = new Smiley({
    element: document.querySelector("canvas#zdog-canvas"),
  });

  smiley.init();

  const simulation = new Simulation({
    element: document.querySelector("canvas#matter-canvas"),
    ballSize: smiley.face.stroke / window.devicePixelRatio,
    onCollision: () => {
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      //   smiley.face.color = `#${randomColor}`;
    },
    onAnimate: (ball) => {
      const position = {
        x: ball.position.x - window.innerWidth / 2,
        y: ball.position.y - window.innerHeight / 2,
      };

      const isMobile = "ontouchstart" in window;
      if (!isMobile) smiley.animate(mouse.x, mouse.y);
      smiley.element.style.transform = `translate(${position.x}px, ${position.y}px)`;
    },
  });
});

class Smiley {
  constructor({
    element,
    foregroundColor = "#000000",
    backgroundColor = "#f7d247",
    drawOutline = false,
  }) {
    this.element = element;
    this.foregroundColor = foregroundColor;
    this.backgroundColor = backgroundColor;
    this.drawOutline = drawOutline;
  }

  init() {
    this.paint();
    this.render();
    // this.resize();
    // window.addEventListener("resize", this.resize.bind(this));
  }

  paint() {
    this.illustration = new Zdog.Illustration({
      element: this.element,
    });

    if (this.drawOutline) {
      this.outline = new Zdog.Ellipse({
        addTo: this.illustration,
        width: 120,
        height: 120,
        stroke: 6,
        fill: false,
        quarters: 1,
        color: this.foregroundColor,
      });

      this.outline.copyGraph({
        rotate: { z: Zdog.TAU / 2 },
      });

      this.outline.copyGraph({
        rotate: { z: Zdog.TAU / 4 },
      });

      this.outline.copyGraph({
        rotate: { z: -Zdog.TAU / 4 },
      });
    }

    this.face = new Zdog.Shape({
      addTo: this.illustration,
      color: this.backgroundColor,
      stroke: 114,
    });

    this.eye = new Zdog.Ellipse({
      addTo: this.illustration,
      width: 8,
      height: 26,
      fill: true,
      color: this.foregroundColor,
      stroke: 5,
      translate: {
        x: -16,
        y: -18,
        z: 40,
      },
    });

    this.eye.copyGraph({
      translate: {
        x: 16,
        y: -18,
        z: 40,
      },
    });

    this.mouth = new Zdog.Shape({
      addTo: this.illustration,
      color: this.foregroundColor,
      stroke: 6,
      closed: false,
      translate: {
        z: 40,
      },
      path: [
        { move: { x: -35, y: 20 } },
        {
          bezier: [
            { x: -18, y: 48 },
            { x: 18, y: 48 },
            { x: 35, y: 20 },
          ],
        },
      ],
    });
  }

  render() {
    this.illustration.updateRenderGraph();
  }

  get x() {
    const boundingBox = this.element.getBoundingClientRect();
    return boundingBox.left + boundingBox.width / 2;
  }

  get y() {
    const boundingBox = this.element.getBoundingClientRect();
    return boundingBox.top + boundingBox.height / 2;
  }

  animate(x, y) {
    const min = {
      x: -1,
      y: -1,
    };
    const max = {
      x: 1,
      y: 1,
      distance: window.innerWidth / 2,
    };
    const cursor = {
      x: x,
      y: y,
    };

    const difference = {
      x: cursor.x - this.x,
      y: cursor.y - this.y,
    };

    difference.x = Math.max(
      -max.distance,
      Math.min(difference.x, max.distance)
    );
    difference.y = Math.max(
      -max.distance,
      Math.min(difference.y, max.distance)
    );

    const ratio = {
      x: 1 - (difference.y + max.distance) / (max.distance * 2),
      y: 1 - (difference.x + max.distance) / (max.distance * 2),
    };

    let distance = Math.pow(
      Math.pow(difference.x, 2) + Math.pow(difference.y, 2),
      0.5
    );
    distance = Math.max(-max.distance, Math.min(distance, max.distance));

    this.illustration.rotate.x = ratio.x * (max.x - min.x) + min.x;
    this.illustration.rotate.y = ratio.y * (max.y - min.y) + min.y;
    this.render();
  }

  resize() {
    this.element.width = window.innerWidth;
    this.element.height = window.innerHeight;
    this.element.style.width = `${window.innerWidth}px`;
    this.element.style.height = `${window.innerHeight}px`;

    this.render();
  }
}

class Simulation {
  constructor({ element, ballSize, onCollision = null, onAnimate = null }) {
    this.element = element;
    this.ballSize = ballSize;
    this.onCollision = onCollision;
    this.onAnimate = onAnimate;

    this.delta = 1000 / 60;
    this.subSteps = 3;
    this.subDelta = this.delta / this.subSteps;

    this.engine = Matter.Engine.create();
    this.render = Matter.Render.create({
      canvas: this.element,
      engine: this.engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: "transparent",
        wireframes: false,
      },
    });

    this.mouse = Matter.Mouse.create(this.render.canvas);
    this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
      mouse: this.mouse,
      constraint: {
        stiffness: 0.1,
      },
    });
    Matter.World.add(this.engine.world, [this.mouseConstraint]);

    this.createBall();
    this.createWalls();

    this.sound = new Howl({
      src: ["bounce.mp3"],
      volume: 0.2,
    });

    Matter.Events.on(this.engine, "collisionStart", this.collision.bind(this));

    this.animate();

    window.addEventListener("resize", this.resize.bind(this));
  }

  createBall() {
    this.ball = Matter.Bodies.circle(
      window.innerWidth / 2,
      window.innerHeight / 2,
      this.ballSize,
      {
        color: "#000",
        restitution: 0.8,
      }
    );

    Matter.World.add(this.engine.world, [this.ball]);
  }

  createWalls() {
    const wallWidth = window.innerWidth;

    this.ground = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight + wallWidth,
      window.innerWidth,
      wallWidth * 2,
      {
        color: "#000",
        isStatic: true,
      }
    );

    this.ceiling = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      0 - wallWidth,
      window.innerWidth,
      wallWidth * 2,
      {
        color: "#000",
        isStatic: true,
      }
    );

    this.leftWall = Matter.Bodies.rectangle(
      0 - wallWidth,
      window.innerHeight / 2,
      wallWidth * 2,
      window.innerHeight,
      {
        color: "#000",
        isStatic: true,
      }
    );

    this.rightWall = Matter.Bodies.rectangle(
      window.innerWidth + wallWidth,
      window.innerHeight / 2,
      wallWidth * 2,
      window.innerHeight,
      {
        color: "#000",
        isStatic: true,
      }
    );

    Matter.World.add(this.engine.world, [
      this.ground,
      this.leftWall,
      this.rightWall,
      this.ceiling,
    ]);
  }

  collision(event) {
    if (this.onCollision) {
      this.onCollision(event);
    }
    const max = 1.2;
    const min = 1.0;
    this.sound.rate(Math.random() * (max - min) + min);
    this.sound.play();
  }

  resize() {
    this.render.options.width = window.innerWidth;
    this.render.options.height = window.innerHeight;
    this.render.canvas.width = window.innerWidth;
    this.render.canvas.height = window.innerHeight;

    Matter.World.remove(this.engine.world, this.ground);
    Matter.World.remove(this.engine.world, this.ceiling);
    Matter.World.remove(this.engine.world, this.leftWall);
    Matter.World.remove(this.engine.world, this.rightWall);

    this.createWalls();
  }

  animate() {
    if (this.onAnimate) {
      this.onAnimate(this.ball);
    }

    for (let i = 0; i < this.subSteps; i += 1) {
      Matter.Engine.update(this.engine, this.subDelta);
      Matter.Render.world(this.render, this.subDelta);
    }

    requestAnimationFrame(this.animate.bind(this));
  }
}

class Mouse {
  constructor() {
    this.x = 0;
    this.y = 0;

    document.addEventListener("mousemove", (event) => {
      this.x = event.clientX;
      this.y = event.clientY;
    });
  }
}
