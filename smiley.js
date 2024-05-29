document.addEventListener("DOMContentLoaded", () => {
  document.body.style.cursor = "grab";
  const sounds = {
    bounce: new Howl({
      src: ["assets/bounce.mp3"],
      volume: 0.1,
    }),
    sparkles: new Howl({
      src: ["assets/sparkles.mp3"],
      volume: 0.3,
    }),
  };
  const mouse = new Mouse();

  const smileyContainer = document.querySelector("#smiley-container");
  const smiley = new Smiley({
    element: document.querySelector("canvas#zdog-canvas"),
    backgroundColor: "hsl(50deg, 100%, 50%)",
  });

  let sparkling;

  const simulation = new Simulation({
    element: document.querySelector("canvas#matter-canvas"),
    ballSize: smiley.face.stroke / window.devicePixelRatio,
    onCollision: () => {
      // smiley.face.color = `hsl(${randomInt(0, 360)}, 100%, 50%)`;
      sounds.bounce.rate(randomFloat(1.0, 1.2));
      sounds.bounce.play();
    },
    onAnimate: (ball) => {
      const position = {
        x: ball.position.x - window.innerWidth / 2,
        y: ball.position.y - window.innerHeight / 2,
      };

      const isMobile = "ontouchstart" in window;
      if (!isMobile) smiley.animate(mouse.x, mouse.y);
      smileyContainer.style.transform = `translate(${position.x}px, ${position.y}px)`;
    },
    onMouseDown: (event) => {
      if (event.source.body) {
        sparkling = new Sparkling("hsl(50deg, 100%, 90%)");
        sounds.sparkles.play();
        document.body.style.cursor = "grabbing";
      } else {
        document.body.style.cursor = "grab";
      }
    },
    onMouseUp: (event) => {
      if (sparkling) {
        sparkling.destroy();
        sounds.sparkles.stop();
        document.body.style.cursor = "grab";
      }
    },
  });
});

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
