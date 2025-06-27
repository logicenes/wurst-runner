const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

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
    update() {
        if (!this.grounded) {
            this.dy += gravity;
        } else {
            this.dy = 0;
        }
        this.y += this.dy;
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
        this.type = type; // 'hotdog', 'hamburger', 'chocolate'
    }
    update() {
        this.x -= gameSpeed;
    }
    draw() {
        if (this.type === 'hotdog') {
            ctx.drawImage(hotdogImg, this.x, this.y, this.width, this.height);
        } else if (this.type === 'hamburger') {
            ctx.drawImage(hamburgerImg, this.x, this.y, this.width, this.height);
        } else if (this.type === 'chocolate') {
            ctx.drawImage(chocolateImg, this.x, this.y, this.width, this.height);
        }
    }
}

let obstacles = [];
let obstacleTimer = 0;
let spawnInterval = 90;

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

function handleObstacles() {
    if (obstacleTimer <= 0) {
        spawnObstacle();
        obstacleTimer = spawnInterval;
    } else {
        obstacleTimer--;
    }
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.update();

        // collision
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
        }
        obs.draw();
    }
}

function drawBackground() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}


function gameLoop() {
    if (gameOver) {
        finalScoreEl.textContent = 'Score: ' + score;
        gameOverEl.classList.remove('hidden');
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    player.update();
    player.draw();
    handleObstacles();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        player.jump();
    }
});

let assetsLoaded = 0;
function startIfReady() {
    assetsLoaded++;
    if (assetsLoaded === 2) {
        scoreDisplay.textContent = 'Score: ' + score;
        gameLoop();
    }
}

playerImg.onload = startIfReady;
backgroundImg.onload = startIfReady;

restartBtn.addEventListener('click', () => {
    score = 0;
    scoreDisplay.textContent = 'Score: ' + score;
    obstacles = [];
    obstacleTimer = 0;
    player.y = canvas.height - 80;
    player.dy = 0;
    gameOver = false;
    gameOverEl.classList.add('hidden');
    gameLoop();
});