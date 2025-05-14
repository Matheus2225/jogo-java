
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.ground = null;
        this.obstacles = null;
        this.score = 0;
        this.scoreText = null;
        this.speed = 150;
        this.obstacleSpawnTimer = 0;
        this.spawnInterval = 1.5;
        this.gameOver = false;
    }

    preload() {
        // Carregar os assets do jogo (imagens, sons, etc.)
        this.load.image('dino', './assets/dino.png'); // Substitua pelo seu asset
        this.load.image('ground', './assets/ground.png'); // Substitua pelo seu asset
        this.load.image('cactus', './assets/cactus.png'); // Substitua pelos seus assets de obstáculos
    }

    create() {
        // Criar os elementos do jogo
        this.ground = this.physics.add.staticGroup();
        this.ground.create(400, 568, 'ground').setScale(2).refreshBody();

        this.player = this.physics.add.sprite(50, 500, 'dino');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.ground);

        this.obstacles = this.physics.add.group();
        this.physics.add.collider(this.player, this.obstacles, this.gameOverSequence, null, this);

        // Texto da pontuação
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

        // Controle de pulo
        this.input.on('keydown-SPACE', this.jump, this);
        this.input.on('pointerdown', this.jump, this);

        this.gameOver = false;
        this.speed = 150;
        this.obstacleSpawnTimer = 0;
        this.spawnInterval = 1.5;
        this.score = 0;
    }

    update(time, delta) {
        if (this.gameOver) {
            return;
        }

        // Movimento do chão
        this.ground.children.iterate(child => {
            child.tilePositionX += this.speed * delta / 1000;
        });

        // Geração de obstáculos
        this.obstacleSpawnTimer += delta / 1000;
        if (this.obstacleSpawnTimer >= this.spawnInterval) {
            this.obstacleSpawnTimer = 0;
            this.spawnObstacle();
        }

        // Aumentar a velocidade gradualmente
        this.speed += 0.01;
    }

    jump() {
        if (this.player.body.touching.down) {
            this.player.setVelocityY(-400);
        }
    }

    spawnObstacle() {
        const obstacleY = 500; // Altura do chão
        const obstacle = this.obstacles.create(850, obstacleY, 'cactus');
        obstacle.setImmovable(true);
        obstacle.setVelocityX(-this.speed);
        obstacle.body.allowGravity = false;

        // Remover obstáculo quando sair da tela
        obstacle.setLifeSpan(15000 / this.speed); // Ajuste o tempo de vida conforme a velocidade
    }

    gameOverSequence() {
        this.gameOver = true;
        this.speed = 0;
        this.physics.pause();
        this.player.anims.stop();
        this.player.setTint(0xff0000);

        // Exibir mensagem de Game Over e pontuação final
        this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#000', align: 'center' }).setOrigin(0.5);
        this.add.text(400, 350, 'Your Score: ' + this.score, { fontSize: '32px', fill: '#000', align: 'center' }).setOrigin(0.5);

        // Adicionar opção de reiniciar (exemplo com clique na tela)
        this.input.on('pointerdown', this.restartGame, this);
        this.input.keyboard.once('keydown-SPACE', this.restartGame, this);
    }

    restartGame() {
        this.score = 0;
        this.scene.restart();
    }
}

export default GameScene;