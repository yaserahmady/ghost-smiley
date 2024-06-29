import Matter from "matter-js";

export class Simulation {
  constructor({
    element,
    ballSize,
    onCollision = null,
    onAnimate = null,
    onMouseDown = null,
    onMouseUp = null,
    onMouseOver = null,
    onMouseOut = null,
  }) {
    this.element = element;
    this.ballSize = ballSize;
    this.onCollision = onCollision;
    this.onAnimate = onAnimate;
    this.onMouseDown = onMouseDown;
    this.onMouseUp = onMouseUp;
    this.onMouseOver = onMouseOver;
    this.onMouseOut = onMouseOut;

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

    // Fixes edge case where user moves mouse out of browser window
    this.element.addEventListener("mouseleave", (event) => {
      this.mouseConstraint.mouse.mouseup(event);
    });

    this.createBall();
    this.createWalls();

    Matter.Events.on(this.engine, "collisionStart", this.collision.bind(this));
    Matter.Events.on(
      this.mouseConstraint,
      "mousedown",
      this.mouseDown.bind(this)
    );
    Matter.Events.on(this.mouseConstraint, "mouseup", this.mouseUp.bind(this));

    Matter.Events.on(this.mouseConstraint, "mousemove", (event) => {
      const foundPhysics = Matter.Query.point(
        [this.ball],
        event.mouse.position
      );
      if (foundPhysics.length > 0) {
        this.mouseOver(event);
      } else {
        this.mouseOut(event);
      }
    });

    this.animate();
    window.addEventListener("resize", this.resize.bind(this));
  }

  createBall() {
    this.ball = Matter.Bodies.circle(
      window.innerWidth / 2,
      window.innerHeight / 2,
      this.ballSize,
      {
        label: "ball",
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
        label: "ground",
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
        label: "ceiling",
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
        label: "leftWall",
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
        label: "rightWall",
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
  }
  mouseUp(event) {
    if (this.onMouseUp) {
      this.onMouseUp(event);
    }
  }
  mouseDown(event) {
    if (this.onMouseDown) {
      this.onMouseDown(event);
    }
  }
  mouseOver(event) {
    if (this.onMouseOver) {
      this.onMouseOver(event);
    }
  }
  mouseOut(event) {
    if (this.onMouseOut) {
      this.onMouseOut(event);
    }
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
