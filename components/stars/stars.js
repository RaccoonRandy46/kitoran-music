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

        this.x += canvas.width * 0.00015 * this.radius;
        while (this.x > canvas.width) this.x -= canvas.width;

        let y = this.y;
        y -= scroll * 0.15 * this.radius;
        while (y < 0) y += canvas.height;

        let dx = Math.abs(mouseX - this.x);
        let dy = Math.abs(mouseY - y);
        let dist = Math.sqrt(dx * dx + dy * dy);

        let alpha = this.alpha
        let mult = dist / 200;
        if (mult > 1) mult = 1;
        alpha *= mult;

        ctx.beginPath();
        ctx.arc(this.x, y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${getRGB()}, ${alpha})`;
        ctx.fill();

    }

}

function createStars() {

    let newStars = getStarCount() - stars.length;
    if (newStars == 0) return;

    if (newStars > 0) {
        for (let i = 0; i < newStars; i++) {
            stars.push(new Star());
        }
        return;
    }

    newStars *= -1;

    for (let i = 0; i < newStars; i++) {
        stars.pop();
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

    let prevWidth = canvas.width;
    let prevHeight = canvas.height;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let star of stars) {
        star.x = canvas.width * (star.x / prevWidth);
        star.y = canvas.height * (star.y / prevHeight);
    }

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