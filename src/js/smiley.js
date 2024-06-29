import Zdog from "zdog";

export class Smiley {
  constructor({
    element,
    size = 120,
    zoom = 1,
    foregroundColor = "#000000",
    backgroundColor = "#f7d247",
    drawOutline = false,
  }) {
    this.element = element;
    this.size = size;
    this.zoom = zoom;
    this.foregroundColor = foregroundColor;
    this.backgroundColor = backgroundColor;
    this.drawOutline = drawOutline;
    this.init();
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
      zoom: this.zoom,
    });

    if (this.drawOutline) {
      this.outline = new Zdog.Ellipse({
        addTo: this.illustration,
        width: this.size,
        height: this.size,
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
      stroke: this.size,
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
