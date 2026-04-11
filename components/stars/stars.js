const rootStyles = getComputedStyle(document.documentElement);

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];
const minSize = 1.5;
const maxSize = 2;

let rgb = null;

let scroll = 0;

let mouseX = 0;
let mouseY = 0;

function getRGB() {

    if (rgb != null) return rgb;

    rgb = rootStyles.getPropertyValue('--accent-brighter').trim();
    rgb = rgb.substring(4, rgb.length - 1);

    return rgb;

}

function getStarCount() {
    return Math.floor(canvas.width * canvas.height / 10000);
}

class Star {

    constructor() {
        this.reset();
    }

    reset() {

        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * (maxSize - minSize) + minSize;
        this.alpha = Math.random();
        this.speed = Math.random() * 0.02;

    }

    update() {

        this.alpha += this.speed;

        if (this.alpha >= 1 || this.alpha <= 0) {
            this.speed = -this.speed;
        }

    }

    draw() {

        let x = this.x;
        let loopTime = (canvas.width / 500) * 60000;
        let xMult = Date.now() % loopTime / loopTime;
        x += canvas.width * xMult * this.radius;
        while (x > canvas.width) x -= canvas.width;

        let y = this.y;
        y -= scroll * 0.15 * this.radius;
        while (y < 0) y += canvas.height;

        let dx = Math.abs(mouseX - x);
        let dy = Math.abs(mouseY - y);
        let dist = Math.sqrt(dx * dx + dy * dy);

        let alpha = this.alpha
        let mult = dist / 200;
        if (mult > 1) mult = 1;
        alpha *= mult;

        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${getRGB()}, ${alpha})`;
        ctx.fill();

    }

}

function createStars() {

    stars.length = 0;

    for (let i = 0; i < getStarCount(); i++) {
        stars.push(new Star());
    }

}

function animate() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let star of stars) {
        star.update();
        star.draw();
    }

    requestAnimationFrame(animate);

}

createStars();
animate();

window.addEventListener("resize", () => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    createStars();

});

window.addEventListener("scroll", () => {
    scroll = window.scrollY;
});

window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});