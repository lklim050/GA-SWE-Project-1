// -----------------Constants and Variables------------------------
// Allows future type additions and quantity changes
const cardTypes = ["ATTACK", "DODGED", "HEAL", "CRITICAL", "BOMB", "POISON"];
const cardDescriptions = [
  "Deal ATK damage",
  "Avoid ATTACK",
  "+ 3 HP, Heal Poison",
  "Can't dodge, Deal SPD damage",
  "Deal 1-5 damage to all players",
  "Deal 2 damage at every start of turn",
]; // to implement later if got time, TBD
const cardImages = [
  "images/ATTACK-ICON.jpg",
  "images/DODGED-ICON.jpg",
  "images/HEAL-ICON.jpg",
  "images/CRITICAL-ICON.jpg",
  "images/BOMB-ICON.jpg",
  "images/POISON-ICON.jpg",
];

// const cardTypesQuantity = [8, 4, 4, 4, 2, 4];

// Below is the delay time in ms
const msgDelay = 2500;
const flowDelay = 1500;
const shortDelay = 500;

let playerHand = [];
let enemyHand = [];
let playerActiveZone = [];
let enemyActiveZone = [];
let discardPile = [];
let discardCount = 0;
let player;
let enemy;
let deck = [];
let turn = "";
let isGameOver = false;
let isPlayerPoisoned = false;
let isEnemyPoisoned = false;
let wantToStopPoison = false;
let gameSessionId = 0;

const dialogue = document.querySelector("#dialogue-box");
const playerText = document.querySelector(".player-text");
const enemyText = document.querySelector(".enemy-text");
const deckCount = document.querySelector(".deck-count");
const discardCountEl = document.querySelector(".discard-count");
const discardEl = document.querySelector("#discard");

// Below are preloaded data for testing purpose, CBD
const cardTypesQuantity = [0, 10, 0, 0, 0, 0]; // for testing, TBD
let enemyHandTest = [
  {
    type: "POISON",
    id: 51,
    img: "images/POISON-ICON.jpg",
    text: "Deal 2 damage at every turn",
  },
  {
    type: "POISON",
    id: 53,
    img: "images/POISON-ICON.jpg",
    text: "Deal 2 damage at every turn",
  },
  {
    type: "HEAL",
    id: 55,
    img: "images/HEAL-ICON.jpg",
    text: "+3 HP, Heal Poison",
  },
  {
    type: "HEAL",
    id: 57,
    img: "images/HEAL-ICON.jpg",
    text: "+3 HP, Heal Poison",
  },
]; // for testing, TBD
let playerHandTest = [
  {
    type: "POISON",
    id: 52,
    img: "images/POISON-ICON.jpg",
    text: "Deal 2 damage at every turn",
  },
  {
    type: "POISON",
    id: 54,
    img: "images/POISON-ICON.jpg",
    text: "Deal 2 damage at every turn",
  },
  {
    type: "HEAL",
    id: 56,
    img: "images/HEAL-ICON.jpg",
    text: "+3 HP, Heal Poison",
  },
  {
    type: "CRITICAL",
    id: 58,
    img: "images/CRITICAL-ICON.jpg",
    text: "Can't dodge, Deal SPD damage",
  },
  {
    type: "BOMB",
    id: 60,
    img: "images/BOMB-ICON.jpg",
    text: "Deal 1-5 damage to all players",
  },
  {
    type: "POISON",
    id: 62,
    img: "images/POISON-ICON.jpg",
    text: "Deal 2 damage at every turn",
  },
]; // for testing, TBD

// ------------------------Classes---------------------------------

const Character = class {
  constructor(name = "character", ATK = 1, HP = 5, maxHP = 5, SPD = 1) {
    this.name = name;
    this.ATK = ATK;
    this.HP = HP;
    this.maxHP = maxHP;
    this.SPD = SPD;
  }
  attack(amount) {
    this.HP -= amount;
    if (this.HP < 0) this.HP = 0;
  }

  heal(amount) {
    this.HP += amount;
    if (this.HP > this.maxHP) this.HP = this.maxHP;
  }

  critical(amount) {
    this.HP -= amount;
    if (this.HP < 0) this.HP = 0;
  }

  bomb() {
    const amount = Math.floor(Math.random() * 5); // Random damage between 0 and 4
    // this.HP -= amount;
    // if (this.HP < 0) this.HP = 0;
    // return amount;
    console.trace(`Attack triggered with amount: ${amount}`);
    console.log(`--- Attack Start for ${this.name} ---`);
    console.log(`Current HP: ${this.HP}`);
    console.log(`Damage Amount: ${amount}`);

    this.HP -= amount;

    console.log(`New HP: ${this.HP}`);
    return amount;
  }

  poison() {
    const amount = 2;
    this.HP -= amount;
    if (this.HP < 0) this.HP = 0;
  }
};

// const Warrior = new Character("Warrior", 4, 14, 14, 4);
// const Minion = new Character("Minion", 1, 6, 6, 3);
// const Mage = new Character("Mage", 5, 12, 12, 5);
// const Ninja = new Character("Ninja", 6, 10, 10, 6);
// const DemonKing = new Character("Demon-King", 9, 15, 15, 2);

class Warrior extends Character {
  constructor() {
    super("Warrior", 4, 3, 14, 4);
  }
}

class Minion extends Character {
  constructor() {
    super("Minion", 1, 8, 8, 3);
  }
}

class DemonKing extends Character {
  constructor() {
    super("Demon-King", 9, 7, 20, 2);
  }
}

// -----------------------Functions---------------------------------

