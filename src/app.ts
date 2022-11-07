const CATEGORY_PLAYER = 0b0001;
const CATEGORY_PANELS = 0b0010;

let total = 0;

class Welcome extends Phaser.Scene {
  startButton: Phaser.GameObjects.Text;
  constructor() {
    super('welcome');
  }

  preload() {
    this.load.image('fernecito', 'assets/fernecito.png');
  }

  create() {
    this.add.image(400, 300, 'fernecito');

    this.startButton = this.add.text(400, this.cameras.main.centerY, 'Iniciar juego', {});
    this.startButton
      .setOrigin(0.5)
      .setPadding(10)
      .setStyle({ backgroundColor: '#111' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', this.reloadGame)
      .on('pointerover', () => this.startButton.setStyle({ fill: '#f39c12' }))
      .on('pointerout', () => this.startButton.setStyle({ fill: '#FFF' }));
  }

  reloadGame() {
    total = 0;
    (this.scene.scene as any).start('game');
  }
}

class Finish extends Phaser.Scene {
  startButton: Phaser.GameObjects.Text;
  mainText: Phaser.GameObjects.Text;
  constructor() {
    super('finish');
  }


  preload() {
    this.load.image('fernecito', 'assets/fernecito.png');
  }

  create() {
    this.add.image(400, 300, 'fernecito');

    this.mainText = this.add.text(400, 200, `Te tomaste ${total.toString()} fernecitos`, {});
    this.mainText.setOrigin(0.5);
    this.startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Empezar de nuevo', {});
    this.startButton
      .setOrigin(0.5)
      .setPadding(10)
      .setStyle({ backgroundColor: '#111' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', this.loadGame)
      .on('pointerover', () => this.startButton.setStyle({ fill: '#f39c12' }))
      .on('pointerout', () => this.startButton.setStyle({ fill: '#FFF' }));
  }

  loadGame() {
    total = 0;
    (this.scene.scene as any).start('game');
  }
}

class Example extends Phaser.Scene {
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  finalBanner: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  isTouchingGround = false;
  fernets;
  score = 0;
  scoreText: Phaser.GameObjects.Text;

  constructor() {
    super('game');
  }

  preload() {
    this.load.image('floor', 'assets/floor.png');
    this.load.image('platform', 'assets/platform.png');
    this.load.image('sky', 'assets/sky.png');
    this.load.image('driver', 'assets/driver.png');
    this.load.image('tile', 'assets/tile.png');
    this.load.image('fernet', 'assets/fernet.png');
    this.load.image('final', 'assets/final.png');
    this.load.spritesheet('guy', 'assets/guy.png', {
      frameWidth: 58,
      frameHeight: 75,
    });
  }

  create() {
    //  The world is 3200 x 600 in size

    this.cameras.main.setBounds(0, 0, 3500, 600);
    this.physics.world.setBounds(0, 0, 3500, 600);

    this.add.image(1750, 300, 'sky');

    const platforms = this.physics.add.staticGroup();
    platforms.create(1750, 600, 'floor');
    platforms.create(500, 500, 'platform');
    platforms.create(1200, 500, 'platform');
    platforms.create(1400, 400, 'platform');
    platforms.create(1600, 300, 'platform');
    platforms.create(2100, 400, 'platform');
    platforms.create(2200, 500, 'platform');
    platforms.create(790, 510, 'tile');
    platforms.create(1800, 510, 'tile');
    platforms.create(2400, 510, 'tile');

    this.finalBanner = this.physics.add.sprite(3400, 450, 'final');
    this.finalBanner.setCollideWorldBounds(true);

    this.fernets = this.physics.add.group({
      key: 'fernet',
      repeat: 5,
      setXY: { x: 500, y: 0, stepX: 400 },
    });

    this.fernets.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.3));
    });

    this.physics.add.collider(this.fernets, platforms);

    //  Add a player ship and camera follow
    this.player = this.physics.add.sprite(140, 500, 'driver', 1);

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('guy', { start: 1, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'guy', frame: 0 }],
      frameRate: 20,
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('guy', { start: 1, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    this.player.body.setGravityY(300);
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.finalBanner, platforms);

    this.cameras.main.startFollow(this.player, false, 0.2, 0.2);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.overlap(this.player, this.fernets, this.collectFernet, null, this);
    this.physics.add.overlap(this.player, this.finalBanner, this.finishGame, null, this);

    this.scoreText = this.add.text(16, 16, 'fernecitos: 0', { fontSize: '32px', color: '#fff' });
    this.scoreText.setScrollFactor(0, 0);
  }

  collectFernet(player, fernet) {
    fernet.disableBody(true, true);
    this.score += 1;
    this.scoreText.setText('fernecitos: ' + this.score);
  }

  finishGame() {
    this.player.disableBody(true, true);
    total = this.score;
    this.score = 0;
    (this.scene as any).start('finish');
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-250);
      this.player.flipX = true;

      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(250);
      this.player.flipX = false;

      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-380);
    }
    // if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.isTouchingGround) {
    // }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,

  //  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [Welcome, Example, Finish],
};

new Phaser.Game(config);
