let restartButton;
let brug, canvas, raster, eve, alice, bob, bommen, appel;
const numBommen = 5;
let levens = 3; // Voeg levens toe

class Raster {
  constructor(r, k) {
    this.aantalRijen = r;
    this.aantalKolommen = k;
    this.celGrootte = null;
    this.oranjeRegel = r;
  }

  berekenCelGrootte() {
    this.celGrootte = canvas.width / this.aantalKolommen;
  }

  teken() {
    push();
    noFill();
    stroke('grey');
    for (let rij = 0; rij < this.aantalRijen; rij++) {
      for (let kolom = 0; kolom < this.aantalKolommen; kolom++) {
        if (rij === this.oranjeRegel - 3 || kolom === this.oranjeRegel - 12) {
          fill('orange');
        } else {
          noFill();
        }
        rect(kolom * this.celGrootte, rij * this.celGrootte, this.celGrootte, this.celGrootte);
      }
    }
    pop();
  }
}

class Bom {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.exploded = false;
    this.beweegRichting = 1;
    this.beweegStap = raster.celGrootte;
  }

  explode() {
    this.exploded = true;
  }

  toon() {
    if (!this.exploded) {
      fill('black');
      ellipse(this.x + raster.celGrootte / 2, this.y + raster.celGrootte / 2, raster.celGrootte, raster.celGrootte);
    }
  }

  beweegVerticaal() {
    this.y += this.beweegRichting * this.beweegStap;

    if (this.y >= canvas.height - raster.celGrootte || this.y <= 0) {
      this.beweegRichting *= -1;
    }
  }
}

class Jos {
  constructor() {
    this.x = 400;
    this.y = 300;
    this.animatie = [];
    this.frameNummer = 3;
    this.stapGrootte = null;
    this.gehaald = false;
  }

  beweeg() {
    if (keyIsDown(65)) {
      this.x -= this.stapGrootte;
      this.frameNummer = 2;
    }
    if (keyIsDown(68)) {
      this.x += this.stapGrootte;
      this.frameNummer = 1;
    }
    if (keyIsDown(87)) {
      this.y -= this.stapGrootte;
      this.frameNummer = 4;
    }
    if (keyIsDown(83)) {
      this.y += this.stapGrootte;
      this.frameNummer = 5;
    }

    this.x = constrain(this.x, 0, canvas.width);
    this.y = constrain(this.y, 0, canvas.height - raster.celGrootte);

    if (this.x == canvas.width) {
      this.gehaald = true;
    }
  }

  wordtGeraakt(vijand) {
    return (this.x === vijand.x && this.y === vijand.y) ||
           (this.x + raster.celGrootte > vijand.x && this.x < vijand.x + raster.celGrootte &&
            this.y + raster.celGrootte > vijand.y && this.y < vijand.y + raster.celGrootte);
  }

  eetAppel(appel) {
    if (dist(this.x, this.y, appel.x, appel.y) < raster.celGrootte / 2) {
      levens++;
      appel.verplaats();
    }
  }

  toon() {
    image(this.animatie[this.frameNummer], this.x, this.y, raster.celGrootte, raster.celGrootte);
  }
}

class Vijand {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = null;
    this.stapGrootte = null;
  }

  beweeg() {
    this.x += floor(random(-1, 2)) * this.stapGrootte;
    this.y += floor(random(-1, 2)) * this.stapGrootte;

    this.x = constrain(this.x, 0, canvas.width - raster.celGrootte);
    this.y = constrain(this.y, 0, canvas.height - raster.celGrootte);
  }

  toon() {
    image(this.sprite, this.x, this.y, raster.celGrootte, raster.celGrootte);
  }
}

class Appel {
  constructor() {
    this.x = floor(random(raster.aantalKolommen)) * raster.celGrootte;
    this.y = floor(random(raster.aantalRijen)) * raster.celGrootte;
    this.picture = loadImage("images/sprites/appel_1.png");
  }

  toon() {
    image(this.picture, this.x, this.y, raster.celGrootte, raster.celGrootte);
  }

  verplaats() {
    this.x = floor(random(raster.aantalKolommen)) * raster.celGrootte;
    this.y = floor(random(raster.aantalRijen)) * raster.celGrootte;
  }
}

function preload() {
  brug = loadImage("images/backgrounds/dame_op_brug_1800.jpg");
}

function setup() {
  canvas = createCanvas(900, 600);
  canvas.parent();
  frameRate(10);
  textFont("Verdana");
  textSize(90);

  raster = new Raster(12, 18);
  raster.berekenCelGrootte();

  eve = new Jos();
  eve.stapGrootte = 1 * raster.celGrootte;
  for (let b = 0; b < 6; b++) {
    const frameEve = loadImage("images/sprites/Eve100px/Eve_" + b + ".png");
    eve.animatie.push(frameEve);
  }

  alice = new Vijand(700, 200);
  alice.stapGrootte = 1 * eve.stapGrootte;
  alice.sprite = loadImage("images/sprites/Alice100px/Alice.png");

  bob = new Vijand(600, 400);
  bob.stapGrootte = 1 * eve.stapGrootte;
  bob.sprite = loadImage("images/sprites/Bob100px/Bob.png");

  bommen = [];
  genereerBommen();

  appel = new Appel();

  restartButton = createButton('Restart');
  restartButton.position(10, 10);
  restartButton.mousePressed(restartGame);
}

function draw() {
  background(brug);
  raster.teken();
  eve.beweeg();
  alice.beweeg();
  bob.beweeg();

  for (let i = 0; i < levens; i++) {
    fill('red');
    ellipse(40 + i * 40, 40, 30, 30);
  }

  for (let bom of bommen) {
    bom.beweegVerticaal();
    bom.toon();
  }

  eve.toon();
  alice.toon();
  bob.toon();

  appel.toon();

  if (eve.wordtGeraakt(alice) || eve.wordtGeraakt(bob)) {
    verlorenScherm();
  }

  eve.eetAppel(appel);

  if (eve.gehaald) {
    gewonnenScherm();
  }
}

function verlorenScherm() {
  levens--;
  if (levens <= 0) {
    eindigSpel();
  } else {
    restartGame();
  }
}

function gewonnenScherm() {
  background('green');
  fill('white');
  text("Je hebt gewonnen!", 175, 300);
  noLoop();
}

function restartGame() {
  loop();
  eve.x = 400;
  eve.y = 300;
  eve.gehaald = false;
  bommen = [];
  genereerBommen();
  appel.verplaats();
}

function genereerBommen() {
  for (let i = 0; i < numBommen; i++) {
    const x = floor(random(raster.aantalKolommen / 2, raster.aantalKolommen)) * raster.celGrootte;
    const y = floor(random(raster.aantalRijen)) * raster.celGrootte;
    bommen.push(new Bom(x, y));
  }
}

function keyPressed() {
  if (keyCode === 32) {  
    restartGame();
  }
}

function eindigSpel() {
  background('red');
  fill('white');
  textSize(40);
  text("Game Over", 250, 300);
  noLoop();
}