// Reseting Hand Array and HTML
const resetPlayerHand = () => {
  // 1. Select only the elements with class 'card' that are INSIDE the enemy zone
  const playerCards = document.querySelectorAll("#player-hand-container .card");

  // 2. Loop and remove ONLY those cards
  playerCards.forEach((card) => {
    card.remove();
  });

  console.log("Player cards cleared!"); // TBD
};

const resetEnemyHand = () => {
  // 1. Select only the elements with class 'card' that are INSIDE the enemy zone
  const enemyCards = document.querySelectorAll(
    "#enemy-hand-container .card-back",
  );

  // 2. Loop and remove ONLY those cards
  enemyCards.forEach((card) => {
    card.remove();
  });

  console.log("Enemy cards cleared!");
};

const resetActiveZones = () => {
  // 1. Select only the elements with class 'card' that are INSIDE the enemy zone
  const activePlayerCards = document.querySelectorAll(".active-player .card");
  const activeEnemyCards = document.querySelectorAll(".active-enemy .card");

  // 2. Loop and remove ONLY those cards
  activePlayerCards.forEach((card) => {
    card.remove();
  });

  activeEnemyCards.forEach((card) => {
    card.remove();
  });
};

const resetHTMLDOM = () => {
  document.querySelector(".enemy-face").style.background = "";
  document.querySelector(".player-face").style.background = "";
  document.querySelector("#discard").innerHTML = "EMPTY";
  document.querySelector("#discard").style.background = "";
  document.querySelector("#discard").style.fontWeight = "";
  document.querySelector("#discard").style.border = "";
};

// Creating Deck Content
const createDeck = () => {
  deck = [];
  for (let i = 0; i < cardTypes.length; i++) {
    for (let j = 0; j < cardTypesQuantity[i]; j++) {
      let card = {
        type: cardTypes[i],
        id: i,
        img: cardImages[i],
        text: cardDescriptions[i],
      };
      deck.push(card);
    }
  }
  // for (let i = 0; i < deck.length; i++) {
  //   deck[i].id = i;
  // }

  deckCount.innerText = deck.length + " cards left";
};

// Shuffling Deck
const shuffleDeck = (someDeck) => {
  for (let i = someDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [someDeck[i], someDeck[j]] = [someDeck[j], someDeck[i]];
  }
};

// Load Player/Enemy Data to the page
const loadPlayerData = (player) => {
  const name = player.name;
  const atk = player.ATK;
  const hp = player.HP;
  const maxHP = player.maxHP;
  const spd = player.SPD;

  playerText.innerHTML = `Player | Class: ${name} | ATK: ${atk} | SPD: ${spd} | <span class="player-hp">HP: ${hp} / ${maxHP}</span>`;
  const playerHpElement = document.querySelector(".player-hp");
  playerHpElement.style.fontWeight = 900;
};

const loadEnemyData = (enemy) => {
  const name = enemy.name;
  const atk = enemy.ATK;
  const hp = enemy.HP;
  const maxHP = enemy.maxHP;
  const spd = enemy.SPD;

  enemyText.innerHTML = `Enemy | Class: ${name} | ATK: ${atk} | SPD: ${spd} | <span class="enemy-hp">HP: ${hp} / ${maxHP}</span>`;
  const enemyHpElement = document.querySelector(".enemy-hp");
  enemyHpElement.style.fontWeight = 900;
};

// Preload hand for testing purpose, CBD
const cloneArray = (arr) => arr.map((c) => ({ ...c }));

const preloadHandForTesting = (somePHandTest, someEHandTest, someTurn) => {
  playerHand = cloneArray(somePHandTest); // for testing, TBD
  enemyHand = cloneArray(someEHandTest); // for testing, TBD
  if (someTurn === "Player") {
    for (let i = 0; i < playerHand.length; i++) {
      renderHandCard(playerHand[i]);
    }
    for (let j = 0; j < enemyHand.length; j++) {
      renderEnemyHandCard(enemyHand[j]);
    }
  } else if (someTurn === "Enemy") {
    for (let i = 0; i < enemyHand.length; i++) {
      renderEnemyHandCard(enemyHand[i]);
    }
    for (let j = 0; j < playerHand.length; j++) {
      renderHandCard(playerHand[j]);
    }
  }
};

// Render card on hand container according to hand array

function renderHandCardCopy(cardData) {
  const cardElement = document.createElement("div");

  cardElement.className = "my card";

  cardElement.setAttribute("data-id", cardData.id);

  cardElement.innerHTML = `
    <div class="card-content">
      <h2>${cardData.type}</h2>
    </div>
  `;

  const container = document.querySelector("#player-hand-container");
  container.appendChild(cardElement);
}

function renderHandCard(cardData) {
  const cardElement = document.createElement("div");

  cardElement.className = "my card";

  cardElement.setAttribute("data-id", cardData.id);

  cardElement.innerHTML = `
    <div class="card-content">
      <img src="${cardData.img}" class="card-icon" alt="${cardData.type}">
      <h2>${cardData.type}</h2>
      <p>${cardData.text}</p>
    </div>
  `;

  const container = document.querySelector("#player-hand-container");
  container.appendChild(cardElement);
}

function renderEnemyHandCard(cardData) {
  const cardElement = document.createElement("div");

  cardElement.className = "opp card-back";

  cardElement.setAttribute("data-id", cardData.id);

  // to hide card type from player later, TBD
  cardElement.innerHTML = `
    <div class="card-content">
      <img src="${cardData.img}" class="card-icon" alt="${cardData.type}">
      <h2>${cardData.type}</h2>
      <p>${cardData.text}</p>
    </div>
  `;

  cardElement.classList.add("card-back-hidden");

  const container = document.querySelector("#enemy-hand-container");
  container.appendChild(cardElement);
}

