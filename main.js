class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        let m = this.mag();
        if (m !== 0) {
            this.mult(1 / m);
        }
        return this;
    }
    clone() {
        return new Vector(this.x, this.y);
    }
    dist(v) {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class Perlin {
    constructor() {
        this.p = new Uint8Array(512);
        this.permutation = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = Math.floor(Math.random() * 256);
        }
        for (let i = 0; i < 512; i++) {
            this.p[i] = this.permutation[i % 256];
        }
    }
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    grad(hash, x, y, z) {
        let h = hash & 15;
        let u = h < 8 ? x : y;
        let v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    noise(x, y, z) {
        let X = Math.floor(x) & 255;
        let Y = Math.floor(y) & 255;
        let Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        let u = this.fade(x);
        let v = this.fade(y);
        let w = this.fade(z);
        let A = this.p[X] + Y, AA = this.p[A] + Z, AB = this.p[A + 1] + Z;
        let B = this.p[X + 1] + Y, BA = this.p[B] + Z, BB = this.p[B + 1] + Z;
        return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z),
            this.grad(this.p[BA], x - 1, y, z)),
            this.lerp(u, this.grad(this.p[AB], x, y - 1, z),
                this.grad(this.p[BB], x - 1, y - 1, z))),
            this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1),
                this.grad(this.p[BA + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1),
                    this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
    }
}

class Spring {
    constructor(val, stiffness, damping) {
        this.val = val;
        this.target = val;
        this.vel = 0;
        this.stiffness = stiffness;
        this.damping = damping;
    }
    update() {
        let force = (this.target - this.val) * this.stiffness;
        this.vel = (this.vel + force) * this.damping;
        this.val += this.vel;
        return this.val;
    }
}

class FluidAmbient {
    constructor() {
        this.canvas = document.getElementById('ambient-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.perlin = new Perlin();
        this.zOff = 0;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.render();
    }
    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.cols = Math.floor(this.width / 40);
        this.rows = Math.floor(this.height / 40);
    }
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#080607';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        let yOff = 0;
        for (let y = 0; y < this.rows; y++) {
            let xOff = 0;
            for (let x = 0; x < this.cols; x++) {
                let angle = this.perlin.noise(xOff, yOff, this.zOff) * Math.PI * 4;
                let v = new Vector(Math.cos(angle), Math.sin(angle));
                let px = x * 40;
                let py = y * 40;
                let intensity = (this.perlin.noise(xOff + 10, yOff + 10, this.zOff) + 1) / 2;
                
                this.ctx.beginPath();
                this.ctx.moveTo(px, py);
                this.ctx.lineTo(px + v.x * 30 * intensity, py + v.y * 30 * intensity);
                this.ctx.strokeStyle = `rgba(123,43,54, ${intensity * 0.13})`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                xOff += 0.08;
            }
            yOff += 0.08;
        }
        this.zOff += 0.002;
        requestAnimationFrame(() => this.render());
    }
}

class MagneticElements {
    constructor() {
        this.elements = document.querySelectorAll('.magnetic-el');
        this.elements.forEach(el => this.bindEvents(el));
    }
    bindEvents(el) {
        let bounding = el.getBoundingClientRect();
        window.addEventListener('resize', () => { bounding = el.getBoundingClientRect(); });
        
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = `translate3d(0px, 0px, 0)`;
            el.style.background = '';
            el.style.borderColor = '';
        });
    }
}

class TiltCards {
    constructor() {
        this.cards = document.querySelectorAll('.interact-card');
        this.cards.forEach(card => this.bindEvents(card));
    }
    bindEvents(card) {
        card.addEventListener('mousemove', (e) => {
            let rect = card.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            let cx = rect.width / 2;
            let cy = rect.height / 2;
            let rx = (cy - y) / 25;
            let ry = (x - cx) / 25;
            card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    }
}

class TextScrambler {
    constructor() {
        this.element = document.querySelector('.scramble-text');
        this.chars = '!<>-_\\\\/[]{}—=+*^?#_ЖЗЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
        this.original = this.element.getAttribute('data-value');
        this.frame = 0;
        this.queue = [];
        
        this.element.addEventListener('mouseenter', () => this.scramble());
    }
    scramble() {
        this.queue = [];
        for (let i = 0; i < this.original.length; i++) {
            let start = Math.floor(Math.random() * 20);
            let end = start + Math.floor(Math.random() * 20);
            this.queue.push({
                char: this.original[i],
                start: start,
                end: end,
                curr: 0
            });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0; i < this.queue.length; i++) {
            let { char, start, end } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += char;
            } else if (this.frame >= start) {
                output += this.chars[Math.floor(Math.random() * this.chars.length)];
            } else {
                output += char;
            }
        }
        this.element.innerText = output;
        if (complete === this.queue.length) {
            return;
        }
        this.frameRequest = requestAnimationFrame(() => {
            this.frame++;
            this.update();
        });
    }
}

class SpotifyWave {
    constructor() {
        this.canvas = document.getElementById('spotify-wave-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.bars = [];
        this.time = 0;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initBars();
        this.render();
    }
    resize() {
        let rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = rect.width;
        this.height = rect.height;
        this.initBars();
    }
    initBars() {
        this.bars = [];
        let numBars = Math.floor(this.width / 8);
        for (let i = 0; i < numBars; i++) {
            this.bars.push({
                x: i * 8 + 2,
                w: 4,
                h: 5,
                tH: 5,
                speed: Math.random() * 0.1 + 0.05
            });
        }
    }
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.time += 0.03;
        
        for (let i = 0; i < this.bars.length; i++) {
            let b = this.bars[i];
            let noise = Math.sin(i * 0.2 + this.time) * Math.cos(i * 0.1 - this.time * 0.5);
            b.tH = Math.abs(noise) * (this.height - 10) + 5;
            b.h += (b.tH - b.h) * b.speed;
            
            let y = (this.height - b.h) / 2;
            let grad = this.ctx.createLinearGradient(b.x, y, b.x, y + b.h);
            grad.addColorStop(0, '#a63b49');
            grad.addColorStop(1, '#47242b');
            
            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.roundRect(b.x, y, b.w, b.h, 2);
            this.ctx.fill();
        }
        requestAnimationFrame(() => this.render());
    }
}

const app = {
    init() {
        this.ambient = new FluidAmbient();
        this.magnetic = new MagneticElements();
        this.tilts = new TiltCards();
        this.scrambler = new TextScrambler();
        this.wave = new SpotifyWave();
    }
};

window.addEventListener('DOMContentLoaded', () => app.init());
