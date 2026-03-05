const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 画布设置
const GRID_SIZE = 32;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// 游戏状态
let mode = 'edit'; // 'edit' or 'test'
let currentTool = 'platform';
let objects = [];
let player = null;

// 玩家物理
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const MAX_FALL_SPEED = 15;

// 初始化玩家
function createPlayer(x, y) {
    return {
        x: x,
        y: y,
        width: 24,
        height: 32,
        vx: 0,
        vy: 0,
        onGround: false,
        alive: true
    };
}

// 工具选择
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
    });
});

// 画布交互
let isDrawing = false;
let lastGridX = -1;
let lastGridY = -1;

canvas.addEventListener('mousedown', (e) => {
    if (mode === 'edit') {
        isDrawing = true;
        handleDraw(e);
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (CANVAS_WIDTH / rect.width) / GRID_SIZE);
    const y = Math.floor((e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height) / GRID_SIZE);
    
    document.getElementById('posText').textContent = `网格: ${x}, ${y}`;
    
    if (mode === 'edit' && isDrawing) {
        handleDraw(e);
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    lastGridX = -1;
    lastGridY = -1;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
    lastGridX = -1;
    lastGridY = -1;
});

function handleDraw(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (CANVAS_WIDTH / rect.width) / GRID_SIZE) * GRID_SIZE;
    const y = Math.floor((e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height) / GRID_SIZE) * GRID_SIZE;
    const gridX = x / GRID_SIZE;
    const gridY = y / GRID_SIZE;
    
    if (gridX === lastGridX && gridY === lastGridY) return;
    lastGridX = gridX;
    lastGridY = gridY;
    
    if (currentTool === 'erase') {
        objects = objects.filter(obj => !(obj.x === x && obj.y === y));
    } else {
        // 移除同位置的旧对象
        objects = objects.filter(obj => !(obj.x === x && obj.y === y));
        
        // 特殊处理：出生点和终点只能有一个
        if (currentTool === 'spawn') {
            objects = objects.filter(obj => obj.type !== 'spawn');
        } else if (currentTool === 'goal') {
            objects = objects.filter(obj => obj.type !== 'goal');
        }
        
        objects.push({ type: currentTool, x, y });
    }
    
    render();
}

// 渲染
function render() {
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制网格
    if (mode === 'edit') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }
    }
    
    // 绘制对象
    objects.forEach(obj => {
        switch(obj.type) {
            case 'platform':
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(obj.x, obj.y, GRID_SIZE, GRID_SIZE);
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                ctx.strokeRect(obj.x, obj.y, GRID_SIZE, GRID_SIZE);
                break;
            case 'spike':
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.moveTo(obj.x, obj.y + GRID_SIZE);
                ctx.lineTo(obj.x + GRID_SIZE/2, obj.y);
                ctx.lineTo(obj.x + GRID_SIZE, obj.y + GRID_SIZE);
                ctx.closePath();
                ctx.fill();
                break;
            case 'coin':
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(obj.x + GRID_SIZE/2, obj.y + GRID_SIZE/2, GRID_SIZE/3, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffaa00';
                ctx.lineWidth = 2;
                ctx.stroke();
                break;
            case 'spawn':
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(obj.x + 4, obj.y, GRID_SIZE - 8, GRID_SIZE);
                ctx.fillStyle = '#000';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('S', obj.x + GRID_SIZE/2, obj.y + GRID_SIZE/2 + 7);
                break;
            case 'goal':
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(obj.x, obj.y, GRID_SIZE, GRID_SIZE);
                ctx.fillStyle = '#000';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('★', obj.x + GRID_SIZE/2, obj.y + GRID_SIZE/2 + 7);
                break;
        }
    });
    
    // 绘制玩家
    if (mode === 'test' && player && player.alive) {
        ctx.fillStyle = player.onGround ? '#0066ff' : '#00aaff';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.strokeStyle = '#003399';
        ctx.lineWidth = 2;
        ctx.strokeRect(player.x, player.y, player.width, player.height);
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.fillRect(player.x + 6, player.y + 8, 5, 5);
        ctx.fillRect(player.x + 13, player.y + 8, 5, 5);
    }
}

// 测试模式
document.getElementById('testBtn').addEventListener('click', () => {
    const spawn = objects.find(obj => obj.type === 'spawn');
    if (!spawn) {
        alert('请先放置出生点（绿色S）');
        return;
    }
    
    mode = 'test';
    player = createPlayer(spawn.x + 4, spawn.y);
    document.getElementById('testBtn').style.display = 'none';
    document.getElementById('editBtn').style.display = 'inline-block';
    document.getElementById('modeText').textContent = '测试模式 - WASD/方向键移动，空格跳跃';
    canvas.style.cursor = 'default';
    
    gameLoop();
});