function playerDraw() {
  const drawnCard = deck.pop();
  playerHand.push(drawnCard);
  renderHandCard(drawnCard);
  deckCount.innerText = deck.length + " cards left";
}

function enemyDraw() {
  const drawnCard = deck.pop();
  enemyHand.push(drawnCard);
  renderEnemyHandCard(drawnCard);
  deckCount.innerText = deck.length + " cards left";
}

const checkFirstTurnWithCardDealtCopy = async (player, enemy) => {
  if (player.SPD >= enemy.SPD) {
    turn = "Player";
    updateDialogue(`Player is faster and will go first!`);
    await delay(msgDelay);
    updateDialogue("Dealing Hands...");
    // the following is preload hand for testing purpose, TBD
    preloadHandForTesting(playerHandTest, enemyHandTest, turn); // for testing, TBD
    // the following is the actual code for dealing hand, to be restored after testing, TBD
    // for (let i = 0; i < 3; i++) {
    //   playerDraw();
    //   await delay(shortDelay);
    //   enemyDraw();
    //   await delay(shortDelay);
    // }
    await delay(shortDelay);
    playerTurn();
  } else {
    turn = "Enemy";
    updateDialogue(`Enemy is faster and will go first!`);
    await delay(msgDelay);
    updateDialogue("Dealing Hands...");
    // the following is preload hand for testing purpose, TBD
    preloadHandForTesting(playerHandTest, enemyHandTest, turn); // for testing, TBD
    // the following is the actual code for dealing hand, to be restored after testing, TBD
    // for (let i = 0; i < 3; i++) {
    //   enemyDraw();
    //   await delay(shortDelay);
    //   playerDraw();
    //   await delay(shortDelay);
    // }
    await delay(shortDelay);
    enemyTurn();
  }
  log(); //Deck content check only, TBD
};

const checkFirstTurnWithCardDealt = async (player, enemy) => {
  if (player.SPD >= enemy.SPD) {
    turn = "Player";
    updateDialogue(`Player is faster and will go first!`);
    await delay(msgDelay);
    updateDialogue("Dealing Hands...");
    // the following is preload hand for testing purpose, TBD
    preloadHandForTesting(playerHandTest, enemyHandTest, turn); // for testing, TBD
    // the following is the actual code for dealing hand, to be restored after testing, TBD
    // for (let i = 0; i < 3; i++) {
    //   playerDraw();
    //   await delay(shortDelay);
    //   enemyDraw();
    //   await delay(shortDelay);
    // }
    await delay(shortDelay);
    return turn;
  } else {
    turn = "Enemy";
    updateDialogue(`Enemy is faster and will go first!`);
    await delay(msgDelay);
    updateDialogue("Dealing Hands...");
    // the following is preload hand for testing purpose, TBD
    preloadHandForTesting(playerHandTest, enemyHandTest, turn); // for testing, TBD
    // the following is the actual code for dealing hand, to be restored after testing, TBD
    // for (let i = 0; i < 3; i++) {
    //   enemyDraw();
    //   await delay(shortDelay);
    //   playerDraw();
    //   await delay(shortDelay);
    // }
    await delay(shortDelay);
    return turn;
  }
  log(); //Deck content check only, TBD
};

const gameFlowManager = async (firstTurn, sessionId) => {
  while (
    player.HP > 0 &&
    enemy.HP > 0 &&
    !isGameOver &&
    sessionId === gameSessionId
  ) {
    if (firstTurn === "Player") {
      await playerTurn(sessionId);
      if (sessionId !== gameSessionId || checkGameOver()) break;
      await enemyTurn(sessionId);
    } else {
      await enemyTurn(sessionId);
      if (sessionId !== gameSessionId || checkGameOver()) break;
      await playerTurn(sessionId);
    }
  }
};

// Visual Turn Indicator by border highlight
const turnIndicator = () => {
  if (turn === "Player") {
    document.querySelector(".zone.player-hand").style.border =
      "8px solid yellow";
    document.querySelector(".zone.enemy-hand").style.border = "3px dashed grey";
    document.querySelector(".player-face").style.border = "5px solid yellow";
    document.querySelector(".enemy-face").style.border = "3px dashed grey";
    document.querySelector(".zone.player").style.border = "5px solid yellow";
    document.querySelector(".zone.enemy").style.border = "3px dashed grey";
    document.querySelector(".zone.player").style.fontWeight = "bold";
    document.querySelector(".zone.enemy").style.fontWeight = "400";
  } else if (turn === "Enemy") {
    document.querySelector(".zone.player-hand").style.border =
      "3px dashed grey";
    document.querySelector(".zone.enemy-hand").style.border =
      "8px solid yellow";
    document.querySelector(".player-face").style.border = "3px dashed grey";
    document.querySelector(".enemy-face").style.border = "5px solid yellow";
    document.querySelector(".zone.player").style.border = "3px dashed grey";
    document.querySelector(".zone.enemy").style.border = "5px solid yellow";
    document.querySelector(".zone.player").style.fontWeight = "400";
    document.querySelector(".zone.enemy").style.fontWeight = "bold";
  } else {
    console.warn("Invalid turn value! Check your turn logic.");
  }
};

// Dialogue Update Function

const updateDialogue = (message) => {
  document.querySelector("#dialogue-box").innerHTML = message;
};

