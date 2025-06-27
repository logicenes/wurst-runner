const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const muteBtn = document.getElementById('muteBtn');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');

// Musik
const bgMusic = new Audio('audio/bauchnabel.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;
bgMusic.muted = false;
let musicStarted = false;

// Mute/Unmute
muteBtn.addEventListener('click', () => {
    bgMusic.muted = !bgMusic.muted;
    muteBtn.textContent = bgMusic.muted ? '🔇' : '🔊';
});

// Spiel-Logik
const gravity = 0.6;
let gameSpeed = 4;
let score = 0;
let gameOver = false;

const playerImg = new Image();
playerImg.src = 'css/images/skinny-player.png';
const hotdogImg = new Image();
hotdogImg.src = 'css/images/hotdog.png';
const hamburgerImg = new Image();
hamburgerImg.src = 'css/images/hamburger.png';
const chocolateImg = new Image();
chocolateImg.src = 'css/images/chocolate.png';
const backgroundImg = new Image();
backgroundImg.src = 'css/images/background.png';

const player = {
    x: 50,
    y: canvas.height - 80,
    width: 64,
    height: 40,
    dy: 0,
    jumpForce: 12,
    grounded: false,
    update(deltaTime) {
        if (!this.grounded) {
            this.dy += gravity * (deltaTime / 16.67);
        } else {
            this.dy = 0;
        }
        this.y += this.dy * (deltaTime / 16.67);

        if (this.y + this.height >= canvas.height - 20) {
            this.y = canvas.height - 20 - this.height;
            this.grounded = true;
        } else {
            this.grounded = false;
        }
    },
    draw() {
        ctx.drawImage(playerImg, this.x, this.y, this.width, this.height);
    },
    jump() {
        if (this.grounded) {
            this.dy = -this.jumpForce;
            this.grounded = false;
        }
    }
};

class Obstacle {
    constructor(x, width, height, type) {
        this.x = x;
        this.y = canvas.height - 20 - height;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    update(deltaTime) {
        this.x -= gameSpeed * (deltaTime / 16.67);
    }

    draw() {
        const img = {
            hotdog: hotdogImg,
            hamburger: hamburgerImg,
            chocolate: chocolateImg
        }[this.type];
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
    }
}

let obstacles = [];
let obstacleTimer = 0;
let spawnInterval = 1500;

function spawnObstacle() {
    const rand = Math.random();
    if (rand < 0.5) {
        obstacles.push(new Obstacle(canvas.width, 30, 30, 'hotdog'));
    } else if (rand < 0.8) {
        obstacles.push(new Obstacle(canvas.width, 30, 30, 'hamburger'));
    } else {
        obstacles.push(new Obstacle(canvas.width, 30, 30, 'chocolate'));
    }
}

function handleObstacles(deltaTime) {
    obstacleTimer -= deltaTime;
    if (obstacleTimer <= 0) {
        spawnObstacle();
        obstacleTimer = spawnInterval;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.update(deltaTime);

        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            if (obs.type === 'hotdog' || obs.type === 'hamburger') {
                score += 10;
                scoreDisplay.textContent = 'Score: ' + score;
                obstacles.splice(i, 1);
            } else if (obs.type === 'chocolate') {
                gameOver = true;
            }
        }

        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
        } else {
            obs.draw();
        }
    }
}

function drawBackground() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (gameOver) {
        finalScoreEl.textContent = 'Score: ' + score;
        gameOverEl.classList.remove('hidden');
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    player.update(deltaTime);
    player.draw();
    handleObstacles(deltaTime);

    requestAnimationFrame(gameLoop);
}

function startMusic() {
    if (!musicStarted) {
        bgMusic.play().catch(err => console.log('❌ Music error:', err));
        musicStarted = true;
    }
}

window.addEventListener('keydown', e => {
    startMusic();
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        player.jump();
    }
});

window.addEventListener('click', () => {
    startMusic();
});

let assetsLoaded = 0;
function startIfReady() {
    assetsLoaded++;
    if (assetsLoaded === 2) {
        // Warte auf Startbutton
    }
}

playerImg.onload = startIfReady;
backgroundImg.onload = startIfReady;

startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameOverEl.classList.add('hidden');
    score = 0;
    obstacleTimer = 0;
    obstacles = [];
    player.y = canvas.height - 80;
    player.dy = 0;
    gameOver = false;
    scoreDisplay.textContent = 'Score: 0';
    startMusic();
    requestAnimationFrame(gameLoop);
});

restartBtn.addEventListener('click', () => {
    startScreen.style.display = 'flex';
});