document.getElementById('editBtn').addEventListener('click', () => {
    mode = 'edit';
    player = null;
    document.getElementById('testBtn').style.display = 'inline-block';
    document.getElementById('editBtn').style.display = 'none';
    document.getElementById('modeText').textContent = '编辑模式';
    canvas.style.cursor = 'crosshair';
    render();
});

// 键盘控制
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (mode === 'test' && (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        if (player && player.onGround && player.alive) {
            player.vy = JUMP_FORCE;
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 碰撞检测
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 游戏循环
function gameLoop() {
    if (mode !== 'test' || !player || !player.alive) return;
    
    // 移动
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.vx = -MOVE_SPEED;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.vx = MOVE_SPEED;
    } else {
        player.vx = 0;
    }
    
    // 重力
    player.vy += GRAVITY;
    if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;
    
    // 水平移动
    player.x += player.vx;
    
    // 边界检测
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.width;
    
    // 垂直移动和碰撞
    player.y += player.vy;
    player.onGround = false;
    
    // 平台碰撞
    objects.forEach(obj => {
        if (obj.type === 'platform') {
            const platform = { x: obj.x, y: obj.y, width: GRID_SIZE, height: GRID_SIZE };
            
            if (checkCollision(player, platform)) {
                // 从上方落下
                if (player.vy > 0 && player.y + player.height - player.vy <= platform.y) {
                    player.y = platform.y - player.height;
                    player.vy = 0;
                    player.onGround = true;
                }
                // 从下方撞击
                else if (player.vy < 0 && player.y - player.vy >= platform.y + platform.height) {
                    player.y = platform.y + platform.height;
                    player.vy = 0;
                }
                // 从侧面
                else {
                    if (player.vx > 0) {
                        player.x = platform.x - player.width;
                    } else if (player.vx < 0) {
                        player.x = platform.x + platform.width;
                    }
                }
            }
        }
        
        // 尖刺碰撞
        if (obj.type === 'spike') {
            const spike = { x: obj.x, y: obj.y, width: GRID_SIZE, height: GRID_SIZE };
            if (checkCollision(player, spike)) {
                player.alive = false;
                setTimeout(() => {
                    const spawn = objects.find(o => o.type === 'spawn');
                    if (spawn) {
                        player = createPlayer(spawn.x + 4, spawn.y);
                        gameLoop();
                    }
                }, 500);
            }
        }
        
        // 金币收集
        if (obj.type === 'coin') {
            const coin = { x: obj.x, y: obj.y, width: GRID_SIZE, height: GRID_SIZE };
            if (checkCollision(player, coin)) {
                objects = objects.filter(o => o !== obj);
            }
        }
        
        // 终点
        if (obj.type === 'goal') {
            const goal = { x: obj.x, y: obj.y, width: GRID_SIZE, height: GRID_SIZE };
            if (checkCollision(player, goal)) {
                alert('🎉 关卡完成！');
                document.getElementById('editBtn').click();
            }
        }
    });
    
    // 掉出地图
    if (player.y > CANVAS_HEIGHT) {
        player.alive = false;
        setTimeout(() => {
            const spawn = objects.find(o => o.type === 'spawn');
            if (spawn) {
                player = createPlayer(spawn.x + 4, spawn.y);
                gameLoop();
            }
        }, 500);
    }
    
    render();
    requestAnimationFrame(gameLoop);
}

// 清空
document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('确定要清空所有内容吗？')) {
        objects = [];
        render();
    }
});

// 保存/加载
document.getElementById('saveBtn').addEventListener('click', () => {
    const data = JSON.stringify(objects);
    localStorage.setItem('platformer_level', data);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'level.json';
    a.click();
    
    alert('关卡已保存到浏览器和文件！');
});

document.getElementById('loadBtn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                objects = JSON.parse(event.target.result);
                render();
                alert('关卡加载成功！');
            } catch (err) {
                alert('文件格式错误！');
            }
        };
        reader.readAsText(file);
    };
    input.click();
});

// 尝试从本地存储加载
const saved = localStorage.getItem('platformer_level');
if (saved) {
    try {
        objects = JSON.parse(saved);
    } catch (err) {}
}

// 初始渲染
render();