// Pause function (currently used for dodged reaction only, can be used for future effect animation or card effect)
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Timer function
const startVisualTimer = (seconds) => {
  // below function would run down second and update dialogue
  let timeLeft = seconds;
  const timerElement = document.querySelector("#timer-count");

  const interval = setInterval(() => {
    // countdown starts here
    timeLeft--;
    if (timerElement) timerElement.innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(interval);
    }
  }, 1000);

  return interval;
};

const waitForClick = (element) => {
  let onClick;

  const cleanup = () => {
    if (onClick) {
      element.removeEventListener("click", onClick);
    }
  };

  return new Promise((resolve) => {
    // This is the internal logic that runs when a click happens
    onClick = (event) => {
      // Use .closest to see if a .card (or something inside it) was clicked
      const card = event.target.closest(".card");
      if (!card) return; // If they didn't click on a card, ignore the click
      // for console, to be removed after testing
      console.log(`You clicked: ${card.innerText}`);
      if (card) {
        event.stopPropagation();
        // 1. Clean up: Remove the listener so it doesn't stay active forever
        cleanup();

        // 2. Resolve: Tell the 'await' that we are finished and return the card
        // return card id
        resolve(card.dataset.id);
      }
    };
    // Attach the listener to the parent container
    element.addEventListener("click", onClick);
  });
};

// for dodged card reaction
const waitForReaction = (timeoutMs) => {
  return new Promise((resolve) => {
    let timeLeft = timeoutMs / 1000;
    const playerHandUI = document.querySelector("#player-hand-container");

    // 1. Select ALL cards in hand
    const allCardsUI = Array.from(playerHandUI.querySelectorAll(".card"));

    // 2. Filter for ALL Missed cards
    const dodgedCardsUI = allCardsUI.filter((el) =>
      el.innerText.includes("DODGED"),
    );

    // If you have no missed cards, fail immediately
    if (dodgedCardsUI.length === 0) {
      resolve(null);
      return;
    }

    updateDialogue(`Incoming Attack! Play DODGED? (${timeLeft}s)`);

    const countdownInterval = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft > 0) {
        updateDialogue(`Incoming Attack! Play DODGED? (${timeLeft}s)`);
      }
    }, 1000);

    // This function will run regardless of WHICH dodged card is clicked
    const onClick = (event) => {
      const clickedCard = event.currentTarget;
      cleanup();
      // We resolve with the specific ID of the card clicked
      // so we know which one to remove from the array later
      resolve({ status: "DODGED_PLAYED", cardId: clickedCard.dataset.id });
    };

    const cleanup = () => {
      clearInterval(countdownInterval);
      clearTimeout(timer);
      // Remove the listener from ALL dodged cards
      dodgedCardsUI.forEach((card) => {
        card.removeEventListener("click", onClick);
      });
    };

    // 3. Attach the listener to EVERY dodged card
    dodgedCardsUI.forEach((card) => {
      card.addEventListener("click", onClick);
    });

    const timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);
  });
};

const playerTurnCountDown = async function (sessionId) {
  let turnTime = 20; // 20 seconds to move

  const endBtn = renderEndTurnButton(); // Create the button and store it in a variable

  updateDialogue(
    `Please make a move... (<span id="timer-count">${turnTime}</span>s)`,
  );

  const visualClock = startVisualTimer(turnTime); // start countdown
  const handZone = document.querySelector("#player-hand-container");

  const waitBtnClick = new Promise((resolve) => {
    endBtn.addEventListener("click", () => resolve("END_TURN_CLICKED"), {
      once: true,
    });
  });

  let checkId;
  const waitForGameOver = new Promise((resolve) => {
    checkId = setInterval(() => {
      if (isGameOver || sessionId !== gameSessionId) {
        clearInterval(checkId);
        resolve("GAME_OVER");
      }
    }, 100);
  });

  // Promise.race to wait either for click or timeout
  const result = await Promise.race([
    waitForClick(handZone),
    waitBtnClick,
    waitForGameOver,
    delay(turnTime * 1000).then(() => "TIMEOUT"),
  ]);

  clearInterval(visualClock);
  clearInterval(checkId);
  endBtn.remove();

  return result;
};

