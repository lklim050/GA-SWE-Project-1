// -----------------Constants and Variables------------------------
// Allows future type additions and quantity changes
const cardTypes = ["ATTACK", "DODGED", "HEAL", "CRITICAL"];
const cardTypesQuantity = [8, 8, 0, 0];

let playerHand = [];
let enemyHand = [];
let player;
let enemy;
let deck = [];
let turn = "";
let winner = false;

const dialogue = document.querySelector("#dialogue-box");
const playerText = document.querySelector(".player-text");
const enemyText = document.querySelector(".enemy-text");
const deckCount = document.querySelector("#draw-deck");
// const handContainer = document.getElementById("player-hand-container");

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
    this.HP -= amount + 2;
    if (this.HP < 0) this.HP = 0;
  }
};

// const Warrior = new Character("Warrior", 4, 14, 14, 2);
// const Minion = new Character("Minion", 1, 6, 6, 1);
const Mage = new Character("Mage", 5, 12, 12, 3);
const Ninja = new Character("Ninja", 6, 10, 10, 4);
const DemonKing = new Character("Demon-King", 9, 15, 15, 0);

class Warrior extends Character {
  constructor() {
    super("Warrior", 4, 14, 14, 2);
  }
}

class Minion extends Character {
  constructor() {
    super("Minion", 1, 8, 8, 1);
  }
}

// Reset the board and hands
// const Warrior = class extends Character {
//   constructor(name="warrior", ATK=4, HP=12, SPD=2) {
//     super(name, ATK, HP, SPD);
//   }
// };

// -----------------------Functions---------------------------------

// Reseting Hand Array and HTML
const resetPlayerHand = () => {
  playerHand = [];
  // 1. Select only the elements with class 'card' that are INSIDE the enemy zone
  const playerCards = document.querySelectorAll("#player-hand-container .card");

  // 2. Loop and remove ONLY those cards
  playerCards.forEach((card) => {
    card.remove();
  });

  console.log("Player cards cleared. Face is safe!");
};

