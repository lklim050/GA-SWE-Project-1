// -----------------Constants and Variables------------------------
// Allows future type additions and quantity changes
const cardTypes = ["ATTACK", "DODGED", "HEAL", "CRITICAL"];
const cardTypesQuantity = [2, 5, 3, 10];

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
const handContainer = document.getElementById("player-hand-container");

// ------------------------Classes---------------------------------

const Character = class {
  constructor(name = "character", ATK = 1, HP = 5, maxHP = 5, SPD = 1) {
    this.name = name;
    this.ATK = ATK;
    this.HP = HP;
    this.maxHP = maxHP;
    this.SPD = SPD;
  }
  damage(amount) {
    this.HP -= amount;
    if (this.HP < 0) this.HP = 0;
  }

  heal(amount) {
    this.HP += amount;
    if (this.HP > this.maxHP) this.HP = this.maxHP;
  }

  critical(amount) {
    this.HP -= amount * 2;
    if (this.HP < 0) this.HP = 0;
  }
};

const Warrior = new Character("Warrior", 4, 14, 14, 2);
const Minion = new Character("Minion", 1, 6, 6, 1);
const Mage = new Character("Mage", 5, 12, 12, 3);
const Ninja = new Character("Ninja", 6, 10, 10, 4);
const DemonKing = new Character("Demon-King", 9, 15, 15, 0);

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
  for (let i = 0; i < deck.length; i++) {
    deck[i].id = i;
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
  const maxHP = player.maxHP;
  const spd = player.SPD;

  playerText.textContent = `Player | Class: ${name} | ATK: ${atk} | HP: ${hp}/${maxHP} | SPD: ${spd}`;
};

const loadEnemyData = (enemy) => {
  const name = enemy.name;
  const atk = enemy.ATK;
  const hp = enemy.HP;
  const maxHP = enemy.maxHP;
  const spd = enemy.SPD;

  enemyText.textContent = `Enemy | Class: ${name} | ATK: ${atk} | HP: ${hp}/${maxHP} | SPD: ${spd}`;
};

function renderHandCard(cardData) {
  const cardElement = document.createElement("div");

  cardElement.className = "my card";

  cardElement.setAttribute("data-id", cardData.id);

  cardElement.innerHTML = `
    <div class="card-content">
      <h4>${cardData.Type}</h4>
    </div>
  `;

  const container = document.querySelector("#player-hand-container");
  container.appendChild(cardElement);
}

function renderEnemyHandCard(cardData) {
  const cardElement = document.createElement("div");

  cardElement.className = "opp card-back";

  cardElement.setAttribute("data-id", cardData.id);

  cardElement.innerHTML = `
    <div class="card-content">
      <h4>${cardData.Type}</h4>
    </div>
  `;

  const container = document.querySelector("#enemy-hand-container");
  container.appendChild(cardElement);
}

function playerDraw() {
  const drawnCard = deck.pop();
  playerHand.push(drawnCard);
  renderHandCard(drawnCard);
}

function enemyDraw() {
  const drawnCard = deck.pop();
  enemyHand.push(drawnCard);
  renderEnemyHandCard(drawnCard);
}

// const playerHandUpdate = (playerHand) => {
//   const handContainer = document.querySelector(".player-hand");
//   handContainer.innerHTML = ""; // Clear existing hand
// }

const checkFirstTurn = (player, enemy) => {
  if (player.SPD >= enemy.SPD) {
    turn = `Player ${player.name}`;
    playerTurn();
  } else {
    turn = `Enemy ${enemy.name}`;
    enemyTurn();
  }
};

// Dialogue Update Function

const updateDialogue = (message) => {
  document.querySelector("#dialogue-box").innerHTML = message;
};

// Delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Timer function
const startVisualTimer = (seconds) => {
  let timeLeft = seconds;
  const timerElement = document.getElementById("timer-count");

  const interval = setInterval(() => {
    timeLeft--;
    if (timerElement) timerElement.innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(interval);
    }
  }, 1000);

  return interval;
};

const waitForClick = (element) => {
  return new Promise((resolve) => {
    // This is the internal logic that runs when a click happens
    const onClick = (event) => {
      // Use .closest to see if a .card (or something inside it) was clicked
      const card = event.target.closest(".card");
      // for console, to be removed after testing
      console.log(`You clicked: ${card.innerText}`);
      if (card) {
        // 1. Clean up: Remove the listener so it doesn't stay active forever
        element.removeEventListener("click", onClick);

        // 2. Resolve: Tell the 'await' that we are finished and return the card
        resolve(card);
      }
    };
    // Attach the listener to the parent container
    renderEndTurnButton();
    element.addEventListener("click", onClick);
  });
};

