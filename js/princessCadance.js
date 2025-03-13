document.addEventListener('DOMContentLoaded', () => {
    // 音韵公主经典语录
    const quotes = [
        "爱不是被动接受，而是主动守护的力量。",
        "真正的魔法，是让每个心灵都能闪耀自己的光芒。",
        "当我们携手同心，黑暗永远无法战胜希望。",
        "理解与包容，是化解矛盾的最佳良药。",
        "每个生命都值得被温柔以待。",
        "信任是爱最珍贵的基石。"
    ];

    // 语录功能
    const quoteBtn = document.getElementById('quote-btn');
    const quoteDisplay = document.getElementById('quote-display');
    let lastQuoteIndex = -1;

    quoteBtn.addEventListener('click', () => {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * quotes.length);
        } while (randomIndex === lastQuoteIndex);

        lastQuoteIndex = randomIndex;
        quoteDisplay.textContent = quotes[randomIndex];
        quoteDisplay.style.animation = 'fadeIn 0.5s';
        setTimeout(() => quoteDisplay.style.animation = '', 500);
    });

    // 爱心收集小游戏
    const canvas = document.getElementById('star-collect-canvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score-display');
    const gameSection = document.querySelector('.mini-game');

    // 设置canvas尺寸
    function resizeCanvas() {
        canvas.width = Math.min(600, window.innerWidth - 40);
        canvas.height = 400;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 游戏参数
    const game = {
        score: 0,
        lives: 5,
        hearts: [],
        lastSpawn: 0,
        isRunning: false,
        difficulty: 1,

        createHeart() {
            return {
                x: Math.random() * (canvas.width - 40),
                y: -40,
                size: 30 + Math.random() * 20,
                speed: 2 + Math.random() * 3 * this.difficulty,
                angle: 0,
                hit: false
            };
        },

        drawHeart(heart) {
            ctx.save();
            ctx.translate(heart.x + heart.size / 2, heart.y + heart.size / 2);
            ctx.rotate(heart.angle);

            ctx.beginPath();
            ctx.fillStyle = heart.hit ? '#ff7eb9' : '#ff3b6d';
            ctx.arc(-heart.size / 4, 0, heart.size / 2, 0, Math.PI);
            ctx.arc(heart.size / 4, 0, heart.size / 2, 0, Math.PI);
            ctx.moveTo(-heart.size / 2, 0);
            ctx.quadraticCurveTo(0, heart.size, heart.size / 2, 0);
            ctx.fill();

            ctx.restore();
        },

        checkCollision(heart, mouseX, mouseY) {
            return mouseX > heart.x &&
                mouseX < heart.x + heart.size &&
                mouseY > heart.y &&
                mouseY < heart.y + heart.size;
        },

        update() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 生成新爱心
            if (Date.now() - this.lastSpawn > 2000 / this.difficulty) {
                this.hearts.push(this.createHeart());
                this.lastSpawn = Date.now();
            }

            // 更新爱心状态
            this.hearts = this.hearts.filter(heart => {
                heart.y += heart.speed;
                heart.angle += 0.03;

                if (heart.hit) {
                    heart.size *= 0.95;
                    return heart.size > 2;
                }

                if (heart.y > canvas.height) {
                    this.lives--;
                    return false;
                }
                return true;
            });

            // 绘制爱心
            this.hearts.forEach(heart => this.drawHeart(heart));

            // 更新分数和生命
            scoreDisplay.textContent = `分数: ${this.score} ❤️${'♥'.repeat(this.lives)}`;

            // 难度提升
            this.difficulty = 1 + Math.sqrt(this.score) * 0.1;

            // 游戏结束检测
            if (this.lives <= 0) {
                this.isRunning = false;
                showGameOverModal();
            }
        },

        reset() {
            this.score = 0;
            this.lives = 5;
            this.hearts = [];
            this.difficulty = 1;
            this.isRunning = false;
        }
    };

    // 游戏循环
    function gameLoop() {
        if (game.isRunning) {
            game.update();
            requestAnimationFrame(gameLoop);
        }
    }

    // 点击事件
    canvas.addEventListener('click', (e) => {
        if (!game.isRunning) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        game.hearts.forEach(heart => {
            if (!heart.hit && game.checkCollision(heart, mouseX, mouseY)) {
                heart.hit = true;
                game.score += Math.floor(heart.size);
            }
        });
    });

    // 触摸事件（支持手机用户）
    canvas.addEventListener('touchstart', (e) => {
        if (!game.isRunning) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;

        game.hearts.forEach(heart => {
            if (!heart.hit && game.checkCollision(heart, touchX, touchY)) {
                heart.hit = true;
                game.score += Math.floor(heart.size);
            }
        });
    });

    // 创建游戏结束模态框
    function createGameOverModal() {
        const modal = document.createElement('div');
        modal.id = 'game-over-modal';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = 'white';
        modal.style.padding = '20px';
        modal.style.borderRadius = '10px';
        modal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        modal.style.zIndex = '1000';
        modal.style.display = 'none';

        const message = document.createElement('p');
        message.textContent = '游戏结束！最终得分：';
        const scoreText = document.createElement('span');
        scoreText.id = 'game-over-score';
        message.appendChild(scoreText);
        modal.appendChild(message);

        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
            game.reset();
            hideGame();
        });
        modal.appendChild(closeButton);

        document.body.appendChild(modal);
        return modal;
    }

    const gameOverModal = createGameOverModal();

    // 显示游戏结束模态框
    function showGameOverModal() {
        const scoreText = document.getElementById('game-over-score');
        scoreText.textContent = game.score;
        gameOverModal.style.display = 'block';
    }

    // 创建游戏介绍模态框
    function createGameIntroModal() {
        const modal = document.createElement('div');
        modal.id = 'game-intro-modal';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = 'white';
        modal.style.padding = '20px';
        modal.style.borderRadius = '10px';
        modal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        modal.style.zIndex = '1000';
        modal.style.display = 'none';

        const message = document.createElement('p');
        message.textContent = '游戏介绍：在这个爱心收集小游戏中，你需要点击屏幕上落下的爱心来收集它们。每收集一个爱心，你将获得相应的分数。你有 5 条生命，如果爱心落到屏幕底部而没有被收集，你将失去一条生命。随着分数的增加，游戏难度会逐渐提升。当你失去所有生命时，游戏结束。快来试试吧！';
        modal.appendChild(message);

        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        modal.appendChild(closeButton);

        document.body.appendChild(modal);
        return modal;
    }

    const gameIntroModal = createGameIntroModal();

    // 创建游戏控制按钮
    function createGameControlButtons() {
        const startButton = document.createElement('button');
        startButton.textContent = '开始游戏';
        startButton.classList.add('game-control-button');
        startButton.addEventListener('click', () => {
            game.reset();
            game.isRunning = true;
            gameLoop();
            showGame();
        });

        const stopButton = document.createElement('button');
        stopButton.textContent = '停止游戏';
        stopButton.classList.add('game-control-button');
        stopButton.addEventListener('click', () => {
            game.reset();
            hideGame();
        });

        const introButton = document.createElement('button');
        introButton.textContent = '游戏介绍';
        introButton.classList.add('game-control-button');
        introButton.addEventListener('click', () => {
            gameIntroModal.style.display = 'block';
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('game-button-container');
        buttonContainer.appendChild(startButton);
        buttonContainer.appendChild(stopButton);
        buttonContainer.appendChild(introButton);
        gameSection.appendChild(buttonContainer);
    }

    createGameControlButtons();

    // 显示游戏
    function showGame() {
        canvas.style.display = 'block';
        scoreDisplay.style.display = 'block';
    }

    // 隐藏游戏
    function hideGame() {
        canvas.style.display = 'none';
        scoreDisplay.style.display = 'none';
    }

    // 初始隐藏游戏
    hideGame();

    // 动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});