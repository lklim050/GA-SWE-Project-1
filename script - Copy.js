// -----------------Constants and Variables------------------------
// Allows future type additions and quantity changes
const cardTypes = ["ATTACK", "DODGED", "HEAL", "CRITICAL"];
const cardTypesQuantity = [10, 5, 3, 2];

let playerHand = [];
let enemyHand = [];
const player = "Warrior";
const enemy = "Minion";
let deck = [];
let turn = "";
let winner = false;

const dialogue = document.querySelector("#dialogue-box");
const playerText = document.querySelector(".player-text");
const enemyText = document.querySelector(".enemy-text");

// ------------------------Classes---------------------------------

const Character = class {
  constructor(name = "character", ATK = 1, HP = 5, SPD = 1) {
    this.name = name;
    this.ATK = ATK;
    this.HP = HP;
    this.SPD = SPD;
  }
};

const Warrior = new Character("Warrior", 4, 14, 2);
const Minion = new Character("Minion", 1, 6, 1);
const Mage = new Character("Mage", 5, 12, 3);
const Ninja = new Character("Ninja", 6, 10, 4);
const DemonKing = new Character("Demon-King", 9, 15, 0);

// for future use, for new functions or properties
// const Warrior = class extends Character {
//   constructor(name="warrior", ATK=4, HP=12, SPD=2) {
//     super(name, ATK, HP, SPD);
//   }
// };

// -----------------------Functions---------------------------------
// Creating Deck Content
const createDeck = () => {
  deck = [];
  for (let i = 0; i < cardTypes.length; i++) {
    for (let j = 0; j < cardTypesQuantity[i]; j++) {
      let card = { Type: cardTypes[i] };
      deck.push(card);
    }
  }
};

// Shuffling Deck
const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
};

// Load Player/Enemy Data to the page
const loadPlayerData = (player) => {
  const name = player.name;
  const atk = player.ATK;
  const hp = player.HP;
  const spd = player.SPD;

  playerText.textContent = `Player | Class: ${name} | ATK: ${atk} | HP: ${hp} | SPD: ${spd}`;
};

const loadEnemyData = (enemy) => {
  const name = enemy.name;
  const atk = enemy.ATK;
  const hp = enemy.HP;
  const spd = enemy.SPD;

  enemyText.textContent = `Enemy | Class: ${name} | ATK: ${atk} | HP: ${hp} | SPD: ${spd}`;
};

function playerDraw() {
  playerHand.push(deck.pop());
  const cardElement = document.getElementById(`my-card-0`);
  cardElement.classList.remove("hidden");
}

function enemyDraw() {
  enemyHand.push(deck.pop());
  //   const cardElement = document.getElementById(`opp-card-0`);
  //   cardElement.classList.remove("hidden");
  const cardEl = document.createElement("div");
  cardEl.className = "card";
  cardEl.innerHTML = `
    <div class="card-content">test</div>
  `;
}

// const playerHandUpdate = (playerHand) => {
//   const handContainer = document.querySelector(".player-hand");
//   handContainer.innerHTML = ""; // Clear existing hand
// }

const checkFirstTurn = (player, enemy) => {
  if (player.SPD >= enemy.SPD) {
    return `Player ${player.name}`;
  } else {
    return `Enemy ${enemy.name}`;
  }
};

// Delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Initializing Game
const init = async () => {
  dialogue.textContent = "Initializing Data...";
  loadPlayerData(Warrior);
  loadEnemyData(Minion);
  await delay(2000);

  dialogue.textContent = "Creating Deck...";
  createDeck();
  await delay(2000);

  dialogue.textContent = "Shuffling Deck...";
  shuffleDeck(deck);
  await delay(2000);

  dialogue.textContent = "Dealing Hands...";
  playerDraw();
  enemyDraw();
  playerDraw();
  enemyDraw();
  playerDraw();
  enemyDraw();
  await delay(2000);

  turn = checkFirstTurn(Warrior, Minion);
  dialogue.textContent = `Game Start! It is ${turn}'s turn.`;
  //   await delay(5000);

  log();
};

//---------------------main code--------------------------------

init();

//------------------console log check--------------------------------

function log() {
  // Checking Deck Content, to be removed after testing
  console.log(deck.length);
  console.log(deck);

  // Checking Shuffled Deck, to be removed after testing
  console.log(deck.length);
  console.log(deck);

  // Checking Player/Enemy Hand Creation, to be removed after testing
  console.log(playerHand.length);
  console.log(enemyHand.length);
  console.log(playerHand);
  console.log(enemyHand);
}
