const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gravity = 0.6;
let gameSpeed = 4;
let score = 0;
let gameOver = false;

const playerImg = new Image();
playerImg.src = 'css/images/skinny-player.png';

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
        this.type = type; // 'burger', 'chocolate', 'box'
    }
    update() {
        this.x -= gameSpeed;
    }
    draw() {
        if (this.type === 'burger') {
            ctx.fillStyle = 'orange';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else if (this.type === 'chocolate') {
            ctx.fillStyle = 'brown';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = 'gray';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

let obstacles = [];
let obstacleTimer = 0;
let spawnInterval = 90;

function spawnObstacle() {
    const rand = Math.random();
    if (rand < 0.5) {
        // box obstacle
        obstacles.push(new Obstacle(canvas.width, 40, 40, 'box'));
    } else if (rand < 0.75) {
        // burger collectible
        obstacles.push(new Obstacle(canvas.width, 30, 30, 'burger'));
    } else {
        // chocolate (danger)
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
            if (obs.type === 'burger') {
                score += 1;
                obstacles.splice(i, 1);
            } else if (obs.type === 'chocolate' || obs.type === 'box') {
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
    ctx.fillStyle = '#003';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // simple city skyline
    ctx.fillStyle = '#111';
    for (let i = 0; i < canvas.width; i += 50) {
        const buildingHeight = 50 + Math.random() * 100;
        ctx.fillRect(i, canvas.height - buildingHeight - 20, 40, buildingHeight);
    }
    ctx.fillStyle = '#222';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20); // ground
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 25);
}

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Score: ' + score, canvas.width / 2 - 40, canvas.height / 2 + 40);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    player.update();
    player.draw();
    handleObstacles();
    drawScore();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        player.jump();
    }
});

playerImg.onload = () => {
    gameLoop();
};
