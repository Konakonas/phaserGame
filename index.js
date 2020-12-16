let game;
let win = false;

window.onload = () => {
  const config = {
    type: Phaser.AUTO,
    width: 620,
    height: 620,
    backgroundColor: 0x4291ff,
    scene: [PlayGameScene, ResultGameScene],
  };

  game = new Phaser.Game(config);
};

class PlayGameScene extends Phaser.Scene {
  constructor() {
    super("PlayGameScene");
    this.boardArray = [];
    this.boardTurns = [];
    this.dotsArray = [];
    this.changeGround = 16;
    this.deskLimit = 0;
    this.nKey = 0;
  }

  preload() {
    this.load.image(
      "squre",
      "https://www.flaticon.com/svg/static/icons/svg/545/545666.svg"
    );
    this.load.image(
      "batsu",
      "https://www.flaticon.com/svg/static/icons/svg/748/748122.svg"
    );
    this.load.image(
      "maru",
      "https://www.flaticon.com/svg/static/icons/svg/481/481078.svg"
    );
  }

  create() {
    this.gameOver = false;
    this.boardArray = [];
    this.changeGround = 16;
    this.dotsArray = [[]];
    const blankSquareSize = 40; // 200x200 square
    const halfBlankSquareSize = blankSquareSize / 2;

    let nKey = 0;
    for (let row = 0; row < 5; row++) {
      let y = 150 + halfBlankSquareSize + blankSquareSize * row + row * 10;
      this.dotsArray[row] = [];
      for (let col = 0; col < 5; col++) {
        let x = 150 + halfBlankSquareSize + blankSquareSize * col + col * 10;

        let blankSquare = this.add.image(x, y, "squre");
        blankSquare.setScale(0.3);
        blankSquare.myKey = nKey++;

        blankSquare.setInteractive();
        blankSquare.on("pointerdown", this.handleClick);

        this.boardArray.push({
          x,
          y,
        });
        this.dotsArray[row][col] = null;
      }
    }
    this.deskLimit = 5;
  }

  addNewSquares() {
    this.gameOver = false;
    this.boardArray = [];
    // this.changeGround = 16;
    const blankSquareSize = 40; // 200x200 square
    let nKey = 0;
    const halfBlankSquareSize = blankSquareSize / 2;
    for (let row = 0; row < 8; row++) {
      let y = this.position(row);
      if (row > 4) this.dotsArray[row] = [];
      for (let col = 0; col < 8; col++) {
        let x = this.position(col);

        let blankSquare = this.add.image(x, y, "squre");
        blankSquare.setScale(0.3);
        blankSquare.myKey = nKey++;

        blankSquare.setInteractive();
        blankSquare.on("pointerdown", this.handleClick);

        this.boardArray.push({
          x,
          y,
        });
        if (col > 4 || row > 4) this.dotsArray[row][col] = null;
      }
    }
    this.deskLimit = 8;
  }

  handleClick() {
    const scene = this.scene;
    scene.changeGround = scene.changeGround - 2;

    let blankSquare = scene.add.image(this.x, this.y, "batsu");
    blankSquare.setScale(0.25);
    blankSquare.myKey = this.nKey++;
    blankSquare.setInteractive();
    scene.boardTurns.push({ x: this.x, y: this.y });
    const curdot = [(this.y - 170) / 50, (this.x - 170) / 50];
    scene.dotsArray[curdot[0]][curdot[1]] = 1;
    scene.checkWin(curdot[0], curdot[1], 1);
    const compDot = scene.compTurn(scene.deskLimit, scene.dotsArray);
    let blankMaru = scene.add.image(
      scene.position(compDot.x),
      scene.position(compDot.y),
      "maru"
    );
    blankMaru.setScale(0.25);
    blankMaru.myKey = this.nKey++;
    blankMaru.setInteractive();
    if (scene.changeGround === 0) scene.addNewSquares();
  }

  position(x) {
    const blankSquareSize = 40;
    const halfBlankSquareSize = blankSquareSize / 2;
    return 150 + halfBlankSquareSize + blankSquareSize * x + x * 10;
  }

  compTurn(limit, array) {
    let dotsFound = false;
    let ranX = 0;
    let ranY = 0;
    while (!dotsFound) {
      ranX = this.getRandomInt(limit);
      ranY = this.getRandomInt(limit);
      if (array[ranY][ranX] !== 1 && array[ranY][ranX] !== 2) {
        dotsFound = true;
        this.dotsArray[ranY][ranX] = 2;
      }
    }
    this.checkWin(ranX, ranY, 2);
    return { x: ranX, y: ranY };
  }

  getRandomInt(max) {
    max = Math.floor(max);
    return Math.floor(Math.random() * max);
  }

  checkWin(x, y, turn) {
    const deskLimit = this.deskLimit;
    const direction = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    for (let dir = 0; dir < direction.length; dir++) {
      let count = 0;
      for (let i = 1; i < deskLimit; i++) {
        if (
          x + direction[dir][0] * i > deskLimit - 1 ||
          y + direction[dir][1] * i > deskLimit - 1 ||
          !this.dotsArray[x + direction[dir][0] * i][y + direction[dir][1] * i]
        )
          { 
            break;
          }
        if (
          this.dotsArray[x + direction[dir][0] * i][y + direction[dir][1] * i] === turn
        ) {
          count++;
        } else break;
      }
      for (let i = 1; i < deskLimit; i++) {
        if (
          x - direction[dir][0] * i < 0 ||
          y - direction[dir][1] * i < 0 ||
          !this.dotsArray[x - direction[dir][0] * i][y - direction[dir][1] * i]
        )
          break;
        if (
          this.dotsArray[x - direction[dir][0] * i][ y - direction[dir][1] * i ] === turn
        ) {
          count++;
        }
        else break;
      }
      if ((count > 3)) {
        if (turn === 1) win = true;
        else win = false;
        this.scene.start('ResultGameScene', true);
        this.scene.stop('PlayGameScene');
      }
    }
  }
}

class ResultGameScene extends Phaser.Scene {

    constructor() {
        super("ResultGameScene");
        this.string = 'You are win!';
    }

    create() {
        // let result = this.add.text(250, 250, this.string, { fill: '#fff' });
        // result.setInteractive();
        const clickButton = this.add.text(250, 300, 'Play again', { fill: '#0f0' })
        .setInteractive()
        .on('pointerdown', () => this.actionOnClick() );
        clickButton.setInteractive();
    }

    actionOnClick() {
        this.scene.start('PlayGameScene');
        this.scene.stop('ResultGameScene');
    }

    update() {
        if (win) {
            let result = this.add.text(250, 250, 'You win!', { fill: '#fff' });
            result.setInteractive();
        }
        else {
            let result = this.add.text(250, 250, 'You lose!', { fill: '#fff' });
            result.setInteractive();
        }; 
    }
    
}
