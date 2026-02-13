const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 700;
document.body.appendChild(canvas);

const game = {
    age: 10,
    month: 1,
    gold: 500,
    stats: {
        strength: 10,
        intelligence: 10,
        charm: 10,
        magic: 10,
        morality: 50,
        stress: 0
    },
    activities: [
        {name: 'Study', cost: 20, effects: {intelligence: 5, stress: 3}},
        {name: 'Combat Training', cost: 30, effects: {strength: 5, stress: 4}},
        {name: 'Dance Class', cost: 25, effects: {charm: 5, stress: 2}},
        {name: 'Magic School', cost: 40, effects: {magic: 5, stress: 3}},
        {name: 'Church Work', cost: 0, effects: {morality: 5, gold: 10, stress: 2}},
        {name: 'Rest', cost: 0, effects: {stress: -15}}
    ],
    selectedActivity: null
};

function drawCharacter() {
    ctx.fillStyle = '#FFE4C4';
    ctx.beginPath();
    ctx.arc(300, 150, 40, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(260, 100, 80, 30);
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(285, 145, 5, 0, Math.PI * 2);
    ctx.arc(315, 145, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(300, 155, 15, 0, Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(270, 190, 60, 80);
    ctx.fillRect(250, 200, 20, 60);
    ctx.fillRect(330, 200, 20, 60);
    ctx.fillRect(270, 270, 25, 60);
    ctx.fillRect(305, 270, 25, 60);
}

function drawUI() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFB6C1';
    ctx.fillRect(0, 0, canvas.width, 60);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Princess Maker', 20, 40);
    
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText(`Age: ${game.age} | Month: ${game.month}/12 | Gold: ${game.gold}`, 20, 90);
    
    drawCharacter();
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Stats:', 20, 360);
    
    let y = 390;
    for (let [stat, value] of Object.entries(game.stats)) {
        const color = stat === 'stress' ? (value > 70 ? '#f00' : '#ff8800') : '#4CAF50';
        ctx.fillStyle = '#000';
        ctx.fillText(`${stat.charAt(0).toUpperCase() + stat.slice(1)}:`, 20, y);
        
        ctx.fillStyle = '#ddd';
        ctx.fillRect(150, y - 15, 200, 20);
        ctx.fillStyle = color;
        ctx.fillRect(150, y - 15, Math.min(value * 2, 200), 20);
        ctx.fillStyle = '#000';
        ctx.fillText(value, 360, y);
        y += 30;
    }
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Activities:', 20, y + 20);
    
    y += 50;
    game.activities.forEach((activity, i) => {
        const isHovered = game.selectedActivity === i;
        ctx.fillStyle = isHovered ? '#FFB6C1' : '#E8E8E8';
        ctx.fillRect(20, y, 560, 40);
        
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.fillText(activity.name, 30, y + 25);
        ctx.fillText(`Cost: ${activity.cost}g`, 450, y + 25);
        
        activity.rect = {x: 20, y: y, w: 560, h: 40};
        y += 45;
    });
}

function doActivity(activity) {
    if (game.gold < activity.cost) return;
    
    game.gold -= activity.cost;
    for (let [stat, change] of Object.entries(activity.effects)) {
        if (stat === 'gold') {
            game.gold += change;
        } else {
            game.stats[stat] = Math.max(0, Math.min(100, game.stats[stat] + change));
        }
    }
    
    game.month++;
    if (game.month > 12) {
        game.month = 1;
        game.age++;
        game.gold += 200;
    }
    
    if (game.age >= 18) {
        endGame();
    }
}

function endGame() {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Your Daughter Has Grown Up!', canvas.width/2, 200);
    
    ctx.font = '20px Arial';
    let ending = 'Commoner';
    if (game.stats.magic > 60) ending = 'Court Wizard';
    else if (game.stats.strength > 60) ending = 'Knight';
    else if (game.stats.intelligence > 60) ending = 'Scholar';
    else if (game.stats.charm > 60) ending = 'Princess';
    
    ctx.fillText(`Ending: ${ending}`, canvas.width/2, 280);
    ctx.font = '16px Arial';
    ctx.fillText('Refresh to play again', canvas.width/2, 350);
    ctx.textAlign = 'left';
}

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    game.selectedActivity = null;
    game.activities.forEach((activity, i) => {
        if (activity.rect && x >= activity.rect.x && x <= activity.rect.x + activity.rect.w &&
            y >= activity.rect.y && y <= activity.rect.y + activity.rect.h) {
            game.selectedActivity = i;
        }
    });
    drawUI();
});

canvas.addEventListener('click', e => {
    if (game.age >= 18) return;
    if (game.selectedActivity !== null) {
        doActivity(game.activities[game.selectedActivity]);
        drawUI();
    }
});

drawUI();