const resetEnemyHand = () => {
  enemyHand = [];
  // 1. Select only the elements with class 'card' that are INSIDE the enemy zone
  const enemyCards = document.querySelectorAll(
    "#enemy-hand-container .card-back",
  );

  // 2. Loop and remove ONLY those cards
  enemyCards.forEach((card) => {
    card.remove();
  });

  console.log("Enemy cards cleared. Face is safe!");
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

// Creating Deck Content
const createDeck = () => {
  deck = [];
  for (let i = 0; i < cardTypes.length; i++) {
    for (let j = 0; j < cardTypesQuantity[i]; j++) {
      let card = { type: cardTypes[i] };
      deck.push(card);
    }
  }
  for (let i = 0; i < deck.length; i++) {
    deck[i].id = i;
  }
  deckCount.innerText = deck.length + " cards left";
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
      <h4>${cardData.type}</h4>
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
      <h4>${cardData.type}</h4> 
    </div>
  `;

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

const checkFirstTurn = async (player, enemy) => {
  if (player.SPD >= enemy.SPD) {
    turn = "Player";
    updateDialogue(`Player is faster and will go first!`);
    await delay(2000);
    playerTurn();
  } else {
    turn = "Enemy";
    updateDialogue(`Enemy is faster and will go first!`);
    await delay(2000);
    enemyTurn();
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

// Pause function
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Timer function
const startVisualTimer = (seconds) => {
  let timeLeft = seconds;
  const timerElement = document.querySelector("#timer-count");

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
      if (card.dataset.id !== "DODGED") {
        // 1. Clean up: Remove the listener so it doesn't stay active forever
        element.removeEventListener("click", onClick);

        // 2. Resolve: Tell the 'await' that we are finished and return the card
        resolve(card);
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

const playerTurnCountDown = async function () {
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

  // Promise.race to wait either for click or timeout
  const result = await Promise.race([
    waitForClick(handZone),
    waitBtnClick,
    delay(turnTime * 1000).then(() => "TIMEOUT"),
  ]);

  clearInterval(visualClock);
  endBtn.remove();

  return result;
};

const resolveCardEffect = async (card) => {
  switch (card.type) {
    case "ATTACK":
      if (turn.includes("Player")) {
        updateDialogue(`You are aiming at the enemy...`);
        await pause(2000);

        // Enemy DODGED card check
        const dodgedIndex = enemyHand.findIndex((c) => c.type === "DODGED");

        if (dodgedIndex !== -1) {
          // Enemy avoids the damage
          const dodgedCard = enemyHand[dodgedIndex];
          updateDialogue(`Enemy played DODGED! Your attack was blocked.`);
          console.log("enemy played dodged card successfully"); // for test, TBD
          enemyHand.splice(dodgedIndex, 1);
          // removeCardFromUI(dodgedCard.id);
          console.log(enemyHand); // for test, TBD
          await delay(3000);
        } else {
          // No reaction, proceed with damage
          enemy.attack(player.ATK);
          loadEnemyData(enemy);
          updateDialogue(`You attacked the enemy for ${player.ATK} damage!`);
        }
      } else {
        // Enemy Attacking Player logic, add player reaction for DODGED card
        updateDialogue("Incoming Attack! Brace yourself...");

        // 1. Give the player 10 seconds to click their DODGED card
        const toPlayDodged = await waitForReaction(10000);

        if (toPlayDodged && toPlayDodged.status === "DODGED_PLAYED") {
          updateDialogue("You played DODGED! Damage avoided.");

          // Use the specific ID from the click to remove the correct card
          const index = playerHand.findIndex(
            (c) => c.id == toPlayDodged.cardId,
          );
          if (index !== -1) {
            playerHand.splice(index, 1);
          }

          // Remove card from player hand and put onto active zone
          // renderPlayerHand();
        } else {
          player.attack(enemy.ATK);
          loadPlayerData(player);
          updateDialogue(`The enemy hit you for ${enemy.ATK} damage!`);
        }

        break;
      }
    case "DODGED":
      // Implement dodge logic
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
        enemy.critical(player.ATK);
        loadEnemyData(enemy);
        updateDialogue(`You attacked the enemy for ${player.ATK + 2} damage!`);
      } else {
        player.critical(enemy.ATK);
        loadPlayerData(player);
        updateDialogue(`The enemy attacked you for ${enemy.ATK + 2} damage!`);
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
  // btn.style.display = "flex";
  // btn.style.flexDirection = "column";
  // btn.style.justifyContent = "center";
  // btn.style.alignItems = "center";

  // 2. Append to the specific play area
  const playArea = document.querySelector(".card.active-player"); // Change this selector to target the correct area
  if (playArea) {
    // If the play area exists, append the button to it
    playArea.appendChild(btn);
  }
  return btn; // Return it so we can listen for clicks!
};

const renderResetButton = () => {
  const btn = document.createElement("button");
  btn.id = "reset-button";
  btn.innerText = "Reset Game";
  btn.className = "control-btn";
  const playArea = document.querySelector(".card.active-player");
  if (playArea) {
    playArea.appendChild(btn);
  }
  btn.addEventListener("click", () => {
    init();
    btn.remove();
  });
};

const cardOntoActiveZone = (cardData, turn) => {
  const activeZone =
    turn === "Player"
      ? document.querySelector(".active-player")
      : document.querySelector(".active-enemy");
  if (activeZone) {
    activeZone.appendChild(cardData);
    cardData.className =
      turn === "Player" ? "card active-player" : "card active-enemy";
  } else {
    console.warn("Active zone or card not found! Check your HTML structure.");
  }
};

// Initializing Game
const init = async () => {
  updateDialogue("Initializing Data...");
  // the following clear JS variables
  deck = [];
  turn = "";
  winner = false;
  player = new Warrior();
  enemy = new Minion();
  // the following clear HTML elements
  resetPlayerHand();
  resetEnemyHand();
  resetActiveZones();
  await delay(2000);
  updateDialogue("Loading Character Data...");
  await delay(2000);
  loadPlayerData(player);
  loadEnemyData(enemy);
  await delay(2000);

  updateDialogue("Creating Deck...");
  createDeck();
  await delay(2000);

  updateDialogue("Shuffling Deck...");
  shuffleDeck(deck);
  await delay(2000);

  updateDialogue("Dealing Hands...");
  playerDraw();
  await delay(500);
  enemyDraw();
  await delay(500);
  playerDraw();
  await delay(500);
  enemyDraw();
  await delay(500);
  playerDraw();
  await delay(500);
  enemyDraw();
  await delay(2000);

  checkFirstTurn(player, enemy);

  log(); //Deck content check only, to be removed after testing
};

const playerTurn = async function () {
  console.log(`Turn Start: ${turn}`);

  // Visually indicate turn change by borders
  turnIndicator();
  // Draw 1 card at start of turn
  if (deck.length !== 0) {
    playerDraw();
  } else {
    console.log("Deck is empty, cannot draw more cards. Game Ended");
    updateDialogue("Deck is empty, cannot draw more cards. Game Ended");
    renderResetButton();
    return; // Exit the function if the deck is empty
  }

  await delay(500);
  console.log("Your move please");

  // Check if turn is ended or timeout
  let isTurnOver = false;
  // Check if only one attack or critical card can be played per turn
  let isAttackCardPlayed = false;
  let isCriticalCardPlayed = false;
  // 2. Start the Loop
  while (!isTurnOver) {
    // This gives string such as "END_TURN_CLICKED", "TIMEOUT", or the clicked card element
    const outcome = await playerTurnCountDown();

    if (outcome === "TIMEOUT" || outcome === "END_TURN_CLICKED") {
      updateDialogue("Turn ended.");
      isTurnOver = true;
    } else {
      // 1. Define cardData here so the rest of the function can see it
      // outcome is the clicked <div>, we use its dataset.id to find the object
      const cardData = playerHand.find((c) => c.id == outcome.dataset.id);
      console.log("Card Type Detected:", cardData.type); // for test, TBD
      console.log("Card ID is:", cardData.id); // for test, TBD
      console.log("Is Attack already played?:", isAttackCardPlayed); // for test, TBD

      // 2. The Restriction Check
      // NEW VALIDATION GATE
      if (cardData.type === "DODGED") {
        updateDialogue("Invalid move!! There is no incoming attack to dodge.");
        await delay(1200);
        continue; // This jumps back to the start of the 'while' loop
      }

      if (cardData.type === "ATTACK" && isAttackCardPlayed) {
        updateDialogue("Limit reached: Only 1 ATTACK per turn!");
        await delay(1200);
        continue; // Restart the loop so player can pick a different card
      }

      if (cardData.type === "CRITICAL" && isCriticalCardPlayed) {
        updateDialogue("Limit reached: Only 1 CRITICAL per turn!");
        await delay(1200);
        continue; // Restart the loop so player can pick a different card
      }

      // 4. Remove the card from hand and place on active zone
      const cardIndex = playerHand.findIndex((c) => c.id == cardData.id);
      const cardElement = document.querySelector(`[data-id="${cardData.id}"]`);
      if (cardIndex > -1) {
        cardOntoActiveZone(cardElement, turn);

        // const activePlayerZone = document.querySelector(".active-player");

        // if (activePlayerZone) {
        //   // Card renderng at active player zone after card played
        //   const activeCardVisual = document.createElement("div");
        //   activeCardVisual.className = "card active-player"; // Style this in CSS!
        //   activeCardVisual.innerText = cardData.type;

        //   // Append it to the play area
        //   activePlayerZone.appendChild(activeCardVisual);

        //   // (to implement later) Auto-remove cards from active zone.
        //   // setTimeout(() => {
        //   //   activeCardVisual.remove();
        //   // }, 2000);
        // }

        // 5. Remove the card from hand and UI (from the playerHand array too)
        playerHand.splice(cardIndex, 1);
        // To remove the countdown once a card is played to kill the remaining countdown
        outcome.remove();

        // 6. Resolve the card effect after removal from hand
        // Then enforce the boolean switch for attack and critical cards
        // for the 1 card limitation
        updateDialogue(`You played ${cardData.name}!`);
        await resolveCardEffect(cardData);

        if (cardData.type === "ATTACK") {
          isAttackCardPlayed = true;
          console.log("Attack switch flipped to TRUE"); // for test, TBD
        }
        if (cardData.type === "CRITICAL") {
          isCriticalCardPlayed = true;
          console.log("Critical switch flipped to TRUE"); // for test, TBD
        }
      } else {
        console.log("Card not found in hand!"); // for test, TBD
      }
    }
  }

  // End of Turn, Switch to Enemy
  console.log("Player turn ended, moving to Enemy ..."); // for test, TBD
  updateDialogue("Player turn ended, moving to Enemy ...");
  await delay(2000);
  turn = "Enemy";
  updateDialogue(`It is ${turn}'s turn.`);
  console.log(`It is ${turn}'s turn.`); // for test, TBD

  enemyTurn();
};

const enemyTurn = async function () {
  console.log(`Turn Start: ${turn}`);

  // Visually indicate turn change by borders
  turnIndicator();
  // Draw 1 card at start of turn
  if (deck.length !== 0) {
    enemyDraw();
  } else {
    console.log("Deck is empty, cannot draw more cards. Game Ended");
    updateDialogue("Deck is empty, cannot draw more cards. Game Ended");
    renderResetButton();
    return; // Exit the function if the deck is empty
  }
  //   await delay(1000);
  console.log("Draw 1 card for enemy");
  await delay(1000);
  updateDialogue("Your Enemy is thinking...");
  console.log("Your Enemy is thinking...");
  await delay(2000);

  let isTurnOver = false;
  // Check if only one attack or critical card can be played per turn
  let isAttackCardPlayed = false;
  let isCriticalCardPlayed = false;
  let wantToStopHeal = false;

  for (const card of enemyHand) {
    // const cardIndex = enemyHand.findIndex((c) => c.type === "ATTACK");
    console.log("Card Type Detected:", card.type); // for test, TBD
    console.log("Card ID is:", card.id); // for test, TBD
    console.log("Is Attack already played?:", isAttackCardPlayed); // for test, TBD
    console.log("Is Critical already played?:", isCriticalCardPlayed); // for test, TBD
    console.log("Does Enemy want to stop Heal?:", wantToStopHeal); // for test, TBD

    if (card.type === "DODGED") {
      // when card is DODGED, to continue to the next loop
      continue;
    }
    if (card.type === "ATTACK" && isAttackCardPlayed) {
      // updateDialogue("Limit reached: Only 1 ATTACK per turn!");
      // await delay(1200);
      continue; // Restart the loop so player can pick a different card
    }

    if (card.type === "CRITICAL" && isCriticalCardPlayed) {
      // updateDialogue("Limit reached: Only 1 CRITICAL per turn!");
      // await delay(1200);
      continue; // Restart the loop so player can pick a different card
    }

    if (card.type !== "DODGED") {
      updateDialogue(`Enemy is about to play ${card.type}...`);
      // this is necessary to select the html card div
      const cardElement = document.querySelector(`[data-id="${card.id}"]`);

      if (cardElement) {
        cardOntoActiveZone(cardElement, turn);
        console.log(
          `Card: ${card.name} , ID: ${card.id} placed on active zone`,
        ); // for test, TBD
      } else {
        console.warn("Card element not found for active zone placement!"); // for test, TBD
      }

      enemyHand.splice(
        enemyHand.findIndex((c) => c.id === card.id),
        1,
      );
      console.log(`Enemy hand after playing card: ${enemyHand}`); // for test, TBD
      await delay(2000);
      await resolveCardEffect(card);
    }

    // flip boolean switch after playing attack or critical card
    // to enforce 1 card limitation for each type
    if (card.type === "ATTACK") {
      isAttackCardPlayed = true;
    }
    if (card.type === "CRITICAL") {
      isCriticalCardPlayed = true;
    }
    if (card.type === "HEAL" && enemy.HP >= enemy.maxHP) {
      wantToStopHeal = true;
    }
  }

  await delay(1000);
  console.log("Enemy turn ended, moving to Player...");
  updateDialogue("Enemy turn ended, moving to Player...");
  await delay(2000);
  turn = "Player";
  updateDialogue(`It is ${turn}'s turn.`);
  console.log(`It is ${turn}'s turn.`); // for test, TBD
  playerTurn(); // Switch back
};

const enemyTurnCopy = async function () {
  console.log(`Turn Start: ${turn}`);

  // Visually indicate turn change by borders
  turnIndicator();
  // Draw 1 card at start of turn
  if (deck.length !== 0) {
    enemyDraw();
  } else {
    console.log("Deck is empty, cannot draw more cards. Game Ended");
    updateDialogue("Deck is empty, cannot draw more cards. Game Ended");
    renderResetButton();
    return; // Exit the function if the deck is empty
  }
  //   await delay(1000);
  console.log("Draw 1 card for enemy");
  await delay(1000);
  updateDialogue("Your Enemy is thinking...");
  console.log("Your Enemy is thinking...");
  await delay(2000);

  // 3. Action Phase - Enemy AI Logic
  // First to look for index of various cards if available in hand
  // Enemy Attack logic
  const attackIndex = enemyHand.findIndex((c) => c.type === "ATTACK");
  if (attackIndex > -1) {
    const enemyCardPlayed = enemyHand[attackIndex];

    console.log(
      `Enemy playing: ${enemyCardPlayed.type} (ID: ${enemyCardPlayed.id})`,
    ); // for test, TBD
    updateDialogue(`Enemy plays ${enemyCardPlayed.type}!`);
    // Trigger the attack logic
    await resolveCardEffect(enemyCardPlayed);

    // IMPORTANT: Remove card from enemyHand so they don't have infinite attacks
    enemyHand.splice(attackIndex, 1);

    // Remove card from enemy hand
    const cardElement = document.querySelector(
      `[data-id="${enemyCardPlayed.id}"]`,
    );
    if (cardElement) {
      cardElement.remove();
      console.log(`Card ${enemyCardPlayed.id} removed from Enemy hand`);
    } else {
      console.warn("Card not found! Check your ID or other possibilities.");
    }

    // Place card onto active zone from enemy hand
    const activeEnemyZone = document.querySelector(".active-enemy");

    if (activeEnemyZone) {
      // B. card renderng at active enemy zone after card played
      const activeCardVisual = document.createElement("div");
      activeCardVisual.className = "card active-enemy"; // Style this in CSS!
      activeCardVisual.innerText = enemyCardPlayed.type;

      // C. Append it to the play area
      activeEnemyZone.appendChild(activeCardVisual);

      // D. (To be added) Remove cards from active zone
      // setTimeout(() => {
      //   activeCardVisual.remove();
      // }, 2000);
    }

    await delay(3000); // Give the player time to see what happened
  } else {
    updateDialogue("Enemy has no attackcards to play.");
    console.log("Enemy has no attack cards to play.");
    await delay(2000);
  }

  // Enemy Heal logic
  const healIndex = enemyHand.findIndex((c) => c.type === "HEAL");
  if (healIndex > -1 && enemy.HP < enemy.maxHP) {
    const enemyCardPlayed = enemyHand[healIndex];

    console.log(
      `Enemy playing: ${enemyCardPlayed.type} (ID: ${enemyCardPlayed.id})`,
    ); // for test, TBD
    updateDialogue(`Enemy plays ${enemyCardPlayed.type}!`);
    // Trigger the heal logic
    await resolveCardEffect(enemyCardPlayed);

    // IMPORTANT: Remove card from enemyHand so they don't have infinite attacks
    enemyHand.splice(healIndex, 1);

    // Remove card from enemy hand
    const cardElement = document.querySelector(
      `[data-id="${enemyCardPlayed.id}"]`,
    );
    if (cardElement) {
      cardElement.remove();
      console.log(`Visual card ${enemyCardPlayed.id} removed from Enemy hand`);
    } else {
      console.warn("Visual card not found! Check your ID naming convention.");
    }

    // Place card onto active zone from enemy hand
    const activeEnemyZone = document.querySelector(".active-enemy");

    if (activeEnemyZone) {
      // B. card renderng at active enemy zone after card played
      const activeCardVisual = document.createElement("div");
      activeCardVisual.className = "card active-enemy"; // Style this in CSS!
      activeCardVisual.innerText = enemyCardPlayed.type;

      // C. Append it to the play area
      activeEnemyZone.appendChild(activeCardVisual);

      // D. (To be added) Remove cards from active zone
      // setTimeout(() => {
      //   activeCardVisual.remove();
      // }, 2000);
    }

    await delay(3000); // Give the player time to see what happened
  } else {
    updateDialogue("Enemy has no heal cards to play.");
    console.log("Enemy has no heal cards to play.");
    await delay(2000);
  }

  // Enemy Critical logic
  const criticalIndex = enemyHand.findIndex((c) => c.type === "CRITICAL");
  if (criticalIndex > -1) {
    const enemyCardPlayed = enemyHand[criticalIndex];

    console.log(
      `Enemy playing: ${enemyCardPlayed.type} (ID: ${enemyCardPlayed.id})`,
    ); // for test, TBD
    updateDialogue(`Enemy plays ${enemyCardPlayed.type}!`);
    // Trigger the critical logic
    await resolveCardEffect(enemyCardPlayed);

    // IMPORTANT: Remove card from enemyHand so they don't have infinite attacks
    enemyHand.splice(criticalIndex, 1);

    // Remove card from enemy hand
    const cardElement = document.querySelector(
      `[data-id="${enemyCardPlayed.id}"]`,
    );
    if (cardElement) {
      cardElement.remove();
      console.log(`Visual card ${enemyCardPlayed.id} removed from Enemy hand`);
    } else {
      console.warn("Visual card not found! Check your ID naming convention.");
    }

    // Place card onto active zone from enemy hand
    const activeEnemyZone = document.querySelector(".active-enemy");

    if (activeEnemyZone) {
      // B. card renderng at active enemy zone after card played
      const activeCardVisual = document.createElement("div");
      activeCardVisual.className = "card active-enemy"; // Style this in CSS!
      activeCardVisual.innerText = enemyCardPlayed.type;

      // C. Append it to the play area
      activeEnemyZone.appendChild(activeCardVisual);

      // D. (To be added) Remove cards from active zone
      // setTimeout(() => {
      //   activeCardVisual.remove();
      // }, 2000);
    }

    await delay(3000); // Give the player time to see what happened
  } else {
    updateDialogue("Enemy has no critical cards to play.");
    console.log("Enemy has no critical cards to play.");
    await delay(2000);
  }

  await delay(1000);
  console.log("Enemy turn ended, moving to Player...");
  updateDialogue("Enemy turn ended, moving to Player...");
  await delay(2000);
  turn = "Player";
  updateDialogue(`It is ${turn}'s turn.`);
  console.log(`It is ${turn}'s turn.`); // for test, TBD
  playerTurn(); // Switch back
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
