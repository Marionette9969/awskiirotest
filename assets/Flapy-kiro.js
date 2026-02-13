
// Flappy Kiro - A retro endless scroller game
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;
document.body.appendChild(canvas);

// Game variables
const game = {
    gravity: 0.5,
    jumpPower: -8,
    pipeSpeed: 2,
    pipeGap: 150,
    pipeWidth: 50,
    score: 0,
    gameOver: false,
    started: false
};

// Ghost character (Kiro)
const kiro = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    
    update() {
        if (game.started) {
            this.velocity += game.gravity;
            this.y += this.velocity;
            
            // Keep Kiro within canvas bounds
            if (this.y < 0) this.y = 0;
            if (this.y > canvas.height - this.height) {
                this.y = canvas.height - this.height;
                game.gameOver = true;
            }
        }
    },
    
    jump() {
        this.velocity = game.jumpPower;
    },
    
    draw() {
        // Draw ghost body (white circle with transparency)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw ghost tail (wavy bottom)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height/2);
        ctx.lineTo(this.x, this.y + this.height - 5);
        ctx.lineTo(this.x + 5, this.y + this.height);
        ctx.lineTo(this.x + 10, this.y + this.height - 5);
        ctx.lineTo(this.x + 15, this.y + this.height);
        ctx.lineTo(this.x + 20, this.y + this.height - 5);
        ctx.lineTo(this.x + 25, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height - 5);
        ctx.lineTo(this.x + this.width, this.y + this.height/2);
        ctx.fill();
        
        // Draw eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y + 10, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 22, this.y + 10, 3, 0, Math.PI * 2);
        ctx.fill();
    }
};

// Pipes array
const pipes = [];

class Pipe {
    constructor(x) {
        this.x = x;
        this.topHeight = Math.random() * (canvas.height - game.pipeGap - 100) + 50;
        this.bottomY = this.topHeight + game.pipeGap;
        this.passed = false;
    }
    
    update() {
        this.x -= game.pipeSpeed;
    }
    
    draw() {
        // Draw top pipe
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x, 0, game.pipeWidth, this.topHeight);
        
        // Draw bottom pipe
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x, this.bottomY, game.pipeWidth, canvas.height - this.bottomY);
        
        // Draw pipe borders
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, 0, game.pipeWidth, this.topHeight);
        ctx.strokeRect(this.x, this.bottomY, game.pipeWidth, canvas.height - this.bottomY);
    }
    
    checkCollision() {
        if (kiro.x < this.x + game.pipeWidth &&
            kiro.x + kiro.width > this.x &&
            (kiro.y < this.topHeight || kiro.y + kiro.height > this.bottomY)) {
            return true;
        }
        return false;
    }
    
    checkScore() {
        if (!this.passed && kiro.x > this.x + game.pipeWidth) {
            this.passed = true;
            game.score++;
        }
    }
}

// Game functions
function spawnPipe() {
    pipes.push(new Pipe(canvas.width));
}

function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].update();
        pipes[i].checkScore();
        
        if (pipes[i].checkCollision()) {
            game.gameOver = true;
        }
        
        // Remove pipes that are off screen
        if (pipes[i].x + game.pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8E8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(game.score, canvas.width / 2, 50);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeText(game.score, canvas.width / 2, 50);
}

function drawStartScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Flappy Kiro', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = '18px Arial';
    ctx.fillText('Click or Press Space to Start', canvas.width / 2, canvas.height / 2 + 20);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = '18px Arial';
    ctx.fillText(`Score: ${game.score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText('Click or Press Space to Restart', canvas.width / 2, canvas.height / 2 + 40);
}

function resetGame() {
    kiro.y = canvas.height / 2;
    kiro.velocity = 0;
    pipes.length = 0;
    game.score = 0;
    game.gameOver = false;
    game.started = true;
}

// Game loop
let lastPipeTime = 0;
function gameLoop() {
    drawBackground();
    
    if (!game.started) {
        kiro.draw();
        drawStartScreen();
    } else if (game.gameOver) {
        // Draw final frame
        pipes.forEach(pipe => pipe.draw());
        kiro.draw();
        drawScore();
        drawGameOver();
    } else {
        // Update game objects
        kiro.update();
        updatePipes();
        
        // Spawn new pipes
        if (Date.now() - lastPipeTime > 2000) {
            spawnPipe();
            lastPipeTime = Date.now();
        }
        
        // Draw everything
        pipes.forEach(pipe => pipe.draw());
        kiro.draw();
        drawScore();
    }
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
function handleInput() {
    if (!game.started || game.gameOver) {
        if (game.gameOver) {
            resetGame();
        } else {
            game.started = true;
            lastPipeTime = Date.now();
        }
    } else {
        kiro.jump();
    }
}

canvas.addEventListener('click', handleInput);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        handleInput();
    }
});

// Start the game
gameLoop();