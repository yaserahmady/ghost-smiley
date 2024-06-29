import "../../style.css";

import { Howl } from "howler";
import { Pane } from "tweakpane";

import { Smiley } from "./smiley.js";
import { Simulation } from "./simulation.js";
import { Sparkling } from "./sparkling.js";
import { randomInt, randomFloat } from "./random.js";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { CustomBounce } from "gsap-trial/CustomBounce";
import { Vector } from "matter-js";

gsap.registerPlugin(CustomEase, CustomBounce);

const PARAMS = {
  faceColor: "hsl(50deg, 100%, 50%)",
  randomColorOnBounce: false,
  sound: true,
  bounces: 0,
};

document.addEventListener("DOMContentLoaded", () => {
  document.body.style.cursor = "grab";

  const pane = new Pane();
  let faceColorPane = pane.addBinding(PARAMS, "faceColor", {
    label: "face color",
  });
  let randomColorOnBouncePane = pane.addBinding(PARAMS, "randomColorOnBounce", {
    label: "random color on bounce",
  });

  pane.addBinding(PARAMS, "sound");
  pane.addBinding(PARAMS, "bounces", {
    label: "bounces",
    step: 1,
    disabled: true,
  });

  const sounds = {
    bounce: new Howl({
      src: ["/bounce.mp3"],
      volume: 0.1,
    }),
    sparkles: new Howl({
      src: ["/sparkles.mp3"],
      volume: 0.3,
    }),
  };
  const mouse = new Mouse();

  const smileyContainer = document.querySelector("#smiley-container");
  const smiley = new Smiley({
    element: document.querySelector("canvas#zdog-canvas"),
    size: 120,
    backgroundColor: PARAMS.faceColor,
  });

  randomColorOnBouncePane.on("change", (value) => {
    if (value.value === false) {
      PARAMS.faceColor = "hsl(50deg, 100%, 50%)";
      pane.refresh();
    }
  });

  faceColorPane.on("change", (value) => {
    smiley.face.color = value.value;
  });

  let sparkling;

  const simulation = new Simulation({
    element: document.querySelector("canvas#matter-canvas"),
    ballSize:
      (smiley.face.stroke * smiley.illustration.zoom) / window.devicePixelRatio,
    onCollision: (event) => {
      const pairs = event.pairs;
      const a = pairs[0].bodyA;
      const b = pairs[0].bodyB;
      const strength = Vector.magnitude(a.velocity);

      console.log(strength);

      console.log(`Collision between ${a.label} and ${b.label}`);

      if (PARAMS.randomColorOnBounce) {
        PARAMS.faceColor = `hsl(${randomInt(0, 360)}, 100%, 50%)`;
        pane.refresh();
      }
      PARAMS.bounces++;
      pane.refresh();

      gsap.killTweensOf(smiley.element, "scale");
      gsap.set(smiley.element, {
        scaleX: 1,
        scaleY: 1,
      });

      const origin = {
        ceiling: "center top",
        ground: "center bottom",
        leftWall: "left center",
        rightWall: "right center",
      }[b.label];

      const squash = gsap.utils.mapRange(0, 50, 2, 1)(strength);
      const smallScale = gsap.utils.mapRange(0, 50, 0.6, 0.8)(strength);
      const bigScale = gsap.utils.mapRange(0, 50, 1.4, 1.6)(strength);

      console.log(squash, smallScale, bigScale);
      gsap.to(smiley.element, {
        scaleX:
          b.label === "ceiling" || b.label === "ground" ? bigScale : smallScale,
        scaleY:
          b.label === "ceiling" || b.label === "ground" ? smallScale : bigScale,
        ease: `bounce({strength: 0.7, squash: ${squash}, endAtStart: true})`,
        transformOrigin: origin,
      });

      if (PARAMS.sound) {
        sounds.bounce.rate(randomFloat(1.0, 1.2));
        sounds.bounce.play();
      }
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
        sparkling = new Sparkling({
          color: "hsl(50deg, 100%, 90%)",
          sizeMin: 30,
          sizeMax: 40,
        });
        if (PARAMS.sound) {
          sounds.sparkles.play();
        }
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

  simulation.ball.isStatic = true;

  const firstClick = () => {
    document.body.removeEventListener("mousedown", firstClick);
    simulation.ball.isStatic = false;
  };

  document.body.addEventListener("mousedown", firstClick);
});

class Mouse {
  constructor() {
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2;

    document.addEventListener("mousemove", (event) => {
      this.x = event.clientX;
      this.y = event.clientY;
    });

    document.addEventListener("mouseleave", () => {
      gsap.to(this, {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        duration: 0.5,
        ease: "power2.out",
      });
    });
  }
}