const resolveCardEffect = async (card) => {
  switch (card.type) {
    case "ATTACK":
      if (turn.includes("Player")) {
        updateDialogue(`Your hit is about to land...`);
        await pause(msgDelay);

        // Enemy DODGED card check
        const dodgedIndex = enemyHand.findIndex((c) => c.type === "DODGED");
        const cardData = enemyHand[dodgedIndex];
        if (dodgedIndex !== -1) {
          //Append card from enemy hand to active zone
          const dodgedCardElement = document.querySelector(
            `[data-id="${cardData.id}"]`,
          );
          dodgedCardOntoActiveZone(dodgedCardElement, turn);
          // Enemy avoids the damage
          const dodgedCard = enemyHand[dodgedIndex];
          updateDialogue(`Enemy played DODGED! Your attack was blocked.`);
          const movedCard = enemyHand.splice(dodgedIndex, 1)[0];
          enemyActiveZone.push(movedCard);
          await delay(3000);
        } else {
          // No reaction, proceed with damage
          enemy.attack(player.ATK);
          loadEnemyData(enemy);
          updateDialogue(
            `No DODGED!! You attacked the enemy for ${player.ATK} damage!`,
          );
          await delay(3000);
        }
      } else {
        // Enemy Attacking Player logic, add player reaction for DODGED card
        updateDialogue("Incoming Attack! Brace yourself...");

        // 1. Give the player 10 seconds to click their DODGED card
        const toPlayDodged = await waitForReaction(10000);

        if (toPlayDodged && toPlayDodged.status === "DODGED_PLAYED") {
          // Use the specific ID from the click to remove the correct card
          const index = playerHand.findIndex(
            (c) => c.id == toPlayDodged.cardId,
          );
          const cardData = playerHand[index];
          const cardElement = document.querySelector(
            `[data-id="${cardData.id}"]`,
          );
          dodgedCardOntoActiveZone(cardElement, turn);
          // Remove from player hand array
          if (index !== -1) {
            const movedCard = playerHand.splice(index, 1)[0];
            playerActiveZone.push(movedCard);
          }
          // Remove card from player hand and put onto active zone
          // renderPlayerHand();

          updateDialogue("You played DODGED! Damage avoided.");
        } else {
          player.attack(enemy.ATK);
          loadPlayerData(player);
          updateDialogue(`The enemy hit you for ${enemy.ATK} damage!`);
          await delay(3000);
        }

        break;
      }
    case "DODGED":
      // Implement dodged logic
      // No need to do anything here if reaction is handled in the attack case
      break;
    case "HEAL":
      // Implement heal logic
      if (turn.includes("Player")) {
        player.heal(3); // Example heal amount
        loadPlayerData(player);
        updateDialogue(`You healed for 3 damage!`);
      } else {
        enemy.heal(3); // Example heal amount
        loadEnemyData(enemy);
        updateDialogue(`The enemy healed for 3 damage!`);
      }
      break;
    case "CRITICAL":
      // Implement critical hit logic
      if (turn.includes("Player")) {
        enemy.critical(player.SPD);
        loadEnemyData(enemy);
        updateDialogue(
          `Cannot be dodged! You attacked the enemy for ${player.SPD} damage!`,
        );
        await delay(msgDelay);
      } else {
        player.critical(enemy.SPD);
        loadPlayerData(player);
        updateDialogue(
          `Cannot be dodged! The enemy attacked you for ${enemy.SPD} damage!`,
        );
        await delay(msgDelay);
      }
      break;
    case "BOMB":
      // Implement bomb logic
      const enemyBombDamage = enemy.bomb();
      loadEnemyData(enemy);
      const playerBombDamage = player.bomb();
      loadPlayerData(player);
      updateDialogue(
        `Ka-BOOM! You lose ${playerBombDamage} HP and the enemy loses ${enemyBombDamage} HP!`,
      );
      await delay(msgDelay);
      break;
    case "POISON":
      // Implement poison logic
      if (turn.includes("Player")) {
        isEnemyPoisoned = true;
        document.querySelector(".enemy-face").style.background = "red";
        updateDialogue(" The enemy is poisoned!");
        return true; // Return true to indicate enemy is poisoned
      } else {
        isPlayerPoisoned = true;
        document.querySelector(".player-face").style.background = "red";
        updateDialogue(" You are poisoned!");
        return true; // Return true to indicate player is poisoned
      }
  }
};

const renderEndTurnButton = () => {
  // 1. Clean up: Remove old button if it exists so we don't get duplicates
  document.querySelector("#end-turn-button")?.remove();

  const btn = document.createElement("button");
  btn.id = "end-turn-button";
  btn.innerText = "End Turn";
  btn.className = "control-btn"; // Add a class for your CSS styling
  // btn.style.display = "flex";
  // btn.style.flexDirection = "column";
  // btn.style.justifyContent = "center";
  // btn.style.alignItems = "center";

  // 2. Append to the specific play area
  const playArea = document.querySelector(".active-player"); // Change this selector to target the correct area
  if (playArea) {
    // If the play area exists, append the button to it
    playArea.appendChild(btn);
  }
  return btn; // Return it so we can listen for clicks!
};

const renderResetButton = () => {
  document.querySelector("#reset-button")?.remove();

  const btn = document.createElement("button");
  btn.id = "reset-button";
  btn.innerText = "Reset Game";
  btn.className = "control-btn";
  const playArea = document.querySelector(".active-player");
  if (playArea) {
    playArea.appendChild(btn);
  }
  btn.addEventListener("click", () => {
    isGameOver = true;
    init();
    btn.remove();
  });
};

const cardOntoActiveZone = (cardData, turn) => {
  const activeZone =
    turn === "Player"
      ? document.querySelector(".active-player")
      : document.querySelector(".active-enemy");
  if (activeZone && cardData) {
    activeZone.appendChild(cardData);
    cardData.className =
      turn === "Player" ? "card player-active-card" : "card enemy-active-card";
  } else {
    console.warn("Active zone or card not found! Check your HTML structure.");
  }
};

const dodgedCardOntoActiveZone = (cardData, turn) => {
  const activeZone =
    turn === "Player"
      ? document.querySelector(".active-enemy")
      : document.querySelector(".active-player");
  if (activeZone && cardData) {
    activeZone.appendChild(cardData);
    cardData.className =
      turn === "Player" ? "card player-active-card" : "card enemy-active-card";
  } else {
    console.warn("Active zone or card not found! Check your HTML structure.");
  }
};