const playerTurnCountDown = async function () {
  let turnTime = 20; // 20 seconds to move

  updateDialogue(
    `Please make a move... (<span id="timer-count">${turnTime}</span>s)`,
  );

  const visualClock = startVisualTimer(turnTime); // start countdown

  const handZone = document.querySelector("#player-hand-container");

  // Promise.race to wait either for click or timeout
  const result = await Promise.race([
    waitForClick(handZone),
    delay(turnTime * 1000).then(() => "TIMEOUT"),
  ]);

  clearInterval(visualClock); // Stop the clock as soon as the race ends

  if (result === "TIMEOUT") {
    updateDialogue("Time's up! You skipped your turn.");
    // Add logic here to auto-discard or end turn
    return "skipped";
  } else {
    const clickedCard = result;
    updateDialogue(`You played ${clickedCard.innerText}!`);
    // playCard(clickedCard); // to implement later
    resolveCardEffect(
      playerHand.find((card) => card.id == clickedCard.dataset.id),
    );
    return "played";
  }
};

const resolveCardEffect = (card) => {
  switch (card.Type) {
    case "ATTACK":
      // Implement attack logic
      if (turn.includes("Player")) {
        Minion.damage(Warrior.ATK);
        loadEnemyData(Minion);
        updateDialogue(`You attacked the enemy for ${Warrior.ATK} damage!`);
      } else {
        Warrior.damage(Minion.ATK);
        loadPlayerData(Warrior);
        updateDialogue(`The enemy attacked you for ${Minion.ATK} damage!`);
      }
      break;
    case "DODGED":
      // Implement dodge logic
      break;
    case "HEAL":
      // Implement heal logic
      if (turn.includes("Player")) {
        Warrior.heal(3); // Example heal amount
        loadPlayerData(Warrior);
        updateDialogue(`You healed for 3 damage!`);
      } else {
        Minion.heal(3); // Example heal amount
        loadEnemyData(Minion);
        updateDialogue(`The enemy healed for 3 damage!`);
      }
      break;
    case "CRITICAL":
      // Implement critical hit logic
      if (turn.includes("Player")) {
        Minion.damage(Warrior.ATK * 2);
        loadEnemyData(Minion);
        updateDialogue(`You attacked the enemy for ${Warrior.ATK * 2} damage!`);
      } else {
        Warrior.damage(Minion.ATK * 2);
        loadPlayerData(Warrior);
        updateDialogue(`The enemy attacked you for ${Minion.ATK * 2} damage!`);
      }
      break;
  }
};

const renderEndTurnButton = () => {
  // 1. Clean up: Remove old button if it exists so we don't get duplicates
  document.querySelector("#end-turn-button")?.remove();

  const btn = document.createElement("button");
  btn.id = "end-turn-button";
  btn.innerText = "End Turn";
  btn.className = "control-btn"; // Add a class for your CSS styling

  // 2. Append to the specific play area
  const playArea = document.querySelector("#play-area");
  // if (playArea) {
  playArea.appendChild(btn);
  // }
  return btn; // Return it so we can listen for clicks!
};

// const renderEndTurnButton = () => {
//   const button = document.createElement("button");
//   button.id = "end-turn-button";
//   button.innerText = "End Turn";
//   // document.querySelector("#zone.play-area").appendChild(button);
//   document.body.appendChild(button);
// };

// const endTurnButton = document.querySelector("#end-turn-button");
// endTurnButton.addEventListener("click", () => {
//   if (turn.includes("Player")) {
//     turn = "Enemy";
//   }
// });

// Initializing Game
const init = async () => {
  updateDialogue("Initializing Data...");
  loadPlayerData(Warrior);
  loadEnemyData(Minion);
  await delay(2000);

  updateDialogue("Creating Deck...");
  createDeck();
  await delay(2000);

  updateDialogue("Shuffling Deck...");
  shuffleDeck(deck);
  await delay(2000);

  updateDialogue("Dealing Hands...");
  playerDraw();
  enemyDraw();
  playerDraw();
  enemyDraw();
  playerDraw();
  enemyDraw();
  await delay(2000);

  checkFirstTurn(Warrior, Minion);

  updateDialogue(`Game Start! It is ${turn}'s turn.`);
  await delay(3000);

  log(); //Deck content check only, to be removed after testing
};

const playerTurn = async function () {
  console.log(`Turn Start: ${turn}`);
  if (deck.length !== 0) {
    playerDraw();
  }

  await delay(500);
  console.log("Your move please");
  await playerTurnCountDown();
  console.log("Player turn ended");
};

const enemyTurn = async function () {
  console.log(`Turn Start: ${turn}`);
  if (deck.length !== 0) {
    enemyDraw();
  }
  //   await delay(1000);
  console.log("Draw 1 card for enemy");
};

//---------------------main code--------------------------------

// handContainer.addEventListener("click", (event) => {
//   // Check if the thing we clicked is actually a card
//   if (event.target.closest(".card")) {
//     console.log("Card Clicked!");
//     // You can even find out WHICH card was clicked:
//     const cardName = event.target
//       .closest(".card")
//       .querySelector("h4").innerText;
//     console.log(`You clicked: ${cardName}`);
//   }
// });

init();

//------------------console log check--------------------------------

function log() {
  // Checking Shuffled Deck, to be removed after testing
  console.log(deck.length);
  console.log(deck);

  // Checking Player/Enemy Hand Creation, to be removed after testing
  console.log(playerHand.length);
  console.log(enemyHand.length);
  console.log(playerHand);
  console.log(enemyHand);
}
