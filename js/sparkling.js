class Sparkling {
  // https://www.joshwcomeau.com/react/animated-sparkles-in-react/
  // https://web.archive.org/web/20210417050209/https://renerehme.dev/blog/animated-sparkles-in-jquery
  constructor(color = "hsl(50deg, 100%, 50%)") {
    this.color = color;
    this.svgPath =
      "M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z";
    this.sparkle();
  }

  sparkle() {
    document.querySelectorAll(".sparkling").forEach((item) => {
      let sparklingElement = item;
      let stars = sparklingElement.querySelectorAll(".star");

      // remove the first star when more than 6 stars existing
      if (stars.length > 6) {
        stars.forEach(function (star, index) {
          if (index === 0) {
            star.remove();
          }
        });
      }

      // add a new star
      sparklingElement.insertAdjacentHTML("beforeend", this.addStar());
    });

    this.timeout = setTimeout(this.sparkle.bind(this), this.random(100, 300));
  }

  destroy() {
    clearTimeout(this.timeout);

    document.querySelectorAll(".sparkling").forEach((item) => {
      item.innerHTML = "";
    });
  }

  /**
   * Returns a random number between min (inclusive) and max (inclusive)
   */
  random = (min, max) => Math.floor(Math.random() * (max + 1 - min)) + min;

  addStar() {
    const size = this.random(20, 30);

    const offset = 0;
    const top = this.random(0 - offset, 100 + offset);
    const left = this.random(0 - offset, 100 + offset);

    return `
      <span class="star" style="top: ${top}%; left: ${left}%; color: ${this.color}">
        <svg width="${size}" height="${size}" viewBox="0 0 160 160" fill="none">
          <path d="${this.svgPath}" fill="currentColor" />
        </svg>
      </span>
    `;
  }
}
