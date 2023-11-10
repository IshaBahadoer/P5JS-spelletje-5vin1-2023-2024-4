let restartButton;
let brug, canvas, raster, eve, alice, bob, bommen, appel;
const numBommen = 5;
let levens = 3; // Voeg levens toe

class Raster {
  constructor(r, k) {
    this.aantalRijen = r;
    this.aantalKolommen = k; 
    this.celGrootte = null;
    this.oranjeRegel = r; // Voeg oranjeRegel toe
  }

  berekenCelGrootte() {
    this.celGrootte = canvas.width / this.aantalKolommen;
  }

  teken() {
    push();
    noFill();
    stroke('grey');
    for (let rij = 0; rij < this.aantalRijen; rij++) { // Voeg rij toe
      for (let kolom = 0; kolom < this.aantalKolommen; kolom++) { // Voeg kolom toe
        if (rij === this.oranjeRegel - 3 || kolom === this.oranjeRegel - 12) {
          fill('orange'); // Voeg fill toe
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
    this.beweegRichting = 1; // 1 voor naar beneden, -1 voor naar boven
    this.beweegStap = raster.celGrootte; // De stapgrootte van de verticale beweging
  }

  explode() {
    // Voeg hier code toe om de explosie-animatie uit te voeren, bijvoorbeeld een rode kleur of een explosieafbeelding.
    this.exploded = true;
  }

  toon() {
    if (!this.exploded) {
      // Toon hier de bom, bijvoorbeeld een zwarte cirkel.
      fill('black');
      ellipse(this.x + raster.celGrootte / 2, this.y + raster.celGrootte / 2, raster.celGrootte, raster.celGrootte);
    }
  }

  beweegVerticaal() {
    this.y += this.beweegRichting * this.beweegStap;

    // Controleer of de bom de randen van het raster raakt
    if (this.y >= canvas.height - raster.celGrootte || this.y <= 0) {
      this.beweegRichting *= -1; // Keer de beweegrichting om als de rand wordt bereikt
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
    return this.x === vijand.x && this.y === vijand.y;
  }

  wordtGeraaktDoorVijand(vijand) {
    return dist(this.x, this.y, vijand.x, vijand.y) < raster.celGrootte / 2;
  }

  eetAppel(appel) {
    // Controleer of Jos de appel heeft opgegeten
    if (dist(this.x, this.y, appel.x, appel.y) < raster.celGrootte / 2) {
      levens++; // Verhoog het aantal levens
      appel.verplaats(); // Verplaats de appel naar een nieuwe willekeurige locatie
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
    this.x = floor(random(raster.aantalKolommen)) * raster.celGrootte; // Genereer een willekeurige x-coordinaat
    this.y = floor(random(raster.aantalRijen)) * raster.celGrootte; // Genereer een willekeurige y-coordinaat
    this.picture = loadImage("images/sprites/appel_1.png"); // Voegt de appel afbeelding toe
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

  // Maak een appel aan
  appel = new Appel();

  restartButton = createButton('Restart'); // Maakt een knop om het spel opnieuw te starten
  restartButton.position(10, 10); // Positioneert de knop op de canvas
  restartButton.mousePressed(restartGame); // Voegt een eventlistener toe aan de knop om te controleren of de gebr
}

function draw() {
  background(brug);
  raster.teken();
  eve.beweeg();
  alice.beweeg();
  bob.beweeg();

  // Teken levens linksboven op het scherm als hartjes
  for (let i = 0; i < levens; i++) {
    fill('red');
    drawHeart(40 + i * 40, 40, 30);
  }



  // Beweeg en toon de bommen
  for (let bom of bommen) {
    bom.beweegVerticaal(); // Laat de bom verticaal bewegen
    bom.toon();
  }

  eve.toon();
  alice.toon();
  bob.toon();

  // Toon de appel
  appel.toon();

  // Controleer of de speler de bom raakt
  for (let bom of bommen) {
    if (eve.wordtGeraakt(bom) && !bom.exploded) {
      verlorenScherm();
    }
  }
  // Controleer of de speler wordt geraakt door een vijand
  if (eve.wordtGeraaktDoorVijand(alice) || eve.wordtGeraaktDoorVijand(bob)) {
    verlorenScherm();
  }
  // Controleer of Jos de appel heeft opgegeten
  eve.eetAppel(appel);

  if (eve.gehaald) {
    gewonnenScherm(); // Toon de gewonnen scherm
  }
}

// Functie om een hartje te tekenen


// Functie om een groter gevuld hartje te tekenen
  function drawHeart(x, y, size) {
    const heartSize = size * 1.2; // Maak het hartje wat smaller
    beginShape();
    vertex(x, y + heartSize / 2);
    bezierVertex(x + heartSize / 2, y - heartSize / 4, x + heartSize, y + heartSize / 2, x, y + heartSize);
    bezierVertex(x - heartSize, y + heartSize / 2, x - heartSize / 2, y - heartSize / 4, x, y + heartSize / 2);
    endShape(CLOSE);
  }


function verlorenScherm() {
  levens--;
  if (levens <= 0) {
    eindigSpel();
  } //else {
   // restartGame();
 // }
}

 // Functie om de gewonnen scherm te laten zien
function gewonnenScherm() {
  background('green');
  fill('white');
  text("Je hebt gewonnen!", 175, 300);
  noLoop();
}

// Functie om de speler opnieuw te starten
function restartGame() {
  loop();
  eve.x = 400;
  eve.y = 300;
  eve.gehaald = false;
  bommen = [];
  genereerBommen();
  appel.verplaats();
  levens = 3; // Voeg levens toe
  // Verplaats de appel naar een nieuwe willekeurige locatie
}

// Functie bommen genereeren 
function genereerBommen() {
  for (let i = 0; i < numBommen; i++) {
    const x = floor(random(raster.aantalKolommen / 2, raster.aantalKolommen)) * raster.celGrootte; // Genereer een willekeurige x-positie
    const y = floor(random(raster.aantalRijen)) * raster.celGrootte; // Genereer een willekeurige y-positie
    bommen.push(new Bom(x, y)); // Maak een nieuwe bom aan
  }
}

function keyPressed() {
  if (keyCode === 32) {  // Spatiebalk
    restartGame();
  }
}

// Functie om het spel te eindigen 
function eindigSpel() {
  background('red');
  fill('white');
  textSize(40);
  text("Game Over", 250, 300);
  noLoop();
}