// Initializing Game
const init = async () => {
  const mySessionId = ++gameSessionId;

  updateDialogue("Initializing Data...");
  // the following initialize JS variables
  deck = [];
  playerHand = [];
  enemyHand = [];
  playerActiveZone = [];
  enemyActiveZone = [];
  discardPile = [];
  discardCount = 0;
  turn = "";
  isGameOver = false;
  isPlayerPoisoned = false;
  isEnemyPoisoned = false;
  wantToStopPoison = false;
  player = new Warrior();
  enemy = new DemonKing();
  document.querySelector("#end-turn-button")?.remove();
  document.querySelector("#reset-button")?.remove();
  // the following clear HTML elements
  resetPlayerHand();
  resetEnemyHand();
  resetActiveZones();
  resetHTMLDOM();
  await delay(2000);
  if (mySessionId !== gameSessionId) return;
  updateDialogue("Loading Character Data...");
  await delay(2000);
  if (mySessionId !== gameSessionId) return;
  loadPlayerData(player);
  loadEnemyData(enemy);
  await delay(2000);
  if (mySessionId !== gameSessionId) return;

  updateDialogue("Creating Deck...");
  createDeck();
  await delay(2000);
  if (mySessionId !== gameSessionId) return;

  updateDialogue("Shuffling Deck...");
  shuffleDeck(deck);
  await delay(2000);
  if (mySessionId !== gameSessionId) return;

  const firstTurn = await checkFirstTurnWithCardDealt(player, enemy);
  if (mySessionId !== gameSessionId) return;

  await gameFlowManager(firstTurn, mySessionId);
};

const playerTurn = async function (sessionId) {
  if (sessionId !== gameSessionId || isGameOver) return;

  console.log(`Turn Start: ${turn}`);
  // Visually indicate turn change by borders
  turnIndicator();
  // Draw 1 card at start of turn
  if (deck.length !== 0) {
    playerDraw();
    console.log("check player hand: ", playerHand); // for test, TBD
  } else {
    console.log("Deck is empty, cannot draw more cards. Game Ended");
    updateDialogue("Deck is empty, cannot draw more cards. Game Ended");
    isGameOver = true;
    renderResetButton();
    return; // Exit the function if the deck is empty
  }

  // if (isPlayerPoisoned) {
  //   await delay(flowDelay);
  //   player.poison();
  //   loadPlayerData(player);
  //   updateDialogue(
  //     "You take 2 damage due to poison! Use Heal to remove the poison effect!",
  //   );
  //   await delay(msgDelay);
  // }
  updateDialogue("You draw 1 card...");
  await delay(flowDelay);
  console.log("Your move please");

  // Check if turn is ended or timeout
  let isTurnOver = false;
  // Check if only one attack or critical card can be played per turn
  let isAttackCardPlayed = false;
  let isCriticalCardPlayed = false;
  let isBombCardPlayed = false;
  let poisonDamageThisTurn = false;

  // LOOP START HERE
  while (!isTurnOver) {
    if (sessionId !== gameSessionId || isGameOver) return;

    // Check poison effect at the start of the loop
    if (isPlayerPoisoned && !poisonDamageThisTurn) {
      player.poison();
      loadPlayerData(player);
      updateDialogue(
        "You take 2 damage due to poison! Use Heal to remove the poison effect!",
      );
      await delay(msgDelay);
      poisonDamageThisTurn = true;
    }
    if (checkGameOver()) return;

    // This gives string such as "END_TURN_CLICKED", "TIMEOUT", or the clicked card element
    const outcome = await playerTurnCountDown(sessionId);

    if (sessionId !== gameSessionId || isGameOver) return;
    if (checkGameOver()) return;
    if (
      outcome === "TIMEOUT" ||
      outcome === "END_TURN_CLICKED" ||
      outcome === "GAME_OVER"
    ) {
      updateDialogue("Turn ended.");
      isTurnOver = true;
    } else {
      // 1. Define cardData here so the rest of the function can see it
      // outcome is the clicked <div>, we use its dataset.id to find the object
      const cardData = playerHand.find((c) => c.id == outcome);
      const cardIndex = playerHand.findIndex((c) => c.id == cardData.id);

      // 2. The Restriction Check before playing a card
      // NEW VALIDATION GATE
      if (cardData.type === "DODGED") {
        updateDialogue("Invalid move!! There is no incoming attack to dodge.");
        await delay(flowDelay);
        continue; // This jumps back to the start of the 'while' loop
      }

      if (cardData.type === "ATTACK" && isAttackCardPlayed) {
        updateDialogue("Limit reached: Only 1 ATTACK per turn!");
        await delay(flowDelay);
        continue; // Restart the loop so player can pick a different card
      }

      if (cardData.type === "CRITICAL" && isCriticalCardPlayed) {
        updateDialogue("Limit reached: Only 1 CRITICAL per turn!");
        await delay(flowDelay);
        continue; // Restart the loop so player can pick a different card
      }
      if (cardData.type === "BOMB" && isBombCardPlayed) {
        updateDialogue("Limit reached: Only 1 BOMB per turn!");
        await delay(flowDelay);
        continue; // Restart the loop so player can pick a different card
      }
      if (isPlayerPoisoned && !poisonDamageThisTurn) {
        player.poison();
        loadPlayerData(player);
        updateDialogue(
          "You take 2 damage due to poison! Use Heal to remove the poison effect!",
        );
        await delay(msgDelay);
        // return (poisonDamageThisTurn = true);
      }

      // 4. Remove the card from hand and place on active zone
      const cardElement = document.querySelector(`[data-id="${cardData.id}"]`);

      if (cardElement) {
        cardOntoActiveZone(cardElement, turn);
      }

      // Improvement, move card from hand array to active zone array
      if (cardIndex !== -1) {
        const movedCard = playerHand.splice(cardIndex, 1)[0];
        playerActiveZone.push(movedCard);
      } else {
        console.warn(
          "Card not found in player hand array or index is invalid.",
        );
      }

      // Resolve the card effect after removal from hand
      // Then enforce the boolean switch for attack and critical cards
      // for the 1 card limitation
      updateDialogue(`You played ${cardData.type}!`);
      console.log(`What is cardData? ${cardData}!`); // for test, TBD
      await delay(flowDelay);
      await resolveCardEffect(cardData);
      await delay(flowDelay);
      // Visual, make HP red when low
      if (player.HP <= player.maxHP / 3) {
        document.querySelector(".player-hp").style.color = "red";
      }
      if (enemy.HP <= enemy.maxHP / 3) {
        document.querySelector(".enemy-hp").style.color = "red";
      }

      if (checkGameOver()) return;

      if (cardData.type === "ATTACK") {
        isAttackCardPlayed = true;
        console.log("Attack switch flipped to TRUE"); // for test, TBD
      }
      if (cardData.type === "CRITICAL") {
        isCriticalCardPlayed = true;
        console.log("Critical switch flipped to TRUE"); // for test, TBD
      }
      if (cardData.type === "BOMB") {
        isBombCardPlayed = true;
        console.log("BOMB switch flipped to TRUE"); // for test, TBD
      }
      if (cardData.type === "HEAL") {
        if (isPlayerPoisoned) {
          document.querySelector(".player-face").style.background = "";
          console.log("Player is no longer poisoned"); // for test, TBD
          updateDialogue(`You are no longer poisoned!`);
          await delay(msgDelay);
        }
        isPlayerPoisoned = false;
      }
      // if (cardData.type === "POISON" && !isPlayerPoisoned) {
      //   isPlayerPoisoned = true;
      //   document.querySelector(".player-face").style.background = "red";
      //   console.log("Player is now poisoned"); // for test, TBD
      // }
    }
  }
  // End Phase, move objects from active zone array to discard pile array with discard pile count
  // this includes remove html element in active zone and add to discard pile (if required)
  for (const card of playerActiveZone) {
    discardPile.push(card);
    discardCount++;
    console.log("Discard Pile: ", discardPile); //TBD
    console.log(`Discard Count: ${discardCount}`); //TBD
    if (discardCount > 0) {
      discardEl.classList.add("card-back-hidden");
    }

    discardCountEl.innerHTML = `Discarded: ${discardCount}`;
  }
  // if dodged card is played during player turn from enemy
  for (const card of enemyActiveZone) {
    discardPile.push(card);
    discardCount++;
    console.log("Discard Pile: ", discardPile); //TBD
    console.log(`Discard Count: ${discardCount}`); //TBD
    if (discardCount > 0) {
      discardEl.classList.add("card-back-hidden");
    }
    discardCountEl.innerHTML = `Discarded: ${discardCount}`;
  }
  // to confirm if player active zone array is empty
  playerActiveZone = [];
  // to remove card element in active-player zone
  document.querySelector(".active-player").innerHTML = "";
  document.querySelector(".active-enemy").innerHTML = "";

  // End Phase, Switch to Enemy
  console.log("Player turn ended, moving to Enemy ..."); // for test, TBD
  updateDialogue("Player turn ended, moving to Enemy ...");
  await delay(2000);
  turn = "Enemy";
  updateDialogue(`It is ${turn}'s turn.`);
};

