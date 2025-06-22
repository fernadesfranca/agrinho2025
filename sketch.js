let plants = [];
let seeds = 5; // sementes disponíveis
let score = 0;

let player; // personagem

function setup() {
  createCanvas(800, 600);
  textSize(16);
  player = new Player(width/2, height/2);
}

function draw() {
  background(200, 255, 200);

  // Atualiza o movimento do personagem
  player.move();

  // Desenha o personagem
  player.display();

  fill(0);
  text("Sementes: " + seeds, 10, 20);
  text("Pontuação: " + score, 10, 40);

  // Plantações
  for (let plant of plants) {
    plant.update();
    plant.display();
  }

  // Verifica plantas maduras
  for (let i = plants.length - 1; i >= 0; i--) {
    let p = plants[i];
    if (p.isReadyToHarvest()) {
      fill(0, 255, 0);
      text("Pronto para colher!", p.x - 50, p.y - 50);
    }
    if (p.isDead()) {
      plants.splice(i, 1);
    }
  }
}

// Para plantar sementes ao clicar com o mouse
function mousePressed() {
  if (seeds > 0) {
    let occupied = false;
    for (let p of plants) {
      if (dist(mouseX, mouseY, p.x, p.y) < p.size) {
        occupied = true;
        break;
      }
    }
    if (!occupied) {
      plants.push(new Plant(mouseX, mouseY));
      seeds--;
    }
  }
}

// Classe Plant
class Plant {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10;
    this.age = 0;
    this.growthTime = 300; // frames para crescer
    this.watered = false;
    this.maxSize = 30;
  }
  
  update() {
    this.age++;
    if (this.age < this.growthTime) {
      this.size = map(this.age, 0, this.growthTime, 10, this.maxSize);
    } else {
      this.size = this.maxSize;
    }
  }
  
  display() {
    fill(34, 139, 34);
    ellipse(this.x, this.y, this.size, this.size);
    if (this.watered) {
      fill(0, 0, 255, 100);
      ellipse(this.x, this.y, this.size + 10, this.size + 10);
    }
  }
  
  isReadyToHarvest() {
    return this.age >= this.growthTime && this.size >= this.maxSize;
  }
  
  isDead() {
    return false;
  }
  
  toggleWater() {
    this.watered = !this.watered;
  }
}

// Classe do personagem com pernas, braços, corpo e movimento
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.sizeBody = 20; // tamanho do corpo
    this.speed = 2.5;
    this.stepCount = 0; // para animação de passos
    this.moving = false; // se está se movendo
  }
  
  move() {
    this.moving = false;
    // Verifique as teclas W, A, S, D
    if (keyIsDown(87)) { // W
      this.y -= this.speed;
      this.moving = true;
    }
    if (keyIsDown(83)) { // S
      this.y += this.speed;
      this.moving = true;
    }
    if (keyIsDown(65)) { // A
      this.x -= this.speed;
      this.moving = true;
    }
    if (keyIsDown(68)) { // D
      this.x += this.speed;
      this.moving = true;
    }
    // Limitar os limites do canvas
    this.x = constrain(this.x, 0 + this.sizeBody/2, width - this.sizeBody/2);
    this.y = constrain(this.y, 0 + this.sizeBody/2, height - this.sizeBody/2);
    
    // Incrementa o passo para animação se estiver se movendo
    if (this.moving) {
      this.stepCount++;
    } else {
      this.stepCount = 0;
    }
  }
  
  display() {
    push();
    translate(this.x, this.y);
    
    // Corpo
    fill(150, 75, 0);
    rectMode(CENTER);
    rect(0, 0, this.sizeBody, this.sizeBody);
    
    // Cabeça
    fill(255, 224, 189);
    ellipse(0, -this.sizeBody/2 - 5, this.sizeBody/2, this.sizeBody/2);
    
    // Braços com movimento oscilante
    stroke(0);
    strokeWeight(3);
    let armSwing = sin(this.stepCount * 0.3) * 20; // movimento braço
    line(-this.sizeBody/2, -10, -this.sizeBody/2 - 15, -10 + armSwing);
    line(this.sizeBody/2, -10, this.sizeBody/2 + 15, -10 - armSwing);
    
    // Pernas com movimento oscilante
    let legSwing = sin(this.stepCount * 0.3 + PI) * 20; // movimento pernas
    line(-this.sizeBody/4, this.sizeBody/2, -this.sizeBody/4 - 10, this.sizeBody/2 + 20 + legSwing);
    line(this.sizeBody/4, this.sizeBody/2, this.sizeBody/4 + 10, this.sizeBody/2 + 20 - legSwing);
    
    pop();
  }
  
  // Interagir com plantas próximas
  interact() {
    for (let p of plants) {
      if (dist(this.x, this.y, p.x, p.y) < p.size + this.sizeBody/2) {
        if (p.isReadyToHarvest()) {
          score++;
          seeds++;
          plants.splice(plants.indexOf(p), 1);
        } else {
          p.toggleWater();
        }
      }
    }
  }
  
  // Colher planta próxima ao pressionar 'E'
  collectPlant() {
    for (let p of plants) {
      if (dist(this.x, this.y, p.x, p.y) < p.size + this.sizeBody/2 && p.isReadyToHarvest()) {
        score++;
        seeds++;
        plants.splice(plants.indexOf(p), 1);
        break; // só colher uma planta por vez
      }
    }
  }
  
  // Plantar semente próxima ao pressionar 'R'
  plantSeed() {
    if (seeds > 0) {
      // Verifica se há espaço livre próximo ao personagem
      let occupied = false;
      for (let p of plants) {
        if (dist(this.x, this.y, p.x, p.y) < p.size + this.sizeBody/2) {
          occupied = true;
          break;
        }
      }
      if (!occupied) {
        plants.push(new Plant(this.x, this.y));
        seeds--;
      }
    }
  }
}

function keyPressed() {
  if (key === 'E' || key === 'e') {
    player.collectPlant();
  }
  if (key === 'R' || key === 'r') {
    player.plantSeed();
  }
}