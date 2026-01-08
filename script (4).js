const chicken = document.getElementById("chicken");
const floor = document.getElementById("grass-floor");
const container = document.getElementById("game-container");
const menu = document.getElementById("ui-layer");
const splash = document.getElementById("splash-screen");
const scoreText = document.getElementById("score");
const bestScoreText = document.getElementById("best-score");
const btnStart = document.getElementById("btn-start");

let score = 0;
let bestScore = localStorage.getItem("chickenBestScore") || 0;
let gameActive = false;
let chickenBottom = 70;
let velocityY = 0;
let gravity = 0.6;
let floorVisible = true;
let jumpsLeft = 2;
let difficultyMult = 1.2;
let chickenColor = "#ffeb3b";

// Inicializar texto do recorde
bestScoreText.innerText = "Recorde: " + bestScore;

splash.addEventListener("click", () => {
    splash.style.display = "none";
    menu.style.display = "flex";
});

function selectColor(color, mult) {
    chickenColor = (color === 'white') ? '#ffffff' : (color === 'black') ? '#333333' : '#ffeb3b';
    difficultyMult = mult;
    gravity = (color === 'white') ? 0.45 : (color === 'black') ? 0.8 : 0.6;
    
    document.querySelectorAll('.color-opt').forEach(opt => opt.classList.remove('active'));
    document.querySelector('.' + color).classList.add('active');
}

btnStart.addEventListener("click", (e) => {
    e.preventDefault();
    menu.style.display = "none";
    container.style.display = "block";
    chicken.style.backgroundColor = chickenColor;
    resetGameState();
    spawnObstacle();
    floorCycle();
    update();
});

function resetGameState() {
    gameActive = true;
    score = 0;
    chickenBottom = 70;
    velocityY = 0;
    jumpsLeft = 2;
    scoreText.innerText = "0";
    floorVisible = true;
    floor.style.transform = "translateY(0)";
    document.querySelectorAll('.tree, .log-platform').forEach(o => o.remove());
}

function jump() {
    if (gameActive && jumpsLeft > 0) {
        velocityY = 13.5; 
        jumpsLeft--;
    }
}

window.addEventListener("touchstart", (e) => { 
    if(gameActive) { e.preventDefault(); jump(); }
}, {passive: false});

window.addEventListener("mousedown", (e) => { 
    if(gameActive) jump(); 
});

function update() {
    if (!gameActive) return;

    velocityY -= gravity;
    chickenBottom += velocityY;

    if (chickenBottom < 70 && floorVisible) {
        chickenBottom = 70;
        velocityY = 0;
        jumpsLeft = 2;
    }

    if (chickenBottom < -60) { endGame("Splash! Caiu na água!"); return; }

    const obs = document.querySelectorAll(".tree, .log-platform");
    obs.forEach(o => {
        const r = o.getBoundingClientRect();
        const c = chicken.getBoundingClientRect();
        
        if (c.left < r.right - 10 && c.right > r.left + 10 && c.top < r.bottom && c.bottom > r.top) {
            if (o.classList.contains("log-platform")) {
                if (velocityY <= 0 && c.bottom <= r.top + 28) {
                    chickenBottom = window.innerHeight - r.top;
                    velocityY = 0;
                    jumpsLeft = 2;
                }
            } else { 
                endGame("Bateu na Árvore!"); 
            }
        }
    });

    chicken.style.bottom = chickenBottom + "px";
    requestAnimationFrame(update);
}

function floorCycle() {
    if(!gameActive) return;
    let time = floorVisible ? 4500 : 3500;

    setTimeout(() => {
        if (gameActive) {
            floorVisible = !floorVisible;
            floor.style.transform = floorVisible ? "translateY(0)" : "translateY(120px)";
            if (!floorVisible) createObject("log-platform");
            floorCycle();
        }
    }, time);
}

function createObject(typeOverride = null) {
    if (!gameActive) return;
    const o = document.createElement("div");
    const type = typeOverride || (Math.random() > 0.4 ? "log-platform" : "tree");
    
    o.className = type;
    o.style.right = "-300px";
    o.style.bottom = (type === "log-platform") ? "175px" : "70px"; 
    
    container.appendChild(o);
    let speed = (6.0 + (score * 0.05)) * difficultyMult;
    
    function move() {
        if (!gameActive) { o.remove(); return; }
        let curr = parseFloat(o.style.right) + speed;
        o.style.right = curr + "px";
        
        if (curr > window.innerWidth + 500) {
            o.remove();
            score++;
            scoreText.innerText = score;
            
            // Checar se bateu o recorde em tempo real
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem("chickenBestScore", bestScore);
                bestScoreText.innerText = "Recorde: " + bestScore;
            }
        } else {
            requestAnimationFrame(move);
        }
    }
    requestAnimationFrame(move);
}

function spawnObstacle() {
    if (!gameActive) return;
    createObject();
    // Intervalo de 650ms para os troncos ficarem quase grudados
    setTimeout(spawnObstacle, 650 / difficultyMult);
}

function endGame(m) {
    gameActive = false;
    alert(m + "\nSua Pontuação: " + score + "\nMelhor Pontuação: " + bestScore);
    location.reload();
}
