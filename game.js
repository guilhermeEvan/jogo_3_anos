(() => {
  const canvas = document.querySelector("#game-canvas");
  const ctx = canvas.getContext("2d");
  const selectScreen = document.querySelector("#select-screen");
  const resultScreen = document.querySelector("#result-screen");
  const startButton = document.querySelector("#start-button");
  const playAgainButton = document.querySelector("#play-again-button");
  const switchCharacterButton = document.querySelector("#switch-character-button");
  const catCount = document.querySelector("#cat-count");
  const discCount = document.querySelector("#disc-count");
  const lifeCount = document.querySelector("#life-count");
  const collectibleCounters = document.querySelector("#collectible-counters");
  const phaseCounter = document.querySelector("#phase-counter");
  const phaseItemIcon = document.querySelector("#phase-item-icon");
  const phaseItemCount = document.querySelector("#phase-item-count");
  const phaseItemTotal = document.querySelector("#phase-item-total");
  const levelName = document.querySelector("#level-name");
  const gameTitle = document.querySelector("#game-title");
  const phaseLabel = document.querySelector("#phase-label");
  const npcDialogueScreen = document.querySelector("#npc-dialogue-screen");
  const npcDialogueKicker = document.querySelector("#npc-dialogue-kicker");
  const npcDialogueTitle = document.querySelector("#npc-dialogue-title");
  const npcDialogueCopy = document.querySelector("#npc-dialogue-copy");
  const acceptQuestButton = document.querySelector("#accept-quest");
  const declineQuestButton = document.querySelector("#decline-quest");
  const toast = document.querySelector("#game-toast");
  const W = 960;
  const H = 540;
  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * ratio);
    canvas.height = Math.round(H * ratio);
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  const WORLD_WIDTH = 3900;
  const FLOOR = 468;
  const keys = new Set();
  const collected = new Set();
  let selectedCharacter = null;
  let active = false;
  let cameraX = 0;
  let lastTime = 0;
  let toastTimer;
  let catsFound = 0;
  let discsFound = 0;
  let rosesFound = 0;
  let hooksFound = 0;
  let couscousFound = 0;
  let bottlesFound = 0;
  let lives = 3;
  let enemies = [];
  let currentLevel = 1;
  let questAccepted = false;
  let dialogueOpen = false;
  let npcPromptBlocked = false;
  let player = { x: 70, y: FLOOR - 56, vx: 0, vy: 0, width: 42, height: 56, grounded: true, facing: 1 };

  const platforms = [
    { x: 260, y: 390, w: 150 }, { x: 535, y: 330, w: 140 },
    { x: 810, y: 390, w: 160 }, { x: 1110, y: 340, w: 150 },
    { x: 1400, y: 385, w: 170 }, { x: 1710, y: 325, w: 155 },
    { x: 2010, y: 385, w: 165 }, { x: 2320, y: 335, w: 155 },
    { x: 2620, y: 390, w: 170 }, { x: 2930, y: 330, w: 150 },
    { x: 3220, y: 382, w: 170 }, { x: 3530, y: 330, w: 170 }
  ];

  const collectibles = [
    { id: "c1", type: "cat", x: 345, y: 355 }, { id: "d1", type: "disc", x: 445, y: 414 },
    { id: "d2", type: "disc", x: 590, y: 291 }, { id: "c2", type: "cat", x: 625, y: 293 },
    { id: "d3", type: "disc", x: 875, y: 350 }, { id: "d4", type: "disc", x: 1035, y: 412 },
    { id: "c3", type: "cat", x: 1170, y: 300 }, { id: "d5", type: "disc", x: 1480, y: 343 },
    { id: "d6", type: "disc", x: 1605, y: 412 }, { id: "c4", type: "cat", x: 1785, y: 285 },
    { id: "d7", type: "disc", x: 2085, y: 343 }, { id: "d8", type: "disc", x: 2420, y: 292 },
    { id: "c5", type: "cat", x: 2705, y: 350 }
  ];

  const roses = [
    { id: "r1", type: "rose", x: 345, y: 358 },
    { id: "r2", type: "rose", x: 875, y: 358 },
    { id: "r3", type: "rose", x: 1480, y: 351 },
    { id: "r4", type: "rose", x: 2400, y: 301 },
    { id: "r5", type: "rose", x: 3300, y: 348 }
  ];

  const hooks = [
    { id: "h1", type: "hook", x: 345, y: 358 },
    { id: "h2", type: "hook", x: 875, y: 358 },
    { id: "h3", type: "hook", x: 1480, y: 351 },
    { id: "h4", type: "hook", x: 2400, y: 301 },
    { id: "h5", type: "hook", x: 3300, y: 348 },
    { id: "h6", type: "hook", x: 3600, y: 301 }
  ];

  const couscous = [
    { id: "q1", type: "couscous", x: 345, y: 358 },
    { id: "q2", type: "couscous", x: 875, y: 358 },
    { id: "q3", type: "couscous", x: 1480, y: 351 },
    { id: "q4", type: "couscous", x: 2400, y: 301 },
    { id: "q5", type: "couscous", x: 3300, y: 348 },
    { id: "q6", type: "couscous", x: 3600, y: 301 }
  ];

  const bottles = [
    { id: "b1", type: "bottle", x: 345, y: 358 },
    { id: "b2", type: "bottle", x: 875, y: 358 },
    { id: "b3", type: "bottle", x: 1480, y: 351 },
    { id: "b4", type: "bottle", x: 2400, y: 301 },
    { id: "b5", type: "bottle", x: 3300, y: 348 },
    { id: "b6", type: "bottle", x: 3600, y: 301 }
  ];

  const healthHearts = {
    1: { id: "heart-1", type: "heart", x: 700, y: 412 },
    2: { id: "heart-2", type: "heart", x: 1000, y: 412 },
    3: { id: "heart-3", type: "heart", x: 1250, y: 412 },
    4: { id: "heart-4", type: "heart", x: 1340, y: 412 },
    5: { id: "heart-5", type: "heart", x: 1600, y: 412 }
  };

  const enemySpawnsByLevel = {
    1: [620, 1080, 1640, 2240, 2860, 3420],
    2: [520, 970, 1420, 1870, 2320, 2770, 3220, 3670],
    3: [430, 790, 1150, 1510, 1870, 2230, 2590, 2950, 3310, 3670],
    4: [380, 680, 980, 1280, 1580, 1880, 2180, 2480, 2780, 3080, 3380, 3680],
    5: [320, 590, 860, 1130, 1400, 1670, 1940, 2210, 2480, 2750, 3020, 3290, 3560, 3790]
  };
  const enemySpeedByLevel = { 1: 1, 2: 1.22, 3: 1.45, 4: 1.65, 5: 1.8 };
  const obstaclesByLevel = {
    2: [
      { type: "thorns", x: 720, width: 42, height: 22 },
      { type: "thorns", x: 1290, width: 42, height: 22 },
      { type: "thorns", x: 1860, width: 42, height: 22 },
      { type: "thorns", x: 2430, width: 42, height: 22 },
      { type: "thorns", x: 3000, width: 42, height: 22 },
      { type: "thorns", x: 3500, width: 42, height: 22 }
    ],
    3: [
      { type: "water", x: 620, width: 68, height: 18 },
      { type: "water", x: 1030, width: 68, height: 18 },
      { type: "water", x: 1440, width: 68, height: 18 },
      { type: "water", x: 1850, width: 68, height: 18 },
      { type: "water", x: 2260, width: 68, height: 18 },
      { type: "water", x: 2670, width: 68, height: 18 },
      { type: "water", x: 3080, width: 68, height: 18 },
      { type: "water", x: 3490, width: 68, height: 18 }
    ],
    4: [
      { type: "basket", x: 520, width: 48, height: 36 },
      { type: "basket", x: 850, width: 48, height: 36 },
      { type: "basket", x: 1180, width: 48, height: 36 },
      { type: "basket", x: 1510, width: 48, height: 36 },
      { type: "basket", x: 1840, width: 48, height: 36 },
      { type: "basket", x: 2170, width: 48, height: 36 },
      { type: "basket", x: 2500, width: 48, height: 36 },
      { type: "basket", x: 2830, width: 48, height: 36 },
      { type: "basket", x: 3160, width: 48, height: 36 },
      { type: "basket", x: 3490, width: 48, height: 36 }
    ]
  };
  const npc = { x: 150, width: 40, height: 60 };

  const clouds = [
    { x: 120, y: 84, s: 1 }, { x: 465, y: 130, s: .72 }, { x: 770, y: 72, s: .85 },
    { x: 1120, y: 112, s: 1 }, { x: 1510, y: 68, s: .8 }, { x: 1870, y: 126, s: .9 },
    { x: 2240, y: 76, s: 1 }, { x: 2630, y: 116, s: .75 }, { x: 3020, y: 65, s: .95 },
    { x: 3450, y: 117, s: .8 }, { x: 3790, y: 70, s: .9 }
  ];

  document.querySelectorAll(".character-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedCharacter = card.dataset.character;
      document.querySelectorAll(".character-card").forEach((other) => {
        other.setAttribute("aria-pressed", String(other === card));
      });
      startButton.disabled = false;
      startButton.innerHTML = `Jogar com ${selectedCharacter === "ellen" ? "Ellen" : "Guilherme"} <span aria-hidden="true">→</span>`;
    });
  });

  startButton.addEventListener("click", () => {
    if (!selectedCharacter) return;
    startGame();
  });
  playAgainButton.addEventListener("click", startGame);
  switchCharacterButton.addEventListener("click", switchCharacter);
  acceptQuestButton.addEventListener("click", () => closeNpcDialogue(true));
  declineQuestButton.addEventListener("click", () => closeNpcDialogue(false));

  function startGame() {
    collected.clear();
    currentLevel = 1;
    catsFound = 0;
    discsFound = 0;
    rosesFound = 0;
    hooksFound = 0;
    couscousFound = 0;
    bottlesFound = 0;
    lives = 3;
    questAccepted = false;
    dialogueOpen = false;
    npcPromptBlocked = false;
    npcDialogueScreen.classList.add("is-hidden");
    npcDialogueScreen.setAttribute("aria-hidden", "true");
    npcDialogueScreen.inert = true;
    resetEnemies();
    cameraX = 0;
    player = { x: 70, y: FLOOR - 56, vx: 0, vy: 0, width: 42, height: 56, grounded: true, facing: 1, hurtTimer: 0 };
    updateHud();
    updateSwitchCharacterButton();
    selectScreen.classList.add("is-hidden");
    resultScreen.classList.add("is-hidden");
    switchCharacterButton.hidden = false;
    active = true;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }

  function updateHud() {
    catCount.textContent = String(catsFound);
    discCount.textContent = String(discsFound);
    lifeCount.textContent = String(lives);
    collectibleCounters.hidden = currentLevel !== 1;
    phaseCounter.hidden = currentLevel === 1;
    if (currentLevel === 1) {
      levelName.textContent = "JARDIM ENCANTADO";
      gameTitle.textContent = "A missão dos gatinhos";
      phaseLabel.textContent = "fase 01 · o jardim encantado";
      canvas.setAttribute("aria-label", "Jogo de plataforma no Jardim Encantado");
    } else if (currentLevel === 2) {
      phaseItemIcon.className = "rose-hud-icon";
      phaseItemCount.textContent = String(rosesFound);
      phaseItemTotal.textContent = `/ ${roses.length}`;
      levelName.textContent = "CAMINHO DAS ROSAS";
      gameTitle.textContent = "A busca pelas rosas";
      phaseLabel.textContent = "fase 02 · o caminho das rosas";
      canvas.setAttribute("aria-label", "Jogo de plataforma no Caminho das Rosas");
    } else if (currentLevel === 3) {
      phaseItemIcon.className = "hook-hud-icon";
      phaseItemCount.textContent = String(hooksFound);
      phaseItemTotal.textContent = `/ ${hooks.length}`;
      levelName.textContent = "LAGOA DO ANDRÉ";
      gameTitle.textContent = "Os anzóis perdidos";
      phaseLabel.textContent = "fase 03 · a busca pelos anzóis";
      canvas.setAttribute("aria-label", "Jogo de plataforma na Lagoa do André");
    } else if (currentLevel === 4) {
      phaseItemIcon.className = "food-hud-icon";
      phaseItemCount.textContent = String(couscousFound);
      phaseItemTotal.textContent = `/ ${couscous.length}`;
      levelName.textContent = "PIQUENIQUE DA EMILY";
      gameTitle.textContent = "Um cuscuz para Emily";
      phaseLabel.textContent = "fase 04 · o cuscuz amarelinho";
      canvas.setAttribute("aria-label", "Jogo de plataforma na fase do cuscuz");
    } else {
      phaseItemIcon.className = "bottle-hud-icon";
      phaseItemCount.textContent = String(bottlesFound);
      phaseItemTotal.textContent = `/ ${bottles.length}`;
      levelName.textContent = "CAMINHO DAS GARRAFAS";
      gameTitle.textContent = "As Coca-Colas perdidas";
      phaseLabel.textContent = "fase 05 · a busca pelas garrafas";
      canvas.setAttribute("aria-label", "Jogo de plataforma na fase das garrafas");
    }
  }

  function resetEnemies() {
    const speedMultiplier = enemySpeedByLevel[currentLevel];
    enemies = enemySpawnsByLevel[currentLevel].map((x, index) => ({
      x,
      minX: x - 65,
      maxX: x + 65,
      direction: index % 2 === 0 ? 1 : -1,
      speed: (48 + index % 3 * 8) * speedMultiplier,
      width: 32,
      height: 32,
      alive: true
    }));
  }

  function startRoseLevel() {
    rosesFound = 0;
    startLevel(2, "Fase 2! Encontre a Elisangela.");
  }

  function startFishingLevel() {
    hooksFound = 0;
    startLevel(3, "Fase 3! Ajude o André a recuperar os anzóis.");
  }

  function startCouscousLevel() {
    couscousFound = 0;
    startLevel(4, "Fase 4! Ajude a Emily a encontrar cuscuz amarelinho.");
  }

  function startBottleLevel() {
    bottlesFound = 0;
    startLevel(5, "Fase 5! Ajude o Eduardo a recuperar as garrafas perdidas.");
  }

  function startLevel(level, message) {
    currentLevel = level;
    questAccepted = false;
    dialogueOpen = false;
    npcPromptBlocked = false;
    collected.clear();
    resetEnemies();
    cameraX = 0;
    player = { x: 70, y: FLOOR - 56, vx: 0, vy: 0, width: 42, height: 56, grounded: true, facing: 1, hurtTimer: 0 };
    updateHud();
    showToast(message);
  }

  function openNpcDialogue() {
    const dialogueByLevel = {
      2: {
        kicker: "UMA NOVA AMIGA",
        title: "Elisangela",
        copy: "Oi! Estou procurando algumas rosas para fazer um buquê. Você pode me ajudar a encontrá-las?"
      },
      3: {
        kicker: "UM PESCADOR PRECISA DE AJUDA",
        title: "André",
        copy: "Oi! Sou pescador e perdi meus anzóis pelo caminho. Você pode me ajudar a encontrar todos? AGORAEUPEGO"
      },
      4: {
        kicker: "UMA AMIGA ESTÁ COM FOME",
        title: "Emily",
        copy: "Oi! Estou com vontade de comer cuscuz bem amarelinho. Você pode me ajudar a encontrar algumas porções?"
      },
      5: {
        kicker: "UM AMIGO PRECISA DE AJUDA",
        title: "Eduardo",
        copy: "Oi! Perdi algumas garrafas de Coca-Cola pelo caminho. Lesionei o LCA do joelho e não posso ir atrás delas. Você pode me ajudar a recuperar todas?"
      }
    };
    const dialogue = dialogueByLevel[currentLevel];
    npcDialogueKicker.textContent = dialogue.kicker;
    npcDialogueTitle.textContent = dialogue.title;
    npcDialogueCopy.textContent = dialogue.copy;
    dialogueOpen = true;
    player.vx = 0;
    keys.clear();
    npcDialogueScreen.classList.remove("is-hidden");
    npcDialogueScreen.setAttribute("aria-hidden", "false");
    npcDialogueScreen.inert = false;
    acceptQuestButton.focus();
  }

  function closeNpcDialogue(willHelp) {
    dialogueOpen = false;
    npcPromptBlocked = true;
    npcDialogueScreen.classList.add("is-hidden");
    npcDialogueScreen.setAttribute("aria-hidden", "true");
    npcDialogueScreen.inert = true;
    canvas.focus();
    if (willHelp) {
      questAccepted = true;
      updateHud();
      const questMessage = {
        2: `Ajude a Elisangela: encontre ${roses.length} rosas!`,
        3: `Ajude o André: encontre ${hooks.length} anzóis!`,
        4: `Ajude a Emily: encontre ${couscous.length} porções de cuscuz!`,
        5: `Ajude o Eduardo: encontre ${bottles.length} garrafas de Coca-Cola!`
      };
      showToast(questMessage[currentLevel]);
    } else {
      showToast("Tudo bem! Você pode falar comigo depois.");
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 1250);
  }

  function gameLoop(now) {
    if (!active) return;
    const dt = Math.min((now - lastTime) / 1000, 0.032);
    lastTime = now;
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
  }

  function takeDamage(message, knockback = 180) {
    if (player.hurtTimer > 0) return false;
    lives--;
    updateHud();
    if (lives === 0) {
      finishGame(false, true);
      return true;
    }
    player.x = Math.max(70, player.x - knockback);
    player.y = FLOOR - player.height;
    player.vx = 0;
    player.vy = 0;
    player.grounded = true;
    player.hurtTimer = 1.5;
    showToast(message);
    return false;
  }

  function update(dt) {
    if (dialogueOpen) {
      player.vx = 0;
      return;
    }

    const left = keys.has("ArrowLeft") || keys.has("a") || keys.has("A");
    const right = keys.has("ArrowRight") || keys.has("d") || keys.has("D");
    const jump = keys.has(" ") || keys.has("ArrowUp") || keys.has("w") || keys.has("W");
    const speed = 235;
    player.vx = (right ? speed : 0) - (left ? speed : 0);
    if (player.vx !== 0) player.facing = Math.sign(player.vx);
    player.hurtTimer = Math.max(0, player.hurtTimer - dt);
    if (jump && player.grounded) {
      player.vy = -480;
      player.grounded = false;
    }

    const previousX = player.x;
    const previousBottom = player.y + player.height;
    player.vy += 1200 * dt;
    player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x + player.vx * dt));
    player.y += player.vy * dt;
    player.grounded = false;

    if (player.y + player.height >= FLOOR) {
      player.y = FLOOR - player.height;
      player.vy = 0;
      player.grounded = true;
    }
    for (const platform of platforms) {
      const overlapsX = player.x + player.width > platform.x && player.x < platform.x + platform.w;
      if (overlapsX && previousBottom <= platform.y && player.y + player.height >= platform.y && player.vy >= 0) {
        player.y = platform.y - player.height;
        player.vy = 0;
        player.grounded = true;
      }
    }

    for (const obstacle of obstaclesByLevel[currentLevel] || []) {
      const top = FLOOR - obstacle.height;
      const overlapsX = player.x + player.width > obstacle.x && player.x < obstacle.x + obstacle.width;
      const overlapsY = player.y + player.height > top && player.y < FLOOR;
      if (!overlapsX || !overlapsY) continue;

      if (obstacle.type === "basket") {
        if (previousBottom <= top && player.vy >= 0) {
          player.y = top - player.height;
          player.vy = 0;
          player.grounded = true;
        } else if (player.y + player.height > top) {
          player.x = player.vx > 0
            ? obstacle.x - player.width
            : player.vx < 0 ? obstacle.x + obstacle.width : previousX;
          player.vx = 0;
        }
      } else if (takeDamage(
        obstacle.type === "thorns" ? "Cuidado com os espinhos!" : "Cuidado com a água funda!",
        110
      )) {
        return;
      }
    }

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      enemy.x += enemy.direction * enemy.speed * dt;
      if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
        enemy.direction *= -1;
        enemy.x = Math.max(enemy.minX, Math.min(enemy.maxX - enemy.width, enemy.x));
      }

      const enemyY = FLOOR - enemy.height;
      const overlapsX = player.x + player.width > enemy.x && player.x < enemy.x + enemy.width;
      const overlapsY = player.y + player.height > enemyY && player.y < FLOOR;
      if (!overlapsX || !overlapsY) continue;

      if (player.vy > 0 && previousBottom <= enemyY + 18) {
        enemy.alive = false;
        player.y = enemyY - player.height;
        player.vy = -330;
        player.grounded = false;
        showToast("Monstrinho de musgo derrotado!");
      } else if (takeDamage(`O monstrinho te pegou! Restam ${lives - 1} vidas.`)) {
        return;
      }
    }

    if (currentLevel > 1) {
      const npcY = FLOOR - npc.height;
      const touchingNpc = player.x + player.width > npc.x
        && player.x < npc.x + npc.width
        && player.y + player.height > npcY
        && player.y < FLOOR;
      if (!touchingNpc) npcPromptBlocked = false;
      if (touchingNpc && !questAccepted && !npcPromptBlocked) {
        openNpcDialogue();
        return;
      }
    }

    const levelCollectibles = currentLevel === 1
      ? collectibles
      : currentLevel === 2
        ? questAccepted ? roses : []
        : currentLevel === 3
          ? questAccepted ? hooks : []
          : currentLevel === 4
            ? questAccepted ? couscous : []
            : questAccepted ? bottles : [];
    for (const item of levelCollectibles) {
      if (collected.has(item.id)) continue;
      const dx = player.x + player.width / 2 - item.x;
      const dy = player.y + player.height / 2 - item.y;
      if (Math.hypot(dx, dy) < 34) {
        collected.add(item.id);
        if (item.type === "cat") {
          catsFound++;
          showToast("Miau! Um gatinho resgatado!");
        } else if (item.type === "disc") {
          discsFound++;
          showToast("Disco brilhante encontrado!");
        } else if (item.type === "rose") {
          rosesFound++;
          showToast("Rosa encontrada!");
        } else if (item.type === "hook") {
          hooksFound++;
          showToast("Anzol encontrado!");
        } else if (item.type === "couscous") {
          couscousFound++;
          showToast("Cuscuz amarelinho encontrado!");
        } else {
          bottlesFound++;
          showToast("Garrafa de Coca-Cola recuperada!");
        }
        updateHud();
      }
    }

    const heart = healthHearts[currentLevel];
    if (heart && !collected.has(heart.id)) {
      const dx = player.x + player.width / 2 - heart.x;
      const dy = player.y + player.height / 2 - heart.y;
      if (Math.hypot(dx, dy) < 34) {
        collected.add(heart.id);
        lives++;
        updateHud();
        showToast("Coração coletado! +1 ponto de vida.");
      }
    }

    cameraX = Math.max(0, Math.min(WORLD_WIDTH - W, player.x - W * .35));
    if (player.x > WORLD_WIDTH - 145) {
      if (currentLevel === 1) {
        startRoseLevel();
      } else if (!questAccepted) {
        player.x = WORLD_WIDTH - 200;
        const npcLabel = { 2: "a Elisangela", 3: "o André", 4: "a Emily", 5: "o Eduardo" };
        showToast(`Fale com ${npcLabel[currentLevel]} antes de seguir.`);
      } else if (currentLevel === 2 && rosesFound < roses.length) {
        player.x = WORLD_WIDTH - 200;
        showToast(`Ainda faltam ${roses.length - rosesFound} rosas!`);
      } else if (currentLevel === 2) {
        startFishingLevel();
      } else if (currentLevel === 3 && hooksFound === hooks.length) {
        startCouscousLevel();
      } else if (currentLevel === 3 && hooksFound < hooks.length) {
        player.x = WORLD_WIDTH - 200;
        showToast(`Ainda faltam ${hooks.length - hooksFound} anzóis!`);
      } else if (currentLevel === 4 && couscousFound === couscous.length) {
        startBottleLevel();
      } else if (currentLevel === 4 && couscousFound < couscous.length) {
        player.x = WORLD_WIDTH - 200;
        showToast(`Ainda faltam ${couscous.length - couscousFound} porções de cuscuz!`);
      } else if (bottlesFound < bottles.length) {
        player.x = WORLD_WIDTH - 200;
        showToast(`Ainda faltam ${bottles.length - bottlesFound} garrafas de Coca-Cola!`);
      } else {
        finishGame(true);
      }
    }
  }

  function finishGame(wasCompleted, wasDefeated = false) {
    active = false;
    switchCharacterButton.hidden = true;
    resultScreen.classList.remove("is-hidden");
    const formatCount = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;
    const allFound = currentLevel === 1
      ? catsFound === 5 && discsFound === 8
      : currentLevel === 2
        ? rosesFound === roses.length
        : currentLevel === 3
          ? hooksFound === hooks.length
          : currentLevel === 4
            ? couscousFound === couscous.length
            : bottlesFound === bottles.length;
    const missionCopy = currentLevel === 1
      ? allFound
        ? "Você encontrou todos os gatinhos e discos. Que dupla incrível!"
        : `Você encontrou ${catsFound} de 5 gatinhos e ${discsFound} de 8 discos. Quer tentar de novo?`
      : currentLevel === 2
        ? allFound
          ? "Você encontrou todas as rosas e ajudou a Elisangela. Que gesto lindo!"
          : `Você encontrou ${rosesFound} de ${roses.length} rosas para a Elisangela.`
        : currentLevel === 3
          ? allFound
            ? "Você recuperou todos os anzóis e ajudou o André. Boa pescaria!"
            : `Você encontrou ${hooksFound} de ${hooks.length} anzóis para o André.`
          : currentLevel === 4
            ? allFound
              ? "Você encontrou todas as porções de cuscuz e ajudou a Emily. Bom apetite!"
              : `Você encontrou ${couscousFound} de ${couscous.length} porções de cuscuz para a Emily.`
            : allFound
              ? "Você recuperou todas as garrafas de Coca-Cola e ajudou o Eduardo!"
              : `Você encontrou ${bottlesFound} de ${bottles.length} garrafas de Coca-Cola para o Eduardo.`;
    document.querySelector("#result-copy").textContent = wasDefeated
      ? `Você ficou sem vidas. Encontrou ${formatCount(catsFound, "gatinho", "gatinhos")}, ${formatCount(discsFound, "disco", "discos")}, ${formatCount(rosesFound, "rosa", "rosas")}, ${formatCount(hooksFound, "anzol", "anzóis")}, ${formatCount(couscousFound, "porção de cuscuz", "porções de cuscuz")} e ${formatCount(bottlesFound, "garrafa de Coca-Cola", "garrafas de Coca-Cola")}.`
      : missionCopy;
    resultScreen.querySelector(".panel-kicker").textContent = wasDefeated
      ? "FIM DE JOGO"
      : wasCompleted && allFound ? "MISSÃO COMPLETA" : "AVENTURA CONCLUÍDA";
    resultScreen.querySelector("h3").textContent = wasDefeated
      ? "Mais sorte na próxima!"
      : wasCompleted && allFound && currentLevel === 2 ? "Elisangela vai amar!"
        : wasCompleted && allFound && currentLevel === 3 ? "Boa pescaria, André!"
          : wasCompleted && allFound && currentLevel === 4 ? "Bom apetite, Emily!"
            : wasCompleted && allFound && currentLevel === 5 ? "Eduardo agradece a ajuda!"
              : wasCompleted && allFound ? "Que aventura linda!" : "Até a próxima, aventureiro!";
  }

  function updateSwitchCharacterButton() {
    const currentCharacter = selectedCharacter === "ellen" ? "ELLEN" : "GUILHERME";
    switchCharacterButton.innerHTML = `<span aria-hidden="true">↔</span> TROCAR: ${currentCharacter}`;
    switchCharacterButton.setAttribute("aria-label", `Trocar personagem; atual: ${currentCharacter}`);
  }

  function switchCharacter() {
    if (!active) return;
    selectedCharacter = selectedCharacter === "ellen" ? "guilherme" : "ellen";
    updateSwitchCharacterButton();
    showToast(`Agora jogando com ${selectedCharacter === "ellen" ? "Ellen" : "Guilherme"}!`);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    ctx.save();
    ctx.translate(-Math.round(cameraX), 0);
    drawWorld();
    const levelCollectibles = currentLevel === 1
      ? collectibles
      : currentLevel === 2
        ? questAccepted ? roses : []
        : currentLevel === 3
          ? questAccepted ? hooks : []
          : currentLevel === 4
            ? questAccepted ? couscous : []
            : questAccepted ? bottles : [];
    for (const item of levelCollectibles) {
      if (!collected.has(item.id)) drawCollectible(item, performance.now() / 400);
    }
    const heart = healthHearts[currentLevel];
    if (heart && !collected.has(heart.id)) drawCollectible(heart, performance.now() / 400);
    for (const enemy of enemies) {
      if (enemy.alive) drawEnemy(enemy);
    }
    drawExit();
    if (currentLevel > 1) drawNpc();
    drawPlayer();
    ctx.restore();
  }

  function drawBackground() {
    const roseLevel = currentLevel === 2;
    const fishingLevel = currentLevel === 3;
    const picnicLevel = currentLevel === 4;
    const bottleLevel = currentLevel === 5;
    ctx.fillStyle = bottleLevel ? "#d9a58b" : picnicLevel ? "#f0d48b" : fishingLevel ? "#b9dbe1" : roseLevel ? "#d9c9dc" : "#b8dcd7";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = bottleLevel ? "#e9c3a0" : picnicLevel ? "#f5e3a9" : fishingLevel ? "#cce8df" : roseLevel ? "#e6d3dc" : "#c8e3d3";
    ctx.fillRect(0, 152, W, 80);
    ctx.fillStyle = bottleLevel ? "#f0d6b3" : picnicLevel ? "#f7edc4" : fishingLevel ? "#d8ebd3" : roseLevel ? "#eeddd2" : "#d8e9cf";
    ctx.fillRect(0, 232, W, 104);
    ctx.fillStyle = bottleLevel ? "#f5e3c4" : picnicLevel ? "#fbf1d0" : fishingLevel ? "#e3edcc" : roseLevel ? "#f2e4ce" : "#e3edcc";
    ctx.fillRect(0, 336, W, 100);
    drawPixelSprite(
      ["...YY...", "..YYYY..", ".YYYYYY.", "YYYYYYYY", "YYYYYYYY", ".YYYYYY.", "..YYYY..", "...YY..."],
      790, 66, 8, { Y: "#f4d28c" }
    );
    for (const cloud of clouds) {
      const x = ((cloud.x - cameraX * .2) % (WORLD_WIDTH + 260) + WORLD_WIDTH + 260) % (WORLD_WIDTH + 260) - 100;
      const pixel = cloud.s < .8 ? 6 : 8;
      drawCloud(Math.round(x / pixel) * pixel, Math.round(cloud.y / pixel) * pixel, pixel);
    }
    drawBlockHill(356, 34, .16, bottleLevel ? "#ba846c" : picnicLevel ? "#d9bd79" : fishingLevel ? "#9dc7bc" : roseLevel ? "#c4b8cb" : "#b5d0ae");
    drawBlockHill(422, 20, .32, bottleLevel ? "#9e6d5e" : picnicLevel ? "#b69b5c" : fishingLevel ? "#75a8a0" : roseLevel ? "#a99bad" : "#91b996");
  }

  function drawBlockHill(base, amplitude, parallax, color) {
    ctx.fillStyle = color;
    for (let x = -32; x < W + 32; x += 32) {
      const worldX = x + cameraX * parallax;
      const wave = Math.sin(worldX * .007) * .7 + Math.sin(worldX * .013) * .3;
      const y = Math.floor((base + wave * amplitude) / 16) * 16;
      ctx.fillRect(x, y, 32, H - y);
    }
  }

  function drawCloud(x, y, pixel) {
    drawPixelSprite(
      ["...WW...", "..WWWW..", ".WWWWWW.", "WWWWWWWW", "WWWWWWWW", ".WWWWWW.", "..WWWW.."],
      x, y, pixel, { W: "#fffdf1" }
    );
  }

  function drawWorld() {
    const roseLevel = currentLevel === 2;
    const fishingLevel = currentLevel === 3;
    const picnicLevel = currentLevel === 4;
    const bottleLevel = currentLevel === 5;
    ctx.fillStyle = bottleLevel ? "#846750" : picnicLevel ? "#829568" : fishingLevel ? "#547e78" : roseLevel ? "#7f8e71" : "#73986c";
    ctx.fillRect(0, FLOOR, WORLD_WIDTH, H - FLOOR);
    ctx.fillStyle = bottleLevel ? "#d5a277" : picnicLevel ? "#c5b571" : fishingLevel ? "#b5b981" : roseLevel ? "#b1bd84" : "#9bbd7e";
    ctx.fillRect(0, FLOOR, WORLD_WIDTH, 8);
    ctx.fillStyle = bottleLevel ? "#a67e5c" : picnicLevel ? "#9cab6d" : fishingLevel ? "#6c9382" : roseLevel ? "#9aa879" : "#8aac71";
    for (let x = 0; x < WORLD_WIDTH; x += 32) {
      ctx.fillRect(x + 4, FLOOR + 16, 16, 4);
      ctx.fillRect(x + 20, FLOOR + 32, 8, 4);
    }
    for (const platform of platforms) {
      ctx.fillStyle = picnicLevel ? "#8e684d" : fishingLevel ? "#8d694a" : roseLevel ? "#879574" : "#7a9d70";
      ctx.fillRect(platform.x, platform.y, platform.w, 16);
      ctx.fillStyle = picnicLevel ? "#d0a76c" : fishingLevel ? "#c39a68" : roseLevel ? "#d1c18b" : "#b1c88a";
      ctx.fillRect(platform.x, platform.y, platform.w, 8);
      ctx.fillStyle = fishingLevel || picnicLevel ? "#634d3e" : "#536e58";
      ctx.fillRect(platform.x, platform.y + 14, platform.w, 2);
      ctx.fillStyle = fishingLevel || picnicLevel ? "#d8b27b" : "#d6dfad";
      for (let x = platform.x + 12; x < platform.x + platform.w - 8; x += 32) {
        ctx.fillRect(x, platform.y + 2, 12, 3);
      }
    }
    drawObstacles();
    for (let x = 120; x < WORLD_WIDTH; x += 235) {
      if (fishingLevel) drawReeds(x, FLOOR - 14);
      else drawFlower(x, FLOOR - 13, picnicLevel ? (x % 2 ? "#e1a34d" : "#f0cf61") : roseLevel ? (x % 2 ? "#d87889" : "#e9a1a1") : (x % 2 ? "#e59a8a" : "#f2d394"));
    }
  }

  function drawObstacles() {
    for (const obstacle of obstaclesByLevel[currentLevel] || []) {
      const top = FLOOR - obstacle.height;
      if (obstacle.type === "thorns") {
        ctx.fillStyle = "#526e46";
        ctx.fillRect(obstacle.x, FLOOR - 8, obstacle.width, 8);
        for (let x = obstacle.x + 3; x < obstacle.x + obstacle.width - 4; x += 12) {
          ctx.fillStyle = "#3e6342";
          ctx.fillRect(x, top + 8, 8, 12);
          ctx.fillStyle = "#bc5261";
          ctx.fillRect(x + 2, top + 2, 4, 8);
          ctx.fillRect(x, top + 6, 2, 4);
          ctx.fillRect(x + 6, top + 6, 2, 4);
        }
      } else if (obstacle.type === "water") {
        ctx.fillStyle = "#367b88";
        ctx.fillRect(obstacle.x, top, obstacle.width, obstacle.height);
        ctx.fillStyle = "#76c6c1";
        ctx.fillRect(obstacle.x + 8, top + 4, 16, 3);
        ctx.fillRect(obstacle.x + 38, top + 10, 20, 3);
        ctx.fillStyle = "#245e72";
        ctx.fillRect(obstacle.x, FLOOR - 3, obstacle.width, 3);
      } else {
        ctx.fillStyle = "#614332";
        ctx.fillRect(obstacle.x, top + 4, obstacle.width, obstacle.height - 4);
        ctx.fillStyle = "#c98c4d";
        ctx.fillRect(obstacle.x + 4, top + 8, obstacle.width - 8, obstacle.height - 12);
        ctx.fillStyle = "#e0b56d";
        ctx.fillRect(obstacle.x + 8, top + 12, 4, obstacle.height - 16);
        ctx.fillRect(obstacle.x + 24, top + 12, 4, obstacle.height - 16);
        ctx.fillStyle = "#754b37";
        ctx.fillRect(obstacle.x + 12, top, 24, 6);
      }
    }
  }

  function drawReeds(x, y) {
    ctx.fillStyle = "#426e5e";
    ctx.fillRect(x - 6, y + 2, 4, 12);
    ctx.fillRect(x + 2, y - 4, 4, 18);
    ctx.fillRect(x + 10, y + 1, 4, 13);
    ctx.fillStyle = "#b69b5e";
    ctx.fillRect(x - 6, y - 4, 4, 6);
    ctx.fillRect(x + 2, y - 10, 4, 6);
    ctx.fillRect(x + 10, y - 5, 4, 6);
  }

  function drawFlower(x, y, color) {
    ctx.fillStyle = "#638b63";
    ctx.fillRect(x - 2, y + 8, 4, 12);
    ctx.fillRect(x - 7, y + 12, 5, 3);
    ctx.fillRect(x + 2, y + 9, 5, 3);
    ctx.fillStyle = color;
    ctx.fillRect(x - 3, y - 7, 6, 6);
    ctx.fillRect(x - 7, y - 3, 6, 6);
    ctx.fillRect(x + 1, y - 3, 6, 6);
    ctx.fillRect(x - 3, y + 1, 6, 6);
    ctx.fillStyle = "#f4d781";
    ctx.fillRect(x - 2, y - 2, 4, 4);
  }

  function drawCollectible(item, time) {
    const bob = Math.round(Math.sin(time + item.x * .03)) * 4;
    const itemX = Math.round(item.x);
    const itemY = Math.round(item.y + bob);
    if (item.type === "heart") {
      drawPixelSprite(
        [".RR..RR.", "RRRRRRRR", "RRRRRRRR", ".RRRRRR.", "..RRRR..", "...RR..."],
        itemX - 16, itemY - 12, 4,
        { R: "#e44d68" }
      );
      ctx.fillStyle = "#a9324d";
      ctx.fillRect(itemX - 8, itemY + 8, 16, 4);
    } else if (item.type === "bottle") {
      ctx.fillStyle = "#526e58";
      ctx.fillRect(itemX - 10, itemY + 22, 20, 4);
      drawPixelSprite(
        ["...RR...", "..RRRR..", "..BBBB..", ".BBBBBB.", ".BBBBBB.", ".BRRRRB.", ".BRWWRB.", ".BRRRRB.", ".BBBBBB.", "..BBBB.."],
        itemX - 16, itemY - 20, 4,
        { R: "#d92732", B: "#202126", W: "#fff2dc" }
      );
    } else if (item.type === "couscous") {
      ctx.fillStyle = "#68784e";
      ctx.fillRect(itemX - 18, itemY + 16, 36, 4);
      drawPixelSprite(
        ["...HH...", "..HYYY..", ".YYYYYY.", "YYYGYYYY", ".KKKKKK.", "KBBBBBBK", ".KKKKKK."],
        itemX - 16, itemY - 16, 4,
        { H: "#ffe36b", Y: "#efbb28", G: "#d89218", K: "#684735", B: "#fff5dc" }
      );
    } else if (item.type === "rose") {
      ctx.fillStyle = "#61735f";
      ctx.fillRect(itemX - 12, itemY + 25, 24, 4);
      drawPixelSprite(
        ["...KK...", "..KRRK..", ".KRRRRK.", "KRRRPRRK", ".KRRRRK.", "..KRRK..", "...KK..."],
        itemX - 16, itemY - 24, 4,
        { K: "#9e334e", R: "#d85068", P: "#f49aa0" }
      );
      ctx.fillStyle = "#4f8158";
      ctx.fillRect(itemX - 2, itemY + 4, 4, 19);
      ctx.fillRect(itemX - 10, itemY + 9, 8, 4);
      ctx.fillRect(itemX + 2, itemY + 14, 8, 4);
    } else if (item.type === "hook") {
      ctx.fillStyle = "#526e68";
      ctx.fillRect(itemX - 10, itemY + 20, 20, 4);
      drawPixelSprite(
        ["....SS..", "....SS..", "....SD..", "....SS..", "....SS..", "...SS...", "..SS....", ".SS....."],
        itemX - 16, itemY - 20, 4,
        { S: "#dce5e4", D: "#8da6a7" }
      );
      ctx.fillStyle = "#f5fbf4";
      ctx.fillRect(itemX + 1, itemY - 19, 3, 5);
    } else if (item.type === "disc") {
      ctx.fillStyle = "#61735f";
      ctx.fillRect(itemX - 12, itemY + 18, 24, 4);
      for (let row = -5; row <= 5; row++) {
        for (let column = -5; column <= 5; column++) {
          const radius = Math.hypot(column, row);
          if (radius > 5.2) continue;
          let color = "#252a35";
          if (radius > 4 && radius < 4.6) color = "#616779";
          else if (radius > 3 && radius < 3.5) color = "#4d5362";
          else if (radius < 1.8) color = "#d58c73";
          if (radius < .75) color = "#f6dfab";
          ctx.fillStyle = color;
          ctx.fillRect(itemX - 16 + column * 3, itemY - 16 + row * 3, 3, 3);
        }
      }

      ctx.fillStyle = "#a9a0b7";
      ctx.fillRect(itemX - 7, itemY - 11, 3, 3);
    } else {
      ctx.fillStyle = "#61735f";
      ctx.fillRect(itemX - 28, itemY + 28, 56, 4);
      const catX = itemX - 40;
      const catY = itemY - 28;
      const catOutline = "#563722";
      const catGold = "#e5aa37";
      drawPixelSprite(
        ["...KK.", "..KYYK", ".KYYK.", ".KYYK.", ".KYYK.", ".KYYK.", ".KYYKK", "..KKKK"],
        catX + 52, catY + 4, 4,
        { K: catOutline, Y: catGold }
      );
      drawPixelSprite(
        ["..KKKKKKKKKK..", ".KYYYYYYYYYYK.", "KYYYYYYYYYYYYK", "KYYOYYYYYYYYYK", "KYYYYYYYYYYYYK", ".KYYYYYYYYYYK.", "..KDDK..KDDK..", "...KK....KK..."],
        catX + 24, catY + 16, 4,
        { K: catOutline, Y: catGold, O: "#bf742a", D: "#6d4526" }
      );
      drawPixelSprite(
        ["...K....K.", "..KPY..KPY", ".KYYYYYYK.", "KYYYYYYYYK", "KYYEYYEYYK", "KYYYYNCCYK", "KWCYYYYCWK", ".KYYYYYYK.", "..KK..KK.."],
        catX, catY + 4, 4,
        { K: catOutline, P: "#d28c55", Y: catGold, E: "#282329", N: "#d96956", C: "#fff0bd", W: "#fff5dc" }
      );
    }
  }

  function drawNpc() {
    if (currentLevel === 2) drawElisangela();
    else if (currentLevel === 3) drawAndre();
    else if (currentLevel === 4) drawEmily();
    else drawEduardo();
  }

  function drawNpcNameTag(name, x, y) {
    ctx.fillStyle = "#536e58";
    ctx.fillRect(x - 16, y - 20, 96, 16);
    ctx.fillStyle = "#fff8e9";
    ctx.fillRect(x - 14, y - 18, 92, 12);
    ctx.fillStyle = "#536e58";
    ctx.font = "700 7px 'Silkscreen', monospace";
    ctx.textAlign = "center";
    ctx.fillText(name, x + 32, y - 9);
  }

  function drawElisangela() {
    const x = npc.x;
    const y = FLOOR - npc.height;
    drawNpcNameTag("ELISANGELA", x, y);
    ctx.fillStyle = "rgba(58,70,53,.2)";
    ctx.fillRect(x + 5, FLOOR + 1, 32, 4);
    drawPixelSprite(
      ["...KKKK...", "..KHHHHK..", ".KHHHHHHK.", "KHKHHHHHHK", "HKSSSSSSKH", "HKSESSSEKH", "HKSSMSSSKH", "HKSSSSSSKH", ".KSSSSSSK.", "..KKWWKK..", ".KWWMMWWK.", "KWWMPPMWWK", "KWWMMMMWWK", ".KMMMMMMK.", "..BB..BB.."],
      x, y, 4,
      { K: "#26333a", H: "#9b6849", S: "#f1c39f", E: "#29343a", M: "#d87583", W: "#fff8e9", P: "#8f607e", B: "#f7f0df" }
    );
    ctx.fillStyle = "#d85d71";
    ctx.fillRect(x + 8, y + 4, 4, 4);
    ctx.fillRect(x + 12, y + 8, 4, 4);
  }

  function drawAndre() {
    const x = npc.x;
    const y = FLOOR - npc.height;
    drawNpcNameTag("ANDRÉ", x, y);
    ctx.fillStyle = "#634d3e";
    ctx.fillRect(x + 34, y + 18, 4, 4);
    ctx.fillRect(x + 38, y + 14, 4, 4);
    ctx.fillRect(x + 42, y + 10, 4, 4);
    ctx.fillRect(x + 46, y + 6, 4, 4);
    ctx.fillRect(x + 50, y + 2, 4, 4);
    ctx.fillStyle = "#dce5e4";
    ctx.fillRect(x + 52, y + 6, 2, 28);
    ctx.fillStyle = "rgba(58,70,53,.2)";
    ctx.fillRect(x + 5, FLOOR + 1, 32, 4);
    drawPixelSprite(
      ["...YYYY...", "..YYYYYY..", ".YYYYYYYY.", "..KSSSSK..", "..KSEESK..", "..KSSSSK..", "...KDDK...", "...KDDK...", "..KKBBKK..", ".KBBBBBBK.", "KBBPPPPBBK", "KBBBBBBBBK", ".KPPPPPPK.", "..KPPPPK..", "..KK..KK.."],
      x, y, 4,
      { K: "#26333a", Y: "#d3ad69", S: "#d69a72", E: "#29343a", D: "#51413b", B: "#4b7890", P: "#354b55" }
    );
  }

  function drawEmily() {
    const x = npc.x;
    const y = FLOOR - npc.height;
    drawNpcNameTag("EMILY", x, y);
    ctx.fillStyle = "rgba(58,70,53,.2)";
    ctx.fillRect(x + 5, FLOOR + 1, 32, 4);
    drawPixelSprite(
      ["...KKKK...", "..KHHHHK..", ".KHHHHHHK.", "KHKHHHHHHK", "HKSSSSSSKH", "HKSESSSEKH", "HKSSMSSSKH", "HKSSSSSSKH", ".KSSSSSSK.", "..KKWWKK..", ".KWWVVWWK.", "KWWVMMVWWK", "KWWYYYYWWK", ".KYYYYYYK.", "..BB..BB.."],
      x, y, 4,
      { K: "#26333a", H: "#9b6849", S: "#f1c39f", E: "#29343a", M: "#c17e76", W: "#fff8e9", V: "#76527b", Y: "#e4ad43", B: "#5c7184" }
    );
    ctx.fillStyle = "#d85d71";
    ctx.fillRect(x + 8, y + 4, 4, 4);
    ctx.fillRect(x + 12, y + 8, 4, 4);
  }

  function drawEduardo() {
    const x = npc.x;
    const y = FLOOR - npc.height;
    drawNpcNameTag("EDUARDO", x, y);
    ctx.fillStyle = "rgba(58,70,53,.2)";
    ctx.fillRect(x + 5, FLOOR + 1, 32, 4);
    ctx.fillStyle = "#79848a";
    ctx.fillRect(x - 9, y + 23, 4, 4);
    ctx.fillRect(x - 5, y + 27, 4, 20);
    ctx.fillRect(x - 9, y + 45, 4, 4);
    ctx.fillRect(x - 13, y + 49, 12, 4);
    drawPixelSprite(
      ["...KKKK...", "..KHHHHK..", ".KHHHHHHK.", "KHKHHHHHHK", "HKSSSSSSKH", "HKSESSSEKH", "HKSSMSSSKH", "HKSSSSSSKH", ".KSSSSSSK.", "..KKKKKK..", ".KRRRRRRK.", "KRRRRRRRRK", "KRRRRRRRRK", ".KNNBBNNK.", "..NN..NN.."],
      x, y, 4,
      { K: "#252a30", H: "#292326", S: "#9b5b3b", E: "#292326", M: "#633b30", R: "#d8443d", N: "#303947", B: "#d5dce0" }
    );
  }

  function drawPixelSprite(rows, x, y, pixel, palette) {
    for (let row = 0; row < rows.length; row++) {
      for (let column = 0; column < rows[row].length; column++) {
        const color = palette[rows[row][column]];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(x + column * pixel), Math.round(y + row * pixel), pixel, pixel);
      }
    }
  }

  function drawEnemy(enemy) {
    const y = FLOOR - enemy.height;
    const x = Math.round(enemy.x);
    ctx.fillStyle = "#61735f";
    ctx.fillRect(x + 4, FLOOR + 1, 24, 4);
    drawPixelSprite(
      ["...LL...", "..LKKL..", ".KGGGGK.", "KGGGGGGK", "KGEGGEGK", "KGGGGGGK", ".KGGGGK.", ".K.KK.K."],
      x, y, 4,
      { K: "#29383c", G: "#547b59", L: "#a9c978", E: "#f4dc92" }
    );
  }

  function drawExit() {
    const x = WORLD_WIDTH - 105;
    ctx.fillStyle = "#76936c";
    ctx.fillRect(x - 8, FLOOR - 80, 64, 80);
    ctx.fillStyle = "#f0d7a4";
    ctx.fillRect(x, FLOOR - 72, 48, 72);
    ctx.fillStyle = "#d7927d";
    ctx.fillRect(x + 8, FLOOR - 64, 32, 64);
    ctx.fillStyle = "#f7e9c4";
    ctx.fillRect(x + 32, FLOOR - 36, 4, 4);
    ctx.fillStyle = "#536e58";
    ctx.fillRect(x - 8, FLOOR - 80, 64, 4);
    ctx.fillStyle = "#fffdf1";
    ctx.font = "700 11px 'Silkscreen', monospace";
    ctx.textAlign = "center";
    ctx.fillText("SAÍDA", x + 24, FLOOR - 84);
  }

  function drawPlayer() {
    if (player.hurtTimer > 0 && Math.floor(performance.now() / 90) % 2 === 0) return;
    const x = Math.round(player.x);
    const walking = active && Math.abs(player.vx) > 0;
    const bob = walking && Math.floor(performance.now() / 140) % 2 ? 4 : 0;
    const y = Math.round(player.y + bob);
    const pixel = 4;
    const rows = selectedCharacter === "ellen"
      ? ["...KKKK...", "..KHHHHK..", ".KHHHHHHK.", "KHKHHHHHHK", "HKSSSSSSKH", "HKSESSSEKH", "HKSSMSSSKH", "HKSSSSSSKH", ".KSSSSSSK.", "..KKWWKK..", ".KWWJJWWK.", "KWWJDDJWWK", "..KPPPPK..", "..BB..BB.."]
      : ["...KKKK...", "..KCCCCK..", ".KCCQCCCK.", ".KCCCCCCKK", "HKSSSSSSKH", "HKSESSSEKH", "HKSSMSSSKH", ".KSSSSSSK.", "..KKTTKK..", ".KTTTTTTK.", "KTTTTTTTTK", "KTTQTQTTTK", "..KPPPPK..", "..BB..BB.."];
    const palette = selectedCharacter === "ellen"
      ? { K: "#26333a", H: "#9b6849", S: "#f1c39f", E: "#29343a", M: "#c17e76", W: "#fff8e9", J: "#436d8d", D: "#8fb5ca", P: "#54718a", B: "#f7f0df" }
      : { K: "#26333a", C: "#3d70a4", Q: "#92bde3", H: "#292d2d", S: "#f1c39f", E: "#29343a", M: "#c17e76", T: "#547a5b", P: "#303638", B: "#f7f0df" };
    ctx.save();
    if (player.facing < 0) {
      ctx.translate(x * 2 + player.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.fillStyle = "rgba(58,70,53,.2)";
    ctx.fillRect(x + 5, player.y + 54, 32, 4);
    drawPixelSprite(rows, x + 1, y, pixel, palette);
    ctx.restore();
  }

  document.addEventListener("keydown", (event) => {
    if (dialogueOpen) {
      if (event.key === "Escape") {
        closeNpcDialogue(false);
      } else if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(event.key)) {
        event.preventDefault();
      }
      return;
    }
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(event.key)) event.preventDefault();
    if (event.key.toLowerCase() === "c" && !event.repeat && active) {
      event.preventDefault();
      switchCharacter();
      return;
    }
    keys.add(event.key);
  });
  document.addEventListener("keyup", (event) => keys.delete(event.key));
  window.addEventListener("blur", () => keys.clear());

  document.querySelectorAll("[data-control]").forEach((button) => {
    const control = button.dataset.control;
    const key = control === "left" ? "ArrowLeft" : control === "right" ? "ArrowRight" : " ";
    const press = (event) => {
      event.preventDefault();
      keys.add(key);
      button.classList.add("is-active");
    };
    const release = () => {
      keys.delete(key);
      button.classList.remove("is-active");
    };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointerleave", release);
    button.addEventListener("pointercancel", release);
  });

  function renderTitleScene() {
    drawBackground();
    ctx.save();
    ctx.translate(-Math.round(cameraX), 0);
    drawWorld();
    drawCollectible({ type: "cat", x: 315, y: 345 }, performance.now() / 400);
    drawCollectible({ type: "disc", x: 425, y: 390 }, performance.now() / 400);
    const chosenCharacter = selectedCharacter;
    selectedCharacter = selectedCharacter || "ellen";
    player.x = 110;
    player.y = FLOOR - player.height;
    drawPlayer();
    selectedCharacter = chosenCharacter;
    ctx.restore();
  }

  renderTitleScene();
})();