const enemyTurn = async function (sessionId) {
  if (sessionId !== gameSessionId || isGameOver) return;

  console.log(`Turn Start: ${turn}`);

  turnIndicator();
  // Draw 1 card at start of turn
  if (deck.length !== 0) {
    enemyDraw();
    console.log("check enemy hand: ", enemyHand); // for test, TBD
  } else {
    console.log("Deck is empty, cannot draw more cards. Game Ended");
    updateDialogue("Deck is empty, cannot draw more cards. Game Ended");
    isGameOver = true;
    renderResetButton();
    return; // Exit the function if the deck is empty
  }

  // if (isEnemyPoisoned) {
  //   await delay(flowDelay);
  //   enemy.poison();
  //   loadEnemyData(enemy);
  //   updateDialogue(
  //     "Enemy takes 2 damage due to poison! Use Heal to remove the poison effect!",
  //   );
  //   await delay(msgDelay);
  // }

  updateDialogue("Your Enemy draw 1 card...");
  await delay(flowDelay);
  updateDialogue("Your Enemy is thinking...");
  await delay(flowDelay);

  let isTurnOver = false;
  // Check if only one attack or critical card can be played per turn
  let isAttackCardPlayed = false;
  let isCriticalCardPlayed = false;
  let isBombCardPlayed = false;
  let wantToStopHeal = enemy.HP >= enemy.maxHP ? true : false;
  let poisonDamageThisTurn = false;
  console.log(
    "Does Enemy want to stop Heal at the beginning of turn?: ",
    wantToStopHeal,
  ); // for test, TBD

  // AI logic with for loop
  for (let i = 0; i < enemyHand.length; ) {
    if (sessionId !== gameSessionId || isGameOver) return;

    // Check poison effect at the start of the loop
    if (isEnemyPoisoned && !poisonDamageThisTurn) {
      enemy.poison();
      loadEnemyData(enemy);
      updateDialogue(
        "Enemy takes 2 damage due to poison! Use Heal to remove the poison effect!",
      );
      await delay(msgDelay);
      poisonDamageThisTurn = true;
    } else {
      console.log("No poison damage this turn or already took poison damage."); //TBD
    }
    console.log("Check poisonDamageThisTurn flag: ", poisonDamageThisTurn); // for test, TBD
    console.log(
      "Is enemy poisoned at the start of the loop? ",
      isEnemyPoisoned,
    ); // for test, TBD
    if (checkGameOver()) return;

    const cardData = enemyHand[i];
    // below console log for check, TBD
    console.log("Card Type Detected:", cardData.type);
    console.log("Card ID is:", cardData.id);
    console.log("Is Attack already played?:", isAttackCardPlayed);
    console.log("Is Critical already played?:", isCriticalCardPlayed);
    console.log("Does Enemy want to stop Heal?:", wantToStopHeal);

    // Validation: during loop, if card is not valid for play, i++ to move to next
    if (enemy.HP < enemy.maxHP) wantToStopHeal = false;

    if (cardData.type === "DODGED") {
      i++; // skip dodged cards
      continue;
    }
    if (cardData.type === "ATTACK" && isAttackCardPlayed) {
      i++;
      continue;
    }
    if (cardData.type === "CRITICAL" && isCriticalCardPlayed) {
      i++;
      continue;
    }
    if (cardData.type === "BOMB" && isBombCardPlayed) {
      i++;
      continue;
    }

    if (cardData.type === "HEAL" && wantToStopHeal) {
      i++;
      continue;
    }
    if (cardData.type === "POISON" && isPlayerPoisoned) {
      i++;
      continue;
    }

    // Play the card from hand to zone (HTML visual)
    updateDialogue(`Enemy is about to play ${cardData.type}...`);
    const cardElement = document.querySelector(`[data-id="${cardData.id}"]`);
    if (cardElement) {
      cardOntoActiveZone(cardElement, turn);
      console.log(
        `Card: ${cardData.type} , ID: ${cardData.id} placed on active zone`,
      );
    } else {
      console.warn("Card element not found for active zone placement!");
    }

    // Remove from hand and DO NOT increment i (next card shifts into current index)
    // enemyHand.splice(i, 1);
    // console.log(`Enemy hand after playing card: ${enemyHand}`);

    if (i !== -1) {
      const movedCard = enemyHand.splice(i, 1)[0];
      enemyActiveZone.push(movedCard);
    } else {
      console.warn("Card not found in enemy hand array or index is invalid.");
    }

    await delay(flowDelay);
    await resolveCardEffect(cardData);
    await delay(flowDelay);
    // Visual, make HP red when low
    if (enemy.HP <= enemy.maxHP / 3) {
      document.querySelector(".enemy-hp").style.color = "red";
    }
    if (player.HP <= player.maxHP / 3) {
      document.querySelector(".player-hp").style.color = "red";
    }

    if (checkGameOver()) return;
    if (cardData.type === "ATTACK") isAttackCardPlayed = true;
    if (cardData.type === "CRITICAL") isCriticalCardPlayed = true;
    if (cardData.type === "BOMB") isBombCardPlayed = true;
    if (enemy.HP >= enemy.maxHP) wantToStopHeal = true;
    wantToStopPoison = isPlayerPoisoned ? true : false;

    if (cardData.type === "HEAL") {
      if (isEnemyPoisoned) {
        document.querySelector(".enemy-face").style.background = "";
        console.log("Enemy is no longer poisoned"); // for test, TBD
        updateDialogue(`Enemy is no longer poisoned!`);
        await delay(msgDelay);
      }
      isEnemyPoisoned = false;
    }

    // loop continues without i++ so next element at index i is processed
    await delay(flowDelay);
  }

  // Win/Lose Check if enemy has no more cards to play
  if (checkGameOver()) return;

  // End Phase, move objects from active zone array to discard pile array with discard pile count
  for (const card of enemyActiveZone) {
    discardPile.push(card);
    discardCount++;
    console.log("Discard Pile: ", discardPile); // TBD
    console.log(`Discard Count: ${discardCount}`); //TBD
    if (discardCount > 0) {
      discardEl.classList.add("card-back-hidden");
    }

    discardCountEl.innerHTML = `Discarded: ${discardCount}`;
  }
  // if dodged card is played during enemy turn from player
  for (const card of playerActiveZone) {
    discardPile.push(card);
    discardCount++;
    console.log("Discard Pile: ", discardPile); // TBD
    console.log(`Discard Count: ${discardCount}`); //TBD
    if (discardCount > 0) {
      discardEl.classList.add("card-back-hidden");
    }
    discardCountEl.innerHTML = `Discarded: ${discardCount}`;
    `Discard Pile: ${discardCount}`;
  }

  // to confirm if enemy active zone array is empty
  enemyActiveZone = [];
  // to remove card element in active-player zone
  document.querySelector(".active-player").innerHTML = "";
  document.querySelector(".active-enemy").innerHTML = "";

  await delay(flowDelay);
  console.log("Enemy turn ended, moving to Player...");
  updateDialogue("Enemy turn ended, moving to Player...");
  await delay(msgDelay);
  turn = "Player";
  updateDialogue(`It is ${turn}'s turn.`);
};

const checkGameOver = () => {
  if (isGameOver) return true;

  if (player.HP <= 0 || enemy.HP <= 0) {
    isGameOver = true;

    if (player.HP <= 0 && enemy.HP <= 0) {
      updateDialogue("Game ended in a Draw!");
      document.querySelector(".enemy-face").style.background = "grey";
      document.querySelector(".player-face").style.background = "grey";
    } else if (player.HP <= 0) {
      updateDialogue("You have been defeated! YOU LOSE!");
      document.querySelector(".player-face").style.background = "grey";
    } else {
      updateDialogue("You have defeated the enemy! YOU WIN!");
      document.querySelector(".enemy-face").style.background = "grey";
    }

    renderResetButton();
    return true;
  }

  return false;
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
