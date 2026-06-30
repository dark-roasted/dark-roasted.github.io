const canvas = document.getElementById('void-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random();
        this.fadeSpeed = (Math.random() * 0.02) + 0.005;
        this.fadingOut = Math.random() > 0.5;
        this.color = Math.random() > 0.95 ? '176, 11, 11' : '255, 255, 255';
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        if (this.fadingOut) {
            this.opacity -= this.fadeSpeed;
            if (this.opacity <= 0.1) this.fadingOut = false;
        } else {
            this.opacity += this.fadeSpeed;
            if (this.opacity >= 1) this.fadingOut = true;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const particleCount = Math.floor((width * height) / 8000);
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    resize();
    initParticles();
});

resize();
initParticles();
animate();

async function fetchAthenaData() {
    try {
        const response = await fetch('https://discord.com/api/guilds/1506305604254306364/widget.json');
        const data = await response.json();
        const titleEl = document.getElementById('athena-title');
        if (data.name) {
            titleEl.textContent = data.name;
        }
    } catch (error) {}
}

fetchAthenaData();
