// particle.js
const container = document.getElementById("particle-container");
const mouse = { x: null, y: null };
const particles = [];
const imageWidth = container.offsetWidth;
const imageHeight = container.offsetHeight;

// create particles from the image pixels
function createParticles() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = imageWidth;
  canvas.height = imageHeight;
  context.drawImage(container.querySelector(".particle-image"), 0, 0, imageWidth, imageHeight);
  const imageData = context.getImageData(0, 0, imageWidth, imageHeight);

  for (let y = 0; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      const index = (y * imageWidth + x) * 4;
      const alpha = imageData.data[index + 3];
      if (alpha > 0) {
        const particle = new Particle(x, y, imageData.data.slice(index, index + 4));
        particles.push(particle);
        container.appendChild(particle.element);
      }
    }
  }
}

// update the particles positions and styles
function updateParticles() {
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });
}

// get the mouse position relative to the container
function getMousePosition(event) {
  const rect = container.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
}

// a class for each particle
class Particle {
  constructor(x, y, color) {
    this.x = x; // initial x position
    this.y = y; // initial y position
    this.color = color; // color of the particle
    this.speedX = Math.random() * 2 - 1; // random horizontal speed
    this.speedY = Math.random() * -2 - .5; // random vertical speed
    this.gravity = .05; // gravity force
    this.friction = .99; // friction force
    this.radius = Math.random() * .5 + .5; // random radius
    this.element = document.createElement("div"); // the html element of the particle
    this.element.classList.add("particle");
    this.element.style.backgroundColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`;
    this.element.style.width = `${this.radius * 2}px`;
    this.element.style.height = `${this.radius * 2}px`;
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    this.distanceToMouse = Infinity; // distance from the mouse pointer
    this.attractedToMouse = false; // whether the particle is attracted to the mouse or not
    this.attractForce = .1; // attraction force to the mouse
    this.repelForce = .5; // repulsion force from the mouse
    this.repelRadius = Math.random() * .5 + .5; // repulsion radius from the mouse
    this.attractRadius = Math.random() * .5 + .5; // attraction radius to the mouse
    this.angleToMouse = null; // angle between the particle and the mouse pointer
    this.maxSpeedX = Math.random() * .5 + .5; // maximum horizontal speed when attracted to the mouse
    this.maxSpeedY = Math.random() * .5 + .5; // maximum vertical speed when attracted to the mouse
    this.minSpeedX = Math.random() * -.5 - .5; // minimum horizontal speed when attracted to the mouse
    this.minSpeedY = Math.random() * -.5 - .5; // minimum vertical speed when attracted to the mouse
    this.bounce = .8; // bounce force when hitting the container edges
  }

  // update the particle state
  update() {
    // calculate the distance and angle to the mouse pointer
    this.distanceToMouse = Math.hypot(this.x - mouse.x, this.y - mouse.y);
    this.angleToMouse = Math.atan2(this.y - mouse.y, this.x - mouse.x);

    // check if the particle is within the attraction radius of the mouse
    if (this.distanceToMouse < this.attractRadius * 100) {
      this.attractedToMouse = true;
    }

    // check if the particle is within the repulsion radius of the mouse
    if (this.distanceToMouse < this.repelRadius * 100) {
      this.attractedToMouse = false;
      // apply a repulsion force away from the mouse
      this.speedX += Math.cos(this.angleToMouse) * this.repelForce;
      this.speedY += Math.sin(this.angleToMouse) * this.repelForce;
    }

    // if the particle is attracted to the mouse
    if (this.attractedToMouse) {
      // apply an attraction force towards the mouse
      this.speedX -= Math.cos(this.angleToMouse) * this.attractForce;
      this.speedY -= Math.sin(this.angleToMouse) * this.attractForce;
      // limit the speed to a range
      this.speedX = Math.max(Math.min(this.speedX, this.maxSpeedX), this.minSpeedX);
      this.speedY = Math.max(Math.min(this.speedY, this.maxSpeedY), this.minSpeedY);
    } else {
      // apply gravity and friction to the speed
      this.speedY += this.gravity;
      this.speedX *= this.friction;
      this.speedY *= this.friction;
    }

    // update the position by adding the speed
    this.x += this.speedX;
    this.y += this.speedY;

    // check if the particle hits the left or right edge of the container
    if (this.x + this.radius > imageWidth || this.x - this.radius < 0) {
      // reverse the horizontal speed and apply bounce force
      this.speedX = -this.speedX * this.bounce;
    }

    // check if the particle hits the top or bottom edge of the container
    if (this.y + this.radius > imageHeight || this.y - this.radius < 0) {
      // reverse the vertical speed and apply bounce force
      this.speedY = -this.speedY * this.bounce;
    }
  }

  // draw the particle on the screen
  draw() {
    // set the element style to match the particle state
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }
}

// create particles when the window is loaded
window.addEventListener("load", createParticles);

// update and draw particles on every animation frame
window.requestAnimationFrame(function loop() {
  updateParticles();
  window.requestAnimationFrame(loop);
});

// get mouse position on every mouse move event
window.addEventListener("mousemove", getMousePosition);
