(() => {
  "use strict";

  const CFG = window.BIRTHDAY_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const refs = {
    confettiCanvas: $("confettiCanvas"), backgroundMusic: $("backgroundMusic"), topbar: $("topbar"), brandButton: $("brandButton"), soundButton: $("soundButton"), soundIcon: $("soundIcon"),
    heroTitle: $("heroTitle"), heroName: $("heroName"), heroSubtitle: $("heroSubtitle"), startButton: $("startButton"),
    landingScene: $("landingScene"), gameScene: $("gameScene"), cakeScene: $("cakeScene"), letterScene: $("letterScene"),
    gameCanvas: $("gameCanvas"), stageLabel: $("stageLabel"), progressLabel: $("progressLabel"), progressFill: $("progressFill"), progressSpark: $("progressSpark"),
    rewardRail: $("rewardRail"), heartCounter: $("heartCounter"), faceButton: $("faceButton"), faceUpload: $("faceUpload"), gameRestartButton: $("gameRestartButton"), gameIntro: $("gameIntro"), countdownText: $("countdownText"),
    rewardModal: $("rewardModal"), rewardBadge: $("rewardBadge"), rewardIcon: $("rewardIcon"), rewardTitle: $("rewardTitle"), rewardDescription: $("rewardDescription"), rewardNote: $("rewardNote"), continueRewardButton: $("continueRewardButton"),
    finishModal: $("finishModal"), goCakeButton: $("goCakeButton"),
    cakeTitle: $("cakeTitle"), cakeSubtitle: $("cakeSubtitle"), wishShort: $("wishShort"), blowMeterFill: $("blowMeterFill"), blowStatus: $("blowStatus"), micButton: $("micButton"), blowButton: $("blowButton"),
    cakeIllustration: $("cakeIllustration"), candleRow: $("candleRow"), cakeCelebration: $("cakeCelebration"), goLetterButton: $("goLetterButton"),
    letterVideo: $("letterVideo"), toast: $("toast"),
    calendarOverlay: $("calendarOverlay"), calendarDays: $("calendarDays"), calendarMessage: $("calendarMessage"), calendarTitle: $("calendarTitle"), calendarPrompt: $("calendarPrompt"), calendarMonth: $("calendarMonth"), calendarContinueButton: $("calendarContinueButton"), birthdayReveal: $("birthdayReveal"), fireworksStage: $("fireworksStage"),
    fragmentStars: $("fragmentStars"),
    rewardCard: $("rewardCard"), giftInteraction: $("giftInteraction"), giftHitArea: $("giftHitArea"), giftActionStatus: $("giftActionStatus"), giftActionButton: $("giftActionButton"), rewardReveal: $("rewardReveal"),
    cakeDesigner: $("cakeDesigner"), blowPanel: $("blowPanel"), confirmCakeButton: $("confirmCakeButton"),
    finalReveal: $("finalReveal"), finalRevealCard: $("finalRevealCard"), finalGiftTitle: $("finalGiftTitle"), finalGiftText: $("finalGiftText"), finalGiftLink: $("finalGiftLink")
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const random = (min, max) => min + Math.random() * (max - min);
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const rewards = Array.isArray(CFG.rewards) && CFG.rewards.length ? CFG.rewards : [
    { threshold: .33, icon: "🎁", badge: "礼物 01", title: "第一份礼物", description: "记得把这里换成真正准备的礼物。", note: "第一站奖励" },
    { threshold: .66, icon: "💌", badge: "礼物 02", title: "第二份礼物", description: "记得把这里换成真正准备的礼物。", note: "第二站奖励" },
    { threshold: .99, icon: "🏆", badge: "礼物 03", title: "今日王牌礼物", description: "记得把这里换成真正准备的礼物。", note: "终点奖励", giftAction: "multi" }
  ];

  let sceneName = "landing";
  let toastTimer = 0;
  let countdownToken = 0;

  function toast(message, duration) {
    refs.toast.textContent = message;
    refs.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => refs.toast.classList.remove("is-visible"), duration || 2600);
  }

  const birthday = Object.assign({ year: 2026, month: 10, day: 5, age: 19, title: "在日历上找到十月五号", prompt: "点中那一天，看看会发生什么。", hint: "选中 10 月 5 日", success: "日期锁定成功，庆祝程序启动！", wrong: "再找找，是十月五号哦", reveal: "祝你十九岁生日快乐" }, CFG.birthday || {});
  const uiText = Object.assign({}, CFG.texts || {});

  function buildCalendar() {
    const firstDay = new Date(birthday.year, birthday.month - 1, 1).getDay();
    const mondayOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(birthday.year, birthday.month, 0).getDate();
    refs.calendarMonth.textContent = birthday.year + " · " + String(birthday.month).padStart(2, "0") + " 月";
    refs.calendarDays.innerHTML = "";
    for (let blank = 0; blank < mondayOffset; blank += 1) {
      const spacer = document.createElement("span");
      spacer.className = "calendar-blank";
      spacer.setAttribute("aria-hidden", "true");
      refs.calendarDays.appendChild(spacer);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "calendar-day";
      button.dataset.day = String(day);
      button.textContent = String(day);
      button.setAttribute("aria-label", birthday.month + " 月 " + day + " 日");
      refs.calendarDays.appendChild(button);
    }
  }

  function launchCalendarFireworks() {
    const points = [
      [window.innerWidth * .17, window.innerHeight * .28],
      [window.innerWidth * .82, window.innerHeight * .22],
      [window.innerWidth * .28, window.innerHeight * .68],
      [window.innerWidth * .73, window.innerHeight * .7],
      [window.innerWidth * .5, window.innerHeight * .4]
    ];
    points.forEach((point, index) => {
      window.setTimeout(() => {
        burstConfetti(point[0], point[1], 55);
        if (sound.ctx && sound.enabled) sound.tone(520 + index * 90, .25, .018, 0, "triangle");
      }, index * 190);
    });
  }

  function selectCalendarDay(day, button) {
    if (refs.calendarOverlay.classList.contains("is-celebrating")) return;
    if (day !== Number(birthday.day)) {
      button.classList.add("is-wrong");
      window.setTimeout(() => button.classList.remove("is-wrong"), 420);
      refs.calendarMessage.textContent = birthday.wrong;
      refs.calendarMessage.hidden = false;
      return;
    }
    button.classList.add("is-selected");
    refs.calendarDays.querySelectorAll("[data-day]").forEach((item) => { item.disabled = true; });
    refs.calendarMessage.textContent = birthday.success;
    refs.calendarMessage.hidden = false;
    refs.calendarOverlay.classList.add("is-celebrating");
    sound.init();
    sound.startAmbient();
    sound.fanfare();
    launchCalendarFireworks();
    window.setTimeout(() => {
      refs.birthdayReveal.classList.add("is-visible");
      refs.calendarContinueButton.hidden = false;
    }, 850);
  }
  function applyConfig() {
    document.title = (CFG.name || "lbfff") + "｜happybirthday";
    refs.heroTitle.textContent = CFG.heroTitle || "Happy Birthday";
    refs.heroName.textContent = CFG.name || "lbfff";
    refs.heroSubtitle.textContent = CFG.heroSubtitle || "千里送祝福 嘟嘟嘟嘟嘟";
    refs.startButton.querySelector("span").textContent = CFG.startButton || "start the advanture";
    refs.cakeTitle.textContent = CFG.cakeTitle || "it is time to make a wish";
    refs.cakeSubtitle.textContent = CFG.cakeSubtitle || "吹气，或者赛博吹气。";

    refs.calendarTitle.textContent = birthday.title;
    refs.calendarPrompt.textContent = birthday.prompt;
    refs.calendarMessage.textContent = birthday.success;
    refs.birthdayReveal.querySelector("h2").textContent = birthday.reveal;
    const finalGift = CFG.finalGift || {};
    refs.finalGiftTitle.textContent = finalGift.title || "还有礼物在路上";
    refs.finalGiftText.textContent = finalGift.text || "剩下的神秘礼物正在慢慢抵达。";
    if (finalGift.url) {
      refs.finalGiftLink.href = finalGift.url;
      refs.finalGiftLink.hidden = false;
    }
    document.querySelectorAll("[data-text]").forEach((element) => {
      const key = element.dataset.text;
      if (uiText[key] !== undefined && uiText[key] !== null) element.textContent = uiText[key];
    });
    refs.calendarContinueButton.querySelector("span").textContent = CFG.startButton || "开始生日冒险";

    refs.rewardRail.innerHTML = rewards.map((reward, index) => {
      const left = clamp(Number(reward.threshold) || ((index + 1) / rewards.length), .04, .96) * 100;
      return `<span style="left:${left}%" data-reward-marker="${index}">${reward.icon || "✦"}</span>`;
    }).join("");
  }

  const sceneElements = {
    landing: refs.landingScene,
    game: refs.gameScene,
    cake: refs.cakeScene,
    letter: refs.letterScene
  };

  function setJourney(index) {
    document.querySelectorAll(".journey-step").forEach((step, stepIndex) => {
      step.classList.toggle("is-done", stepIndex < index);
      step.classList.toggle("is-current", stepIndex === index);
    });
  }

  function setScene(nextScene) {
    sceneName = nextScene;
    Object.entries(sceneElements).forEach(([name, element]) => element.classList.toggle("is-active", name === nextScene));
    document.body.classList.toggle("is-scrollable", nextScene === "cake" || nextScene === "letter");
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    if (nextScene !== "game") stopGame();
    if (nextScene === "game") setJourney(game.rewardIndex);
    if (nextScene === "cake") setJourney(4);
    if (nextScene === "letter") setJourney(4);
  }

  class SoundKit {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.ambientTimer = 0;
      this.externalPlaying = false;
      this.musicConfigured = false;
      this.step = 0;
    }
    configureMusic() {
      if (this.musicConfigured || !refs.backgroundMusic) return;
      this.musicConfigured = true;
      const musicConfig = CFG.music || {};
      refs.backgroundMusic.volume = clamp(Number(musicConfig.volume) || .28, 0, 1);
      if (musicConfig.src) {
        refs.backgroundMusic.src = musicConfig.src;
        refs.backgroundMusic.load();
      }
      refs.backgroundMusic.addEventListener("play", () => { this.externalPlaying = true; });
      refs.backgroundMusic.addEventListener("pause", () => { this.externalPlaying = false; });
    }
    init() {
      this.configureMusic();
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.ctx = new AudioContext();
      }
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    }
    tone(frequency, duration, volume, delay, type) {
      if (!this.enabled || !this.ctx) return;
      const start = this.ctx.currentTime + (delay || 0);
      const oscillator = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      oscillator.type = type || "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume || .025, start + .018);
      gain.gain.exponentialRampToValueAtTime(.0001, start + (duration || .2));
      oscillator.connect(gain).connect(this.ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + (duration || .2) + .03);
    }
    startAmbient() {
      if (!this.enabled) return;
      this.configureMusic();
      const hasMusicFile = refs.backgroundMusic && Boolean(refs.backgroundMusic.getAttribute("src"));
      if (hasMusicFile) {
        if (this.externalPlaying) return;
        refs.backgroundMusic.play().catch(() => {
          this.externalPlaying = false;
          this.startSynthAmbient();
        });
        return;
      }
      this.startSynthAmbient();
    }
    startSynthAmbient() {
      if (!this.enabled || this.ambientTimer) return;
      const pattern = [
        587.33, 587.33, 659.25, 587.33, 783.99, 739.99,
        587.33, 587.33, 659.25, 587.33, 880, 783.99,
        587.33, 587.33, 1174.66, 987.77, 783.99, 880, 783.99,
        1046.5, 1046.5, 987.77, 783.99, 880, 783.99
      ];
      const play = () => {
        if (!this.enabled || document.hidden) return;
        const note = pattern[this.step % pattern.length];
        this.tone(note, .38, .012, 0, "sine");
        if (this.step % 6 === 0) this.tone(note / 2, .5, .008, 0, "triangle");
        this.step += 1;
      };
      play();
      this.ambientTimer = window.setInterval(play, 470);
    }
    stopAmbient() {
      window.clearInterval(this.ambientTimer);
      this.ambientTimer = 0;
      this.externalPlaying = false;
      if (refs.backgroundMusic) refs.backgroundMusic.pause();
    }
    setEnabled(enabled) {
      this.enabled = enabled;
      refs.soundButton.classList.toggle("is-muted", !enabled);
      refs.soundButton.setAttribute("aria-pressed", String(enabled));
      refs.soundButton.setAttribute("aria-label", enabled ? "暂停背景音乐" : "播放背景音乐");
      refs.soundIcon.textContent = enabled ? "♫" : "×";
      if (!enabled) {
        this.stopAmbient();
        if (this.ctx && this.ctx.state === "running") this.ctx.suspend();
      } else {
        this.init();
        this.startAmbient();
      }
    }
    jump() { this.tone(520, .11, .022, 0, "triangle"); this.tone(760, .1, .015, .04, "sine"); }
    hit() { this.tone(170, .24, .035, 0, "sawtooth"); this.tone(120, .3, .02, .06, "triangle"); }
    reward() { [523.25, 659.25, 783.99, 1046.5].forEach((note, index) => this.tone(note, .42, .026, index * .11, "sine")); }
    puff() { this.tone(210, .22, .013, 0, "sawtooth"); this.tone(330, .18, .008, .03, "sine"); }
    fanfare() { [392, 523.25, 659.25, 783.99, 1046.5].forEach((note, index) => this.tone(note, .55, .026, index * .13, "triangle")); }
  }
  const sound = new SoundKit();
  const confettiCtx = refs.confettiCanvas.getContext("2d");
  let confettiParticles = [];
  let confettiDpr = 1;

  function resizeConfetti() {
    confettiDpr = Math.min(window.devicePixelRatio || 1, 2);
    refs.confettiCanvas.width = Math.round(window.innerWidth * confettiDpr);
    refs.confettiCanvas.height = Math.round(window.innerHeight * confettiDpr);
    confettiCtx.setTransform(confettiDpr, 0, 0, confettiDpr, 0, 0);
  }

  function burstConfetti(x, y, count) {
    const colors = ["#ff6f7d", "#ffc85a", "#70e1c2", "#9b82ff", "#ffffff", "#ff9b70"];
    const total = count || 100;
    for (let index = 0; index < total; index += 1) {
      const angle = random(Math.PI * 1.05, Math.PI * 1.95);
      const speed = random(110, 430);
      confettiParticles.push({
        x: x === undefined ? random(window.innerWidth * .15, window.innerWidth * .85) : x,
        y: y === undefined ? random(window.innerHeight * .1, window.innerHeight * .35) : y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - random(20, 150),
        gravity: random(260, 460),
        drag: random(.975, .992),
        life: random(2.6, 5.2),
        age: 0,
        size: random(5, 11),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: random(0, Math.PI * 2),
        spin: random(-8, 8),
        shape: Math.random() > .25 ? "rect" : "circle"
      });
    }
  }

  let confettiLast = performance.now();
  function confettiLoop(now) {
    const delta = Math.min(.04, (now - confettiLast) / 1000);
    confettiLast = now;
    confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    confettiParticles = confettiParticles.filter((particle) => particle.age < particle.life && particle.y < window.innerHeight + 80);
    confettiParticles.forEach((particle) => {
      particle.age += delta;
      particle.vy += particle.gravity * delta;
      particle.vx *= particle.drag;
      particle.vy *= particle.drag;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.rotation += particle.spin * delta;
      const alpha = clamp((particle.life - particle.age) / .8, 0, 1);
      confettiCtx.save();
      confettiCtx.globalAlpha = alpha;
      confettiCtx.translate(particle.x, particle.y);
      confettiCtx.rotate(particle.rotation);
      confettiCtx.fillStyle = particle.color;
      if (particle.shape === "circle") {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, particle.size * .48, 0, Math.PI * 2);
        confettiCtx.fill();
      } else {
        confettiCtx.fillRect(-particle.size / 2, -particle.size * .22, particle.size, particle.size * .44);
      }
      confettiCtx.restore();
    });
    window.requestAnimationFrame(confettiLoop);
  }

  const gameCtx = refs.gameCanvas.getContext("2d");
  const stageNames = [uiText.stage1 || "星光花园", uiText.stage2 || "云端长廊", uiText.stage3 || "愿望星河"];
  const starSeeds = Array.from({ length: 90 }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: random(.6, 2.1),
    phase: random(0, Math.PI * 2),
    speed: random(.4, 1.4)
  }));
  const fragmentSpecs = [
    { progress: .18, lane: .22, label: "勇气碎片" },
    { progress: .48, lane: .78, label: "好运碎片" },
    { progress: .88, lane: .38, label: "快乐碎片" }
  ];
  const game = {
    w: 960,
    h: 540,
    s: 1,
    dpr: 1,
    running: false,
    paused: true,
    progress: 0,
    playerY: .55,
    targetY: .55,
    playerVX: 0,
    spawnCooldown: .75,
    obstacles: [],
    hearts: 3,
    invincible: 0,
    hurtExpression: 0,
    shake: 0,
    elapsed: 0,
    lastFrame: performance.now(),
    lastGap: .5,
    rewardIndex: 0,
    fragments: fragmentSpecs.map((fragment) => ({ ...fragment, collected: false })),
    fragmentsCollected: 0,
    activeRewardIndex: -1,
    giftHoldTimer: 0,
    finished: false,
    autoPaused: false
  };

  const characterFace = { image: null, hurtImage: null, ready: false, hurtReady: false, custom: false };

  function setCharacterFace(source, temporary, slot) {
    const isHurtFace = slot === "hurt";
    const imageKey = isHurtFace ? "hurtImage" : "image";
    const readyKey = isHurtFace ? "hurtReady" : "ready";
    if (!source) {
      characterFace[imageKey] = null;
      characterFace[readyKey] = false;
      if (!isHurtFace) {
        characterFace.custom = false;
        refs.faceButton.classList.remove("has-custom-face");
        refs.faceButton.textContent = uiText.faceButton || "换脸";
        refs.faceButton.setAttribute("aria-label", "上传图片作为小人的脸");
      }
      return;
    }
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      characterFace[imageKey] = image;
      characterFace[readyKey] = true;
      if (!isHurtFace) {
        characterFace.custom = true;
        refs.faceButton.classList.add("has-custom-face");
        refs.faceButton.textContent = uiText.faceButtonDone || "换脸 ✓";
        refs.faceButton.setAttribute("aria-label", "小人已经使用自定义头像，点击可以更换");
        if (temporary) toast("新头像已戴上，撞一下看看表情", 3200);
      }
    };
    image.onerror = () => {
      if (temporary) toast("这张图片无法读取，请换一张 JPG 或 PNG", 3400);
    };
    image.src = source;
  }
  function resizeGameCanvas() {
    const rect = refs.gameCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    game.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(rect.width * game.dpr);
    const height = Math.round(rect.height * game.dpr);
    if (refs.gameCanvas.width !== width || refs.gameCanvas.height !== height) {
      refs.gameCanvas.width = width;
      refs.gameCanvas.height = height;
    }
    game.w = rect.width;
    game.h = rect.height;
    game.s = clamp(rect.height / 540, .62, 1.55);
    gameCtx.setTransform(game.dpr, 0, 0, game.dpr, 0, 0);
  }

  function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function currentStage() {
    return Math.min(2, Math.floor(game.progress / (100 / 3)));
  }

  function playerGeometry() {
    const top = 66 * game.s;
    const bottom = game.h - 63 * game.s;
    return {
      x: Math.min(game.w * .23, 220 * game.s),
      top,
      bottom,
      y: top + (bottom - top) * game.playerY,
      width: 34 * game.s,
      height: 50 * game.s
    };
  }

  function getObstacleRects(obstacle) {
    const top = 66 * game.s;
    const bottom = game.h - 63 * game.s;
    const center = top + (bottom - top) * obstacle.gapY;
    const gapTop = center - obstacle.gapHeight / 2;
    const gapBottom = center + obstacle.gapHeight / 2;
    return [
      { x: obstacle.x, y: 0, width: obstacle.width, height: Math.max(0, gapTop) },
      { x: obstacle.x, y: gapBottom, width: obstacle.width, height: Math.max(0, game.h - gapBottom) }
    ];
  }

  function resetGame() {
    countdownToken += 1;
    game.running = false;
    game.paused = true;
    game.progress = 0;
    game.playerY = .55;
    game.targetY = .55;
    game.playerVX = 0;
    game.spawnCooldown = .85;
    game.obstacles = [];
    game.hearts = 3;
    game.invincible = 0;
    game.hurtExpression = 0;
    game.shake = 0;
    game.elapsed = 0;
    game.lastGap = .5;
    game.rewardIndex = 0;
    game.activeRewardIndex = -1;
    game.fragments = fragmentSpecs.map((fragment) => ({ ...fragment, collected: false }));
    game.fragmentsCollected = 0;
    game.finished = false;
    game.autoPaused = false;
    refs.rewardModal.classList.remove("is-open");
    refs.finishModal.classList.remove("is-open");
    refs.rewardModal.setAttribute("aria-hidden", "true");
    refs.finishModal.setAttribute("aria-hidden", "true");
    refs.rewardCard.classList.remove("is-opened");
    refs.giftInteraction.hidden = false;
    refs.giftInteraction.classList.remove("is-charging", "is-complete");
    refs.rewardReveal.hidden = true;
    document.querySelectorAll(".reward-rail span").forEach((marker) => marker.classList.remove("is-earned"));
    updateGameHud();
    setJourney(0);
  }

  function updateGameHud() {
    const progress = clamp(game.progress, 0, 100);
    refs.progressFill.style.width = progress + "%";
    refs.progressSpark.style.left = progress + "%";
    refs.progressLabel.textContent = Math.floor(progress) + "%";
    refs.stageLabel.textContent = stageNames[currentStage()];
    refs.fragmentStars.textContent = Array.from({ length: 3 }, (_, index) => index < game.fragmentsCollected ? "★" : "☆").join("");
    refs.heartCounter.textContent = "♥".repeat(game.hearts) + "♡".repeat(Math.max(0, 3 - game.hearts));
  }

  function movePlayer(direction) {
    if (!game.running || game.paused) return;
    const before = game.targetY;
    game.targetY = clamp(game.targetY + direction * .245, .075, .925);
    if (before !== game.targetY) sound.jump();
  }

  function spawnObstacle() {
    const difficulty = game.progress / 100;
    const gapHeight = Math.max(142, 208 - difficulty * 56) * game.s;
    const width = random(44, 72) * game.s;
    let gapY = random(.18, .82);
    if (Math.abs(gapY - game.lastGap) > .37) gapY = game.lastGap + Math.sign(gapY - game.lastGap) * .37;
    gapY = clamp(gapY, .16, .84);
    game.lastGap = gapY;
    game.obstacles.push({
      x: game.w + width + 30 * game.s,
      width,
      gapY,
      gapHeight,
      kind: Math.floor(random(0, 3)),
      phase: random(0, Math.PI * 2)
    });
  }

  function handleCollision(obstacle) {
    game.hearts -= 1;
    game.invincible = 1.55;
    game.hurtExpression = 1.25;
    game.shake = .44;
    game.obstacles = game.obstacles.filter((item) => item !== obstacle);
    sound.hit();
    const geometry = playerGeometry();
    burstConfetti(geometry.x, geometry.y, 16);
    if (game.hearts <= 0) {
      game.hearts = 3;
      toast("没关系，勇气已经重新装满啦");
    } else {
      toast("碰到了，急也没用，继续前进吧");
    }
    updateGameHud();
  }

  function initGiftInteraction(index) {
    const reward = rewards[index] || {};
    refs.rewardCard.classList.remove("is-opened");
    refs.giftInteraction.hidden = false;
    refs.giftInteraction.classList.remove("is-charging", "is-complete");
    refs.giftInteraction.dataset.taps = "0";
    refs.rewardReveal.hidden = true;
    const action = reward.giftAction || "click";
    if (action === "hold") {
      refs.giftActionButton.textContent = uiText.giftHold || "按住不放，等盒子发光";
      refs.giftActionStatus.textContent = "按住按钮一秒，不要松手。";
    } else if (action === "multi") {
      refs.giftActionButton.textContent = uiText.giftMulti || "快速连点三次";
      refs.giftActionStatus.textContent = "连续点击三次，让礼物盒自己弹开。";
    } else {
      refs.giftActionButton.textContent = uiText.giftClick || "拉一下丝带";
      refs.giftActionStatus.textContent = "点一下按钮，礼物盒就会打开。";
    }
  }

  function revealReward() {
    const reward = rewards[game.activeRewardIndex] || {};
    if (refs.rewardCard.classList.contains("is-opened")) return;
    window.clearTimeout(game.giftHoldTimer);
    refs.rewardCard.classList.add("is-opened");
    refs.giftInteraction.classList.remove("is-charging");
    refs.giftInteraction.classList.add("is-complete");
    refs.rewardReveal.hidden = false;
    const marker = refs.rewardRail.querySelector(`[data-reward-marker="${game.activeRewardIndex}"]`);
    if (marker) marker.classList.add("is-earned");
    setJourney(game.activeRewardIndex + 1);
    sound.reward();
    burstConfetti(window.innerWidth * .5, window.innerHeight * .42, 110);
    window.setTimeout(() => {
      refs.giftInteraction.hidden = true;
      refs.continueRewardButton.focus();
    }, 430);
  }

  function openReward(index) {
    const reward = rewards[index] || {};
    game.paused = true;
    game.activeRewardIndex = index;
    refs.rewardBadge.textContent = reward.badge || ("礼物 " + String(index + 1).padStart(2, "0"));
    refs.rewardIcon.textContent = reward.icon || "🎁";
    refs.rewardTitle.textContent = reward.title || "一份生日礼物";
    refs.rewardDescription.textContent = reward.description || "这份礼物已经送到你手里。";
    refs.rewardNote.textContent = reward.note || "gogogo继续出发";
    initGiftInteraction(index);
    refs.rewardModal.classList.add("is-open");
    refs.rewardModal.setAttribute("aria-hidden", "false");
    window.setTimeout(() => refs.giftActionButton.focus(), 120);
  }

  function handleGiftAction() {
    const index = game.activeRewardIndex;
    const reward = rewards[index] || {};
    const action = reward.giftAction || "click";
    if (action === "click") {
      revealReward();
      return;
    }
    if (action === "multi") {
      const taps = Number(refs.giftInteraction.dataset.taps || 0) + 1;
      refs.giftInteraction.dataset.taps = String(taps);
      sound.tone(420 + taps * 95, .12, .018, 0, "triangle");
      if (taps >= 3) {
        revealReward();
      } else {
        refs.giftActionStatus.textContent = "已经点了 " + taps + " 次，再来 " + (3 - taps) + " 次。";
      }
    }
  }

  function fragmentScreenPosition(fragment) {
    const player = playerGeometry();
    const travel = game.w - 220 * game.s;
    return {
      x: player.x + (fragment.progress - game.progress / 100) * travel,
      y: player.top + (player.bottom - player.top) * fragment.lane
    };
  }

  function updateFragmentCollections() {
    const player = playerGeometry();
    game.fragments.forEach((fragment) => {
      if (fragment.collected) return;
      const position = fragmentScreenPosition(fragment);
      if (Math.abs(position.x - player.x) < 35 * game.s && Math.abs(position.y - player.y) < 42 * game.s) {
        fragment.collected = true;
        game.fragmentsCollected += 1;
        sound.reward();
        burstConfetti(position.x, position.y, 46);
        toast(fragment.label + "到手，彩蛋 +1");
      }
    });
  }
  function finishGame() {
    if (game.finished) return;
    game.finished = true;
    game.running = false;
    game.paused = true;
    setJourney(4);
    refs.finishModal.classList.add("is-open");
    refs.finishModal.setAttribute("aria-hidden", "false");
    sound.fanfare();
    burstConfetti(window.innerWidth * .5, window.innerHeight * .4, 180);
    window.setTimeout(() => refs.goCakeButton.focus(), 140);
  }

  function updateGame(delta) {
    if (!game.running || game.paused) return;
    game.elapsed += delta;
    game.invincible = Math.max(0, game.invincible - delta);
    game.hurtExpression = Math.max(0, game.hurtExpression - delta);
    game.shake = Math.max(0, game.shake - delta * 1.8);
    game.playerY += (game.targetY - game.playerY) * Math.min(1, delta * 13);
    game.playerVX = (game.targetY - game.playerY) * 70;
    game.progress = clamp(game.progress + delta * 1.67, 0, 100);
    updateFragmentCollections();
    const speed = (278 + game.progress * 2.45) * game.s;
    game.spawnCooldown -= delta;
    if (game.spawnCooldown <= 0) {
      spawnObstacle();
      game.spawnCooldown = random(.83, 1.16) * (1 - game.progress * .0012);
    }
    game.obstacles.forEach((obstacle) => { obstacle.x -= speed * delta; });
    game.obstacles = game.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -70 * game.s);
    if (game.invincible <= 0) {
      const player = playerGeometry();
      const playerRect = { x: player.x - player.width * .42, y: player.y - player.height * .5, width: player.width * .84, height: player.height };
      const hit = game.obstacles.find((obstacle) => getObstacleRects(obstacle).some((rect) => (
        playerRect.x < rect.x + rect.width && playerRect.x + playerRect.width > rect.x &&
        playerRect.y < rect.y + rect.height && playerRect.y + playerRect.height > rect.y
      )));
      if (hit) handleCollision(hit);
    }
    const nextReward = rewards[game.rewardIndex];
    if (nextReward && game.progress / 100 >= Number(nextReward.threshold)) {
      openReward(game.rewardIndex);
      game.rewardIndex += 1;
    }
    if (game.progress >= 100 && !game.paused) finishGame();
    updateGameHud();
  }
  function drawBackground() {
    const stagePalette = [
      { top: "#e8faff", mid: "#a9ddf7", floor: "#72bfe3", glow: "rgba(255,255,255,.68)" },
      { top: "#dff7ff", mid: "#8fd8f5", floor: "#62b9e2", glow: "rgba(255,255,255,.62)" },
      { top: "#d4f4ff", mid: "#7bcdf0", floor: "#4daede", glow: "rgba(255,255,255,.7)" }
    ][currentStage()];
    const palette = stagePalette;
    const gradient = gameCtx.createLinearGradient(0, 0, 0, game.h);
    gradient.addColorStop(0, palette.top);
    gradient.addColorStop(.68, palette.mid);
    gradient.addColorStop(1, palette.floor);
    gameCtx.fillStyle = gradient;
    gameCtx.fillRect(0, 0, game.w, game.h);

    const glow = gameCtx.createRadialGradient(game.w * .68, game.h * .34, 0, game.w * .68, game.h * .34, game.w * .48);
    glow.addColorStop(0, palette.glow);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    gameCtx.fillStyle = glow;
    gameCtx.fillRect(0, 0, game.w, game.h);

    starSeeds.forEach((star, index) => {
      const twinkle = .35 + Math.sin(game.elapsed * star.speed + star.phase) * .3;
      const x = ((star.x * game.w - game.elapsed * (7 + (index % 5) * 2)) % (game.w + 40) + game.w + 40) % (game.w + 40) - 20;
      gameCtx.globalAlpha = twinkle;
      gameCtx.fillStyle = index % 7 === 0 ? "#f5a900" : "#298ac2";
      gameCtx.beginPath();
      gameCtx.arc(x, star.y * game.h * .68, star.radius * game.s, 0, Math.PI * 2);
      gameCtx.fill();
    });
    gameCtx.globalAlpha = 1;

    const horizon = game.h * .74;
    const hillShift = (game.elapsed * 22) % 170;
    for (let layer = 0; layer < 2; layer += 1) {
      gameCtx.beginPath();
      gameCtx.moveTo(0, game.h);
      gameCtx.lineTo(0, horizon + layer * 28 * game.s);
      for (let x = -180 - hillShift; x < game.w + 200; x += 170) {
        gameCtx.quadraticCurveTo(x + 85, horizon - (layer ? 12 : 46) * game.s, x + 170, horizon + layer * 28 * game.s);
      }
      gameCtx.lineTo(game.w, game.h);
      gameCtx.closePath();
      gameCtx.fillStyle = layer ? "rgba(31,21,68,.88)" : "rgba(73,54,138,.42)";
      gameCtx.fill();
    }

    const floor = gameCtx.createLinearGradient(0, game.h * .82, 0, game.h);
    floor.addColorStop(0, "rgba(255,255,255,.5)");
    floor.addColorStop(1, "rgba(37,132,184,.34)");
    gameCtx.fillStyle = floor;
    gameCtx.fillRect(0, game.h * .82, game.w, game.h * .18);
    gameCtx.strokeStyle = "rgba(25,110,158,.18)";
    gameCtx.lineWidth = 1;
    gameCtx.beginPath();
    gameCtx.moveTo(0, game.h - 52 * game.s);
    gameCtx.lineTo(game.w, game.h - 52 * game.s);
    gameCtx.stroke();

    gameCtx.setLineDash([5 * game.s, 13 * game.s]);
    gameCtx.strokeStyle = "rgba(255,255,255,.72)";
    gameCtx.lineWidth = 2 * game.s;
    gameCtx.beginPath();
    gameCtx.moveTo(-game.elapsed * 80 % (34 * game.s), game.h - 28 * game.s);
    gameCtx.lineTo(game.w, game.h - 28 * game.s);
    gameCtx.stroke();
    gameCtx.setLineDash([]);
  }

  function drawObstacle(obstacle) {
    const rects = getObstacleRects(obstacle);
    const palette = [
      ["#ffcb63", "#f06b7d"],
      ["#83ead0", "#4e9fd4"],
      ["#b59cff", "#ef78b7"]
    ][obstacle.kind];
    rects.forEach((rect, index) => {
      if (rect.height <= 0 || rect.width <= 0) return;
      gameCtx.save();
      gameCtx.shadowColor = palette[1];
      gameCtx.shadowBlur = 18 * game.s;
      const gradient = gameCtx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
      gradient.addColorStop(0, palette[0]);
      gradient.addColorStop(1, palette[1]);
      gameCtx.fillStyle = gradient;
      roundedRect(gameCtx, rect.x, rect.y, rect.width, rect.height, 13 * game.s);
      gameCtx.fill();
      gameCtx.restore();

      gameCtx.save();
      roundedRect(gameCtx, rect.x, rect.y, rect.width, rect.height, 13 * game.s);
      gameCtx.clip();
      gameCtx.globalAlpha = .22;
      gameCtx.fillStyle = "#ffffff";
      for (let stripe = -rect.height; stripe < rect.height * 1.5; stripe += 28 * game.s) {
        gameCtx.save();
        gameCtx.translate(rect.x + rect.width * .5, rect.y + stripe);
        gameCtx.rotate(-.45);
        gameCtx.fillRect(-rect.width, 0, rect.width * 2, 5 * game.s);
        gameCtx.restore();
      }
      gameCtx.restore();

      const lightY = index === 0 ? rect.height - 17 * game.s : rect.y + 17 * game.s;
      gameCtx.fillStyle = "rgba(255,255,255,.75)";
      gameCtx.beginPath();
      gameCtx.arc(rect.x + rect.width * .5, lightY, 3.5 * game.s, 0, Math.PI * 2);
      gameCtx.fill();
    });
  }

  function drawRewardMarkers() {
    rewards.forEach((reward, index) => {
      if (index < game.rewardIndex) return;
      const progress = Number(reward.threshold) || ((index + 1) / rewards.length);
      const travel = (game.w - 220 * game.s);
      const x = playerGeometry().x + (progress - game.progress / 100) * travel;
      if (x < -70 || x > game.w + 70) return;
      const y = game.h * .34 + Math.sin(game.elapsed * 2.5 + index) * 7 * game.s;
      const pulse = 1 + Math.sin(game.elapsed * 4 + index) * .06;
      gameCtx.save();
      gameCtx.translate(x, y);
      gameCtx.scale(pulse, pulse);
      gameCtx.shadowColor = "#ffc85a";
      gameCtx.shadowBlur = 28 * game.s;
      gameCtx.fillStyle = "rgba(37,26,73,.88)";
      gameCtx.strokeStyle = "rgba(255,211,112,.82)";
      gameCtx.lineWidth = 2 * game.s;
      roundedRect(gameCtx, -24 * game.s, -24 * game.s, 48 * game.s, 48 * game.s, 14 * game.s);
      gameCtx.fill();
      gameCtx.stroke();
      gameCtx.font = Math.round(28 * game.s) + "px serif";
      gameCtx.textAlign = "center";
      gameCtx.textBaseline = "middle";
      gameCtx.fillText(reward.icon || "✦", 0, 1 * game.s);
      gameCtx.restore();
    });
  }

  function drawFragmentMarkers() {
    game.fragments.forEach((fragment, index) => {
      if (fragment.collected) return;
      const position = fragmentScreenPosition(fragment);
      if (position.x < -50 || position.x > game.w + 50) return;
      const pulse = 1 + Math.sin(game.elapsed * 5 + index * 1.7) * .1;
      gameCtx.save();
      gameCtx.translate(position.x, position.y);
      gameCtx.scale(pulse, pulse);
      gameCtx.shadowColor = "#fff0a8";
      gameCtx.shadowBlur = 24 * game.s;
      gameCtx.fillStyle = "#ffd65c";
      gameCtx.beginPath();
      for (let point = 0; point < 16; point += 1) {
        const angle = point * Math.PI / 8 - Math.PI / 2;
        const radius = (point % 2 === 0 ? 16 : 7) * game.s;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (point === 0) gameCtx.moveTo(x, y);
        else gameCtx.lineTo(x, y);
      }
      gameCtx.closePath();
      gameCtx.fill();
      gameCtx.restore();
    });
  }
  function drawFinishPortal() {
    if (game.progress < 68) return;
    const travel = game.w - 220 * game.s;
    const x = playerGeometry().x + (1 - game.progress / 100) * travel;
    if (x > game.w + 90) return;
    const radius = 58 * game.s;
    const pulse = 1 + Math.sin(game.elapsed * 3.8) * .06;
    gameCtx.save();
    gameCtx.translate(x, game.h * .5);
    gameCtx.scale(pulse, pulse);
    const ring = gameCtx.createRadialGradient(0, 0, radius * .2, 0, 0, radius);
    ring.addColorStop(0, "rgba(255,255,255,.95)");
    ring.addColorStop(.38, "rgba(255,200,90,.85)");
    ring.addColorStop(.68, "rgba(255,111,125,.42)");
    ring.addColorStop(1, "rgba(155,130,255,0)");
    gameCtx.fillStyle = ring;
    gameCtx.shadowColor = "#ffc85a";
    gameCtx.shadowBlur = 40 * game.s;
    gameCtx.beginPath();
    gameCtx.arc(0, 0, radius, 0, Math.PI * 2);
    gameCtx.fill();
    gameCtx.fillStyle = "#fff8dc";
    gameCtx.font = "bold " + Math.round(30 * game.s) + "px Georgia";
    gameCtx.textAlign = "center";
    gameCtx.textBaseline = "middle";
    gameCtx.fillText("100", 0, 1);
    gameCtx.restore();
  }

  function drawPlayer() {
    const player = playerGeometry();
    const bob = Math.sin(game.elapsed * 10) * 1.8 * game.s;
    const hurt = game.hurtExpression > 0;
    const usingHurtFace = hurt && characterFace.hurtReady && Boolean(characterFace.hurtImage);
    const blink = !hurt && game.invincible > 0 && Math.floor(game.elapsed * 16) % 2 === 0;
    const jolt = hurt ? Math.sin(game.elapsed * 58) * 3.2 * game.s : 0;
    const x = player.x;
    const y = player.y + bob;
    const s = game.s;

    gameCtx.save();
    gameCtx.globalAlpha = blink ? .38 : 1;
    if (game.invincible > 0) {
      gameCtx.shadowColor = hurt ? "#ff5d73" : "#70e1c2";
      gameCtx.shadowBlur = 28 * s;
      gameCtx.strokeStyle = hurt ? "rgba(255,93,115,.72)" : "rgba(112,225,194,.55)";
      gameCtx.lineWidth = (hurt ? 4 : 3) * s;
      gameCtx.beginPath();
      gameCtx.ellipse(x + jolt, y, (hurt ? 40 : 37) * s, (hurt ? 49 : 46) * s, 0, 0, Math.PI * 2);
      gameCtx.stroke();
    }
    gameCtx.shadowColor = "rgba(0,0,0,.35)";
    gameCtx.shadowBlur = 14 * s;
    gameCtx.globalAlpha *= .3;
    gameCtx.fillStyle = "#09061b";
    gameCtx.beginPath();
    gameCtx.ellipse(x + jolt, y + 34 * s, 28 * s, 8 * s, 0, 0, Math.PI * 2);
    gameCtx.fill();
    gameCtx.restore();

    gameCtx.save();
    gameCtx.globalAlpha = blink ? .38 : 1;
    gameCtx.translate(x + jolt, y);
    gameCtx.rotate(clamp(game.playerVX * .012, -.12, .12) + (hurt ? Math.sin(game.elapsed * 42) * .06 : 0));
    gameCtx.lineCap = "round";

    gameCtx.strokeStyle = "#23203d";
    gameCtx.lineWidth = 8 * s;
    gameCtx.beginPath();
    gameCtx.moveTo(-9 * s, 24 * s);
    gameCtx.lineTo(-13 * s, 36 * s);
    gameCtx.moveTo(8 * s, 24 * s);
    gameCtx.lineTo(14 * s, 36 * s);
    gameCtx.stroke();

    gameCtx.fillStyle = hurt ? "#ff8d82" : "#ffd064";
    gameCtx.shadowColor = hurt ? "#ff4162" : "#ff9f70";
    gameCtx.shadowBlur = 18 * s;
    roundedRect(gameCtx, -16 * s, -16 * s, 32 * s, 43 * s, 12 * s);
    gameCtx.fill();
    gameCtx.shadowBlur = 0;

    gameCtx.fillStyle = "#fff2df";
    gameCtx.beginPath();
    gameCtx.arc(0, -25 * s, 18 * s, 0, Math.PI * 2);
    gameCtx.fill();

    if ((characterFace.ready && characterFace.image) || usingHurtFace) {
      const image = usingHurtFace ? characterFace.hurtImage : characterFace.image;
      const sourceSize = Math.min(image.width, image.height);
      const sourceX = (image.width - sourceSize) / 2;
      const sourceY = (image.height - sourceSize) / 2;
      gameCtx.save();
      gameCtx.beginPath();
      gameCtx.arc(0, -25 * s, 16.5 * s, 0, Math.PI * 2);
      gameCtx.clip();
      gameCtx.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, -17.5 * s, -42.5 * s, 35 * s, 35 * s);
      if (hurt && !usingHurtFace) {
        gameCtx.fillStyle = "rgba(255,47,83,.28)";
        gameCtx.fillRect(-18 * s, -43 * s, 36 * s, 36 * s);
      }
      gameCtx.restore();
      gameCtx.strokeStyle = hurt ? "#ff4965" : "#ffffff";
      gameCtx.lineWidth = 2.2 * s;
      gameCtx.beginPath();
      gameCtx.arc(0, -25 * s, 16.5 * s, 0, Math.PI * 2);
      gameCtx.stroke();
    }

    gameCtx.fillStyle = "#3b2b46";
    gameCtx.beginPath();
    gameCtx.arc(-1 * s, -30 * s, 18 * s, Math.PI * 1.03, Math.PI * 1.98);
    gameCtx.lineTo(15 * s, -29 * s);
    gameCtx.quadraticCurveTo(8 * s, -43 * s, -4 * s, -41 * s);
    gameCtx.closePath();
    gameCtx.fill();

    if (!characterFace.ready && !usingHurtFace) {
      if (hurt) {
        gameCtx.strokeStyle = "#2a2440";
        gameCtx.lineWidth = 2.3 * s;
        [
          { x: 7 * s, y: -25 * s, size: 3.2 * s },
          { x: -3 * s, y: -27 * s, size: 2.7 * s }
        ].forEach((eye) => {
          gameCtx.beginPath();
          gameCtx.moveTo(eye.x - eye.size, eye.y - eye.size);
          gameCtx.lineTo(eye.x + eye.size, eye.y + eye.size);
          gameCtx.moveTo(eye.x + eye.size, eye.y - eye.size);
          gameCtx.lineTo(eye.x - eye.size, eye.y + eye.size);
          gameCtx.stroke();
        });
        gameCtx.fillStyle = "#d94360";
        gameCtx.beginPath();
        gameCtx.ellipse(4 * s, -16 * s, 3.5 * s, 4.5 * s, 0, 0, Math.PI * 2);
        gameCtx.fill();
      } else {
        gameCtx.fillStyle = "#2a2440";
        gameCtx.beginPath();
        gameCtx.arc(7 * s, -25 * s, 2 * s, 0, Math.PI * 2);
        gameCtx.fill();
        gameCtx.strokeStyle = "#d75b72";
        gameCtx.lineWidth = 2 * s;
        gameCtx.beginPath();
        gameCtx.arc(4 * s, -19 * s, 6 * s, .12, 1.4);
        gameCtx.stroke();
      }
    } else if (hurt && !usingHurtFace) {
      gameCtx.strokeStyle = "rgba(255,255,255,.95)";
      gameCtx.lineWidth = 5 * s;
      [
        { x: 7 * s, y: -25 * s, size: 3.2 * s },
        { x: -4 * s, y: -27 * s, size: 2.7 * s }
      ].forEach((eye) => {
        gameCtx.beginPath();
        gameCtx.moveTo(eye.x - eye.size, eye.y - eye.size);
        gameCtx.lineTo(eye.x + eye.size, eye.y + eye.size);
        gameCtx.moveTo(eye.x + eye.size, eye.y - eye.size);
        gameCtx.lineTo(eye.x - eye.size, eye.y + eye.size);
        gameCtx.stroke();
      });
      gameCtx.strokeStyle = "#d94360";
      gameCtx.lineWidth = 2.7 * s;
      [
        { x: 7 * s, y: -25 * s, size: 3.2 * s },
        { x: -4 * s, y: -27 * s, size: 2.7 * s }
      ].forEach((eye) => {
        gameCtx.beginPath();
        gameCtx.moveTo(eye.x - eye.size, eye.y - eye.size);
        gameCtx.lineTo(eye.x + eye.size, eye.y + eye.size);
        gameCtx.moveTo(eye.x + eye.size, eye.y - eye.size);
        gameCtx.lineTo(eye.x - eye.size, eye.y + eye.size);
        gameCtx.stroke();
      });
      gameCtx.fillStyle = "#d94360";
      gameCtx.beginPath();
      gameCtx.ellipse(4 * s, -16 * s, 3.5 * s, 4.5 * s, 0, 0, Math.PI * 2);
      gameCtx.fill();
    }

    if (hurt) {
      gameCtx.save();
      gameCtx.translate(23 * s, -51 * s);
      gameCtx.rotate(game.elapsed * 5);
      gameCtx.fillStyle = "#ffc85a";
      gameCtx.shadowColor = "#ff8c6c";
      gameCtx.shadowBlur = 12 * s;
      gameCtx.beginPath();
      for (let point = 0; point < 16; point += 1) {
        const angle = point * Math.PI / 8;
        const radius = (point % 2 === 0 ? 11 : 5) * s;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (point === 0) gameCtx.moveTo(px, py);
        else gameCtx.lineTo(px, py);
      }
      gameCtx.closePath();
      gameCtx.fill();
      gameCtx.restore();

      gameCtx.save();
      gameCtx.translate(-15 * s, -34 * s);
      gameCtx.fillStyle = "#8fe8ff";
      gameCtx.beginPath();
      gameCtx.moveTo(0, -5 * s);
      gameCtx.quadraticCurveTo(6 * s, 3 * s, 0, 8 * s);
      gameCtx.quadraticCurveTo(-6 * s, 3 * s, 0, -5 * s);
      gameCtx.fill();
      gameCtx.restore();
    }

    gameCtx.fillStyle = (characterFace.ready || usingHurtFace) ? "#ff8b9a" : "#70e1c2";
    gameCtx.beginPath();
    gameCtx.moveTo(-15 * s, -6 * s);
    gameCtx.lineTo(-38 * s, 1 * s + Math.sin(game.elapsed * 8) * 5 * s);
    gameCtx.lineTo(-16 * s, 7 * s);
    gameCtx.closePath();
    gameCtx.fill();
    gameCtx.restore();
  }
  function renderGame() {
    if (!game.w || !game.h) return;
    gameCtx.clearRect(0, 0, game.w, game.h);
    gameCtx.save();
    if (game.shake > 0) gameCtx.translate(random(-1, 1) * game.shake * 11, random(-1, 1) * game.shake * 8);
    drawBackground();
    drawRewardMarkers();
    game.obstacles.forEach(drawObstacle);
    drawFragmentMarkers();
    drawFinishPortal();
    drawPlayer();
    gameCtx.restore();
  }

  async function beginCountdown() {
    const token = ++countdownToken;
    game.running = false;
    game.paused = true;
    refs.gameIntro.classList.remove("is-hidden");
    for (const value of [3, 2, 1, "GO!"]) {
      if (token !== countdownToken) return;
      refs.countdownText.textContent = String(value);
      refs.countdownText.style.animation = "none";
      void refs.countdownText.offsetWidth;
      refs.countdownText.style.animation = "";
      sound.tone(value === "GO!" ? 784 : 440 + (3 - Number(value || 3)) * 70, .18, .018, 0, "triangle");
      await wait(value === "GO!" ? 420 : 600);
    }
    if (token !== countdownToken) return;
    refs.gameIntro.classList.add("is-hidden");
    game.running = true;
    game.paused = false;
    game.lastFrame = performance.now();
  }

  function startGame(fresh) {
    sound.init();
    sound.startAmbient();
    if (fresh) resetGame();
    setScene("game");
    window.setTimeout(resizeGameCanvas, 40);
    beginCountdown();
  }

  function stopGame() {
    countdownToken += 1;
    game.running = false;
    game.paused = true;
  }

  function gameLoop(now) {
    const delta = Math.min(.035, Math.max(0, (now - game.lastFrame) / 1000));
    game.lastFrame = now;
    if (sceneName === "game") {
      resizeGameCanvas();
      updateGame(delta);
      renderGame();
    }
    window.requestAnimationFrame(gameLoop);
  }
  const cake = {
    initialized: false,
    blowLevel: 0,
    outCount: 0,
    complete: false,
    decorated: false,
    flavor: "berry",
    topping: "berry",
    candleCount: 5,
    candles: [],
    mic: { active: false, stream: null, analyser: null, data: null, frame: 0 }
  };

  function setBlowMeter() {
    refs.blowMeterFill.style.width = (clamp(cake.blowLevel, 0, 1) * 100) + "%";
  }

  function extinguishNextCandle(silent) {
    const candle = cake.candles[cake.outCount];
    if (!candle) return;
    candle.classList.add("is-out");
    cake.outCount += 1;
    if (!silent) sound.puff();
    if (cake.outCount >= cake.candles.length) {
      completeCake();
    } else {
      refs.blowStatus.textContent = "还剩 " + (cake.candles.length - cake.outCount) + " 根，再吹一点点";
    }
  }

  function puff(amount, silent) {
    if (!cake.decorated) {
      toast("先做蛋糕");
      return;
    }
    if (cake.complete) return;
    cake.blowLevel = clamp(cake.blowLevel + amount, 0, 1);
    if (!silent) sound.puff();
    setBlowMeter();
    const targetOut = Math.min(cake.candles.length, Math.floor(cake.blowLevel * cake.candles.length + .001));
    while (cake.outCount < targetOut && !cake.complete) extinguishNextCandle(true);
    if (!cake.complete) refs.blowStatus.textContent = cake.blowLevel > .52 ? "已经吹灭一半啦" : "气流再大一点，愿望会更近";
  }

  function rebuildCandles(count) {
    refs.candleRow.innerHTML = "";
    cake.candles = [];
    cake.candleCount = count;
    cake.blowLevel = 0;
    cake.outCount = 0;
    cake.complete = false;
    refs.cakeIllustration.classList.remove("is-celebrating");
    refs.cakeCelebration.classList.remove("is-visible");
    for (let index = 0; index < count; index += 1) {
      const candle = document.createElement("div");
      candle.className = "candle";
      candle.setAttribute("aria-label", "生日蜡烛 " + (index + 1));
      const flame = document.createElement("span");
      flame.className = "flame";
      candle.appendChild(flame);
      refs.candleRow.appendChild(candle);
      cake.candles.push(candle);
    }
    setBlowMeter();
  }

  function applyCakeDesign() {
    refs.cakeIllustration.classList.remove("flavor-berry", "flavor-sunny", "flavor-mint");
    refs.cakeIllustration.classList.remove("topping-berry", "topping-star", "topping-flag");
    refs.cakeIllustration.classList.add("flavor-" + cake.flavor, "topping-" + cake.topping);
    refs.cakeDesigner.querySelectorAll("[data-cake-flavor]").forEach((button) => button.classList.toggle("is-selected", button.dataset.cakeFlavor === cake.flavor));
    refs.cakeDesigner.querySelectorAll("[data-cake-topping]").forEach((button) => button.classList.toggle("is-selected", button.dataset.cakeTopping === cake.topping));
    refs.cakeDesigner.querySelectorAll("[data-candle-count]").forEach((button) => button.classList.toggle("is-selected", Number(button.dataset.candleCount) === cake.candleCount));
  }

  function chooseCakeOption(type, value) {
    if (cake.decorated) {
      toast("蛋糕已经确认，可以直接去吹蜡烛");
      return;
    }
    if (type === "flavor") cake.flavor = value;
    if (type === "topping") cake.topping = value;
    if (type === "count") rebuildCandles(Number(value));
    applyCakeDesign();
    sound.tone(560, .1, .014, 0, "triangle");
  }

  function confirmCakeDesign() {
    if (cake.decorated) return;
    cake.decorated = true;
    refs.cakeDesigner.classList.add("is-complete");
    refs.blowPanel.classList.remove("is-locked");
    refs.blowStatus.textContent = "蛋糕已经准备好，可以对着 " + cake.candleCount + " 根蜡烛吹气了";
    sound.reward();
    burstConfetti(window.innerWidth * .6, window.innerHeight * .5, 70);
  }

  function initCake() {
    if (cake.initialized) return;
    cake.initialized = true;
    rebuildCandles(cake.candleCount);
    applyCakeDesign();
    refs.blowPanel.classList.add("is-locked");
  }
  function completeCake() {
    if (cake.complete) return;
    cake.complete = true;
    cake.blowLevel = 1;
    cake.candles.forEach((candle) => candle.classList.add("is-out"));
    cake.outCount = cake.candles.length;
    setBlowMeter();
    refs.blowStatus.textContent = "已吹灭";
    refs.cakeIllustration.classList.add("is-celebrating");
    refs.cakeCelebration.classList.add("is-visible");
    stopMicrophone();
    sound.fanfare();
    burstConfetti(window.innerWidth * .62, window.innerHeight * .48, 190);
  }

  function stopMicrophone() {
    window.cancelAnimationFrame(cake.mic.frame);
    if (cake.mic.stream) cake.mic.stream.getTracks().forEach((track) => track.stop());
    cake.mic.active = false;
    cake.mic.stream = null;
    cake.mic.analyser = null;
    cake.mic.data = null;
  }

  function microphoneLoop() {
    if (!cake.mic.active || !cake.mic.analyser) return;
    cake.mic.analyser.getByteTimeDomainData(cake.mic.data);
    let sum = 0;
    for (let index = 0; index < cake.mic.data.length; index += 1) {
      const value = (cake.mic.data[index] - 128) / 128;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / cake.mic.data.length);
    if (rms > .04) {
      puff(Math.min(.008, (rms - .035) * .16), true);
      refs.blowStatus.textContent = "正在听见你的气息，继续吹";
    }
    cake.mic.frame = window.requestAnimationFrame(microphoneLoop);
  }

  async function requestMicrophone() {
    if (!cake.decorated) {
      toast("先确认蛋糕设计，再打开麦克风");
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast("当前浏览器不能直接使用麦克风，可以点击魔法按钮");
      return;
    }
    try {
      stopMicrophone();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      await audioContext.resume();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      cake.mic.active = true;
      cake.mic.stream = stream;
      cake.mic.analyser = analyser;
      cake.mic.data = new Uint8Array(analyser.fftSize);
      refs.micButton.querySelector("span").textContent = "麦克风已开启，对着屏幕吹气";
      refs.blowStatus.textContent = "轻轻靠近麦克风，像吹灭真蜡烛一样吹";
      microphoneLoop();
    } catch (error) {
      refs.blowStatus.textContent = "麦克风没有打开，也可以使用魔法按钮";
      toast("没有拿到麦克风权限，使用按钮也可以完成");
    }
  }

  function initializeVideo() {
    const source = CFG.videoSrc || "./20251005.mp4";
    refs.letterVideo.src = source;
    refs.letterVideo.load();
  }

  function playFinalVideo() {
    sound.stopAmbient();
    refs.letterVideo.currentTime = 0;
    refs.letterVideo.play().catch(() => {
      toast("点击视频播放按钮即可开始");
    });
  }
  refs.startButton.addEventListener("click", () => startGame(true));
  refs.faceButton.addEventListener("click", () => refs.faceUpload.click());
  refs.faceUpload.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("请选择 JPG、PNG 或 WEBP 图片");
      event.target.value = "";
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast("图片不要超过 8 MB，太大加载会比较慢");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCharacterFace(String(reader.result), true);
    reader.onerror = () => toast("头像读取失败，请重新选择");
    reader.readAsDataURL(file);
    event.target.value = "";
  });
  refs.gameRestartButton.addEventListener("click", () => startGame(true));
  refs.calendarDays.addEventListener("click", (event) => {
    const dayButton = event.target.closest("[data-day]");
    if (!dayButton) return;
    selectCalendarDay(Number(dayButton.dataset.day), dayButton);
  });
  refs.calendarContinueButton.addEventListener("click", () => {
    refs.calendarOverlay.classList.add("is-dismissed");
    refs.startButton.focus();
  });
  refs.giftActionButton.addEventListener("click", handleGiftAction);
  refs.giftActionButton.addEventListener("pointerdown", () => {
    const reward = rewards[game.activeRewardIndex] || {};
    if (reward.giftAction !== "hold") return;
    refs.giftInteraction.classList.add("is-charging");
    refs.giftActionStatus.textContent = "坚持住，盒子正在发光……";
    game.giftHoldTimer = window.setTimeout(() => {
      refs.giftInteraction.classList.remove("is-charging");
      revealReward();
    }, 800);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
    refs.giftActionButton.addEventListener(eventName, () => {
      const reward = rewards[game.activeRewardIndex] || {};
      if (reward.giftAction !== "hold") return;
      window.clearTimeout(game.giftHoldTimer);
      if (!refs.rewardCard.classList.contains("is-opened")) {
        refs.giftInteraction.classList.remove("is-charging");
        refs.giftActionStatus.textContent = "松得有点早，再按住一秒试试。";
      }
    });
  });
  refs.continueRewardButton.addEventListener("click", () => {
    const index = game.activeRewardIndex;
    refs.rewardModal.classList.remove("is-open");
    refs.rewardModal.setAttribute("aria-hidden", "true");
    if (index === rewards.length - 1) {
      finishGame();
      return;
    }
    game.paused = false;
    game.lastFrame = performance.now();
    toast("礼物收好，继续跑下一段");
  });
  refs.cakeDesigner.querySelectorAll("[data-cake-flavor]").forEach((button) => button.addEventListener("click", () => chooseCakeOption("flavor", button.dataset.cakeFlavor)));
  refs.cakeDesigner.querySelectorAll("[data-cake-topping]").forEach((button) => button.addEventListener("click", () => chooseCakeOption("topping", button.dataset.cakeTopping)));
  refs.cakeDesigner.querySelectorAll("[data-candle-count]").forEach((button) => button.addEventListener("click", () => chooseCakeOption("count", button.dataset.candleCount)));
  refs.confirmCakeButton.addEventListener("click", confirmCakeDesign);
  refs.goCakeButton.addEventListener("click", () => {
    refs.finishModal.classList.remove("is-open");
    refs.finishModal.setAttribute("aria-hidden", "true");
    initCake();
    setScene("cake");
    burstConfetti(window.innerWidth * .6, window.innerHeight * .42, 70);
  });
  refs.brandButton.addEventListener("click", () => {
    stopMicrophone();
    setScene("landing");
  });
  refs.soundButton.addEventListener("click", () => sound.setEnabled(!sound.enabled));
  refs.micButton.addEventListener("click", requestMicrophone);
  refs.blowButton.addEventListener("click", () => {
    if (cake.complete) {
      setScene("letter");
      playFinalVideo();
      return;
    }
    puff(.28, false);
  });
  refs.goLetterButton.addEventListener("click", () => {
    setScene("letter");
    playFinalVideo();
    burstConfetti(window.innerWidth * .5, window.innerHeight * .36, 60);
  });
  refs.letterVideo.addEventListener("error", () => {
    toast("视频无法播放，请检查 20251005.mp4 是否仍在项目根目录", 3600);
  });

  document.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      movePlayer(button.dataset.move === "up" ? -1 : 1);
    });
  });

  const gameFrame = refs.gameCanvas.parentElement;
  let swipeStart = 0;
  gameFrame.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".touch-controls") || event.target.closest(".game-hud")) return;
    swipeStart = event.clientY;
  });
  gameFrame.addEventListener("pointerup", (event) => {
    if (!swipeStart || event.target.closest(".touch-controls") || event.target.closest(".game-hud")) return;
    const distance = swipeStart - event.clientY;
    if (Math.abs(distance) > 22) movePlayer(distance > 0 ? -1 : 1);
    swipeStart = 0;
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (sceneName === "game" && !event.repeat) {
      if (key === "arrowup" || key === "w") {
        event.preventDefault();
        movePlayer(-1);
      }
      if (key === "arrowdown" || key === "s") {
        event.preventDefault();
        movePlayer(1);
      }
    }
    if (sceneName === "cake" && key === "b" && !event.repeat) puff(.28, false);
    if (event.key === "Escape") {
      if (refs.rewardModal.classList.contains("is-open")) {
        refs.rewardModal.classList.remove("is-open");
        refs.rewardModal.setAttribute("aria-hidden", "true");
        if (!game.finished) game.paused = false;
      }
      if (refs.finishModal.classList.contains("is-open")) {
        refs.finishModal.classList.remove("is-open");
        refs.finishModal.setAttribute("aria-hidden", "true");
      }
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && sceneName === "game" && game.running && !game.paused) {
      game.autoPaused = true;
      game.paused = true;
      return;
    }
    if (!document.hidden && game.autoPaused && sceneName === "game") {
      game.autoPaused = false;
      toast("回来啦，继续前进");
      window.setTimeout(() => {
        if (sceneName === "game" && !game.finished) game.paused = false;
      }, 700);
    }
  });

  window.addEventListener("resize", () => {
    resizeConfetti();
    resizeGameCanvas();
  });
  window.addEventListener("beforeunload", () => {
    stopMicrophone();
  });

  applyConfig();
  buildCalendar();
  if (CFG.character && CFG.character.faceImage) setCharacterFace(CFG.character.faceImage, false);
  if (CFG.character && CFG.character.hurtFaceImage) setCharacterFace(CFG.character.hurtFaceImage, false, "hurt");
  initCake();
  initializeVideo();
  resizeConfetti();
  resizeGameCanvas();
  setScene("landing");
  game.lastFrame = performance.now();
  window.requestAnimationFrame(confettiLoop);
  window.requestAnimationFrame(gameLoop);
})();