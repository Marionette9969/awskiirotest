const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

const map = [
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1],
    [1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1]
];

const player = {
    x: 2.5, y: 2.5, angle: 0, speed: 0.05, rotSpeed: 0.05
};

const enemies = [
    {x: 4.5, y: 3.5, health: 100, dead: false},
    {x: 5.5, y: 4.5, health: 100, dead: false}
];

const keys = {};
let shooting = false;

function castRay(angle) {
    const sin = Math.sin(angle), cos = Math.cos(angle);
    let x = player.x, y = player.y;
    
    for (let i = 0; i < 20; i += 0.1) {
        x += cos * 0.1;
        y += sin * 0.1;
        const mx = Math.floor(x), my = Math.floor(y);
        if (map[my] && map[my][mx] === 1) return Math.sqrt((x-player.x)**2 + (y-player.y)**2);
    }
    return 20;
}

function render() {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    ctx.fillStyle = '#555';
    ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);
    
    const fov = Math.PI / 3;
    const rays = canvas.width;
    
    for (let i = 0; i < rays; i++) {
        const rayAngle = player.angle - fov/2 + (i/rays) * fov;
        const dist = castRay(rayAngle);
        const wallHeight = (canvas.height / dist) * 0.5;
        const brightness = Math.max(50, 255 - dist * 30);
        
        ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
        ctx.fillRect(i, canvas.height/2 - wallHeight/2, 1, wallHeight);
    }
    
    enemies.forEach(e => {
        if (e.dead) return;
        const dx = e.x - player.x, dy = e.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx) - player.angle;
        
        if (Math.abs(angle) < fov/2 && dist < 10) {
            const screenX = (angle / fov + 0.5) * canvas.width;
            const size = (canvas.height / dist) * 0.3;
            ctx.fillStyle = '#f00';
            ctx.fillRect(screenX - size/2, canvas.height/2 - size/2, size, size);
        }
    });
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(canvas.width/2 - 2, canvas.height/2 - 10, 4, 20);
    ctx.fillRect(canvas.width/2 - 10, canvas.height/2 - 2, 20, 4);
}

function shoot() {
    if (shooting) return;
    shooting = true;
    setTimeout(() => shooting = false, 300);
    
    enemies.forEach(e => {
        if (e.dead) return;
        const dx = e.x - player.x, dy = e.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx) - player.angle;
        
        if (Math.abs(angle) < 0.1 && dist < 10) {
            e.health -= 50;
            if (e.health <= 0) e.dead = true;
        }
    });
}

function update() {
    if (keys['w']) {
        const nx = player.x + Math.cos(player.angle) * player.speed;
        const ny = player.y + Math.sin(player.angle) * player.speed;
        if (!map[Math.floor(ny)][Math.floor(nx)]) {
            player.x = nx;
            player.y = ny;
        }
    }
    if (keys['s']) {
        const nx = player.x - Math.cos(player.angle) * player.speed;
        const ny = player.y - Math.sin(player.angle) * player.speed;
        if (!map[Math.floor(ny)][Math.floor(nx)]) {
            player.x = nx;
            player.y = ny;
        }
    }
    if (keys['a']) player.angle -= player.rotSpeed;
    if (keys['d']) player.angle += player.rotSpeed;
    
    render();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') shoot();
});
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
canvas.addEventListener('click', shoot);

update();
