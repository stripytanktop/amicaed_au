/* Sentence Builder | AmicaEd: app logic. Needs js/sentences.js loaded first (defines LEVELS). */
// ------------------------------------------------------------------
// State
// ------------------------------------------------------------------
let currentLevel = null;
let sentencePool = [];
const customByLevel = {};   // teacher sentences, kept in memory for this visit only
let currentIndex = -1;
let targetWords = [];
let audioEnabled = true;
let step1Complete = false;
let activeDrag = null;      // global drag state (ensures no tile ever gets stuck mid-screen)

const $ = id => document.getElementById(id);

const ICON_ON  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/></svg>';
const ICON_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';

window.addEventListener("DOMContentLoaded", () => {
  renderLevelPicker();
  renderAudioButton();

  $("back-btn").addEventListener("click", goToStart);
  $("audio-toggle").addEventListener("click", toggleAudio);
  $("new-btn").addEventListener("click", nextRandomSentence);
  $("teacher-btn").addEventListener("click", toggleTeacherPanel);
  $("close-teacher-btn").addEventListener("click", toggleTeacherPanel);
  $("use-custom-btn").addEventListener("click", saveCustomSentences);
  $("reset-btn").addEventListener("click", loadDefaultSentences);
  $("hear-sentence-btn").addEventListener("click", speakFullSentence);
  $("voice-select").addEventListener("change", onVoiceChange);
  $("voice-test-btn").addEventListener("click", () => speakText("The little brown dog ran fast.", true));
  populateVoiceSelect();
  $("check-order-btn").addEventListener("click", checkWordOrder);
  $("check-typing-btn").addEventListener("click", checkTypedSentence);
  $("typing-input").addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); checkTypedSentence(); }
  });
});

// ------------------------------------------------------------------
// Start page: level picker
// ------------------------------------------------------------------
function renderLevelPicker() {
  const list = $("levels");
  LEVELS.forEach(level => {
    const counts = level.sentences.map(s => s.trim().split(/\s+/).length);
    const min = Math.min(...counts), max = Math.max(...counts);
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "level-btn";
    btn.dataset.level = level.id;
    btn.innerHTML =
      '<span class="level-name"></span>' +
      '<span class="level-focus"></span>' +
      '<span class="level-range"></span>';
    btn.querySelector(".level-name").textContent = level.name;
    btn.querySelector(".level-focus").textContent = level.focus;
    btn.querySelector(".level-range").textContent = min + "\u2013" + max + " words";
    btn.addEventListener("click", () => selectLevel(level.id));
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function selectLevel(id) {
  currentLevel = LEVELS.find(l => l.id === id);
  document.body.dataset.level = id;

  const custom = customByLevel[id];
  sentencePool = custom ? [...custom] : [...currentLevel.sentences];
  currentIndex = -1;

  $("level-title").textContent = currentLevel.name;
  $("reset-btn").textContent = "Reset to " + currentLevel.name + " sentences";
  $("sentence-list").value = sentencePool.join("\n");
  $("custom-flag").hidden = !custom;
  $("teacher-status").textContent = "";
  $("teacher-status").className = "teacher-status";
  closeTeacherPanel();

  $("start-view").hidden = true;
  $("builder-view").hidden = false;
  window.scrollTo(0, 0);
  nextRandomSentence();
  $("level-title").focus({ preventScroll: true });
}

function goToStart() {
  if (activeDrag) finalizeDrag(null);
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  $("builder-view").hidden = true;
  $("start-view").hidden = false;
  document.body.dataset.level = "";
  window.scrollTo(0, 0);
  const last = document.querySelector('.level-btn[data-level="' + currentLevel.id + '"]');
  if (last) last.focus({ preventScroll: true });
}

// ------------------------------------------------------------------
// Teacher setup
// ------------------------------------------------------------------
function closeTeacherPanel() {
  $("teacher-panel").classList.remove("open");
  $("teacher-btn").setAttribute("aria-expanded", "false");
}

function toggleTeacherPanel() {
  const open = $("teacher-panel").classList.toggle("open");
  $("teacher-btn").setAttribute("aria-expanded", String(open));
  if (open) $("sentence-list").focus({ preventScroll: true });
}

function setTeacherStatus(msg, warn) {
  const el = $("teacher-status");
  el.textContent = msg;
  el.className = "teacher-status" + (warn ? " warn" : "");
}

function saveCustomSentences() {
  const lines = $("sentence-list").value
    .split("\n")
    .map(s => s.trim())
    .filter(s => s.length > 0);
  if (lines.length === 0) {
    setTeacherStatus("Type at least one sentence first.", true);
    return;
  }
  customByLevel[currentLevel.id] = lines;
  sentencePool = [...lines];
  currentIndex = -1;
  $("custom-flag").hidden = false;
  setTeacherStatus("", false);
  closeTeacherPanel();
  nextRandomSentence();
}

function loadDefaultSentences() {
  delete customByLevel[currentLevel.id];
  sentencePool = [...currentLevel.sentences];
  $("sentence-list").value = sentencePool.join("\n");
  $("custom-flag").hidden = true;
  currentIndex = -1;
  setTeacherStatus("Back to the " + currentLevel.name + " sentences.", false);
  nextRandomSentence();
}

// ------------------------------------------------------------------
// Audio
// ------------------------------------------------------------------
function renderAudioButton() {
  const btn = $("audio-toggle");
  btn.innerHTML = (audioEnabled ? ICON_ON : ICON_OFF) + (audioEnabled ? "Audio: on" : "Audio: off");
  btn.classList.toggle("off", !audioEnabled);
  btn.setAttribute("aria-pressed", String(audioEnabled));
}

function toggleAudio() {
  audioEnabled = !audioEnabled;
  renderAudioButton();
  if (!audioEnabled && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

// Web pages can't read the iPad's Spoken Content voice setting, so the app lets the
// teacher choose. "Automatic" picks the best installed English voice: Australian first,
// then Premium / Enhanced ones, skipping novelty voices.
const VOICE_KEY = "amicaed-sentence-builder-voice";
let cachedVoices = [];
let chosenVoiceURI = "";

try { chosenVoiceURI = localStorage.getItem(VOICE_KEY) || ""; } catch (e) { chosenVoiceURI = ""; }

const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy/;

function voiceScore(v) {
  const lang = v.lang.replace("_", "-").toLowerCase();
  const name = v.name.toLowerCase();
  let s = 0;
  if (lang === "en-au") s += 100;
  else if (lang === "en-nz" || lang === "en-gb") s += 40;
  if (/premium/.test(name)) s += 30;
  else if (/enhanced/.test(name)) s += 20;
  if (/google|natural|neural|online/.test(name)) s += 15;
  if (/compact/.test(name)) s -= 5;
  if (NOVELTY.test(name)) s -= 100;
  return s;
}

function englishVoices() {
  return cachedVoices
    .filter(v => v.lang && v.lang.replace("_", "-").toLowerCase().startsWith("en"))
    .sort((a, b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name));
}

function loadVoices() {
  cachedVoices = ("speechSynthesis" in window) ? (window.speechSynthesis.getVoices() || []) : [];
  populateVoiceSelect();
}

function populateVoiceSelect() {
  const sel = $("voice-select");
  if (!sel) return;
  const voices = englishVoices();
  sel.innerHTML = "";
  if (!("speechSynthesis" in window) || voices.length === 0) {
    const o = document.createElement("option");
    o.textContent = "No English voices found on this device";
    sel.appendChild(o);
    sel.disabled = true;
    $("voice-test-btn").disabled = true;
    return;
  }
  sel.disabled = false;
  $("voice-test-btn").disabled = false;
  const auto = document.createElement("option");
  auto.value = "";
  auto.textContent = "Automatic (best available)";
  sel.appendChild(auto);
  voices.forEach(v => {
    const o = document.createElement("option");
    o.value = v.voiceURI;
    o.textContent = v.name + " (" + v.lang.replace("_", "-") + ")";
    sel.appendChild(o);
  });
  // Keep the saved choice only if that voice still exists
  sel.value = voices.some(v => v.voiceURI === chosenVoiceURI) ? chosenVoiceURI : "";
}

function pickVoice() {
  if (!cachedVoices.length) loadVoices();
  const voices = englishVoices();
  if (chosenVoiceURI) {
    const chosen = voices.find(v => v.voiceURI === chosenVoiceURI);
    if (chosen) return chosen;
  }
  return voices[0] || null;
}

function onVoiceChange() {
  chosenVoiceURI = $("voice-select").value;
  try {
    if (chosenVoiceURI) localStorage.setItem(VOICE_KEY, chosenVoiceURI);
    else localStorage.removeItem(VOICE_KEY);
  } catch (e) { /* storage unavailable: choice lasts for this visit only */ }
  speakText("The little brown dog ran fast.", true);
}

if ("speechSynthesis" in window) {
  loadVoices();
  if (window.speechSynthesis.addEventListener) {
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
  }
}

function speakText(text, force) {
  if ((!audioEnabled && !force) || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  const voice = pickVoice();
  if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
  window.speechSynthesis.speak(utterance);
}

function speakFullSentence() {
  speakText(targetWords.join(" "));
}

// ------------------------------------------------------------------
// Sentence set-up
// ------------------------------------------------------------------
function nextRandomSentence() {
  if (sentencePool.length === 1) {
    currentIndex = 0;
  } else {
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * sentencePool.length);
    } while (nextIdx === currentIndex);
    currentIndex = nextIdx;
  }
  setupSentence(sentencePool[currentIndex]);
}

function setupSentence(sentence) {
  if (activeDrag) finalizeDrag(null);
  step1Complete = false;
  activeDrag = null;
  targetWords = sentence.trim().split(/\s+/);

  const bank = $("word-bank");
  const slotsArea = $("slots-area");
  const feedback = $("feedback-msg");
  const typingSection = $("typing-section");
  const typingInput = $("typing-input");
  const typingFeedback = $("typing-feedback");
  const hearBtn = $("hear-sentence-btn");

  bank.innerHTML = "";
  slotsArea.innerHTML = "";
  feedback.className = "feedback-msg";
  feedback.textContent = "";
  typingSection.classList.remove("unlocked");
  typingInput.value = "";
  typingInput.classList.remove("done");
  typingFeedback.className = "feedback-msg";
  typingFeedback.textContent = "";
  hearBtn.style.display = "none";

  let scrambled = [...targetWords];
  if (scrambled.length > 1) {
    let attempts = 0;
    while (scrambled.join(" ") === targetWords.join(" ") && attempts < 10) {
      scrambled.sort(() => Math.random() - 0.5);
      attempts++;
    }
  }

  scrambled.forEach((word, idx) => bank.appendChild(createWordTile(word, idx)));

  targetWords.forEach((_, idx) => {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.slotIndex = idx;
    slotsArea.appendChild(slot);
  });
}

function createWordTile(word, id) {
  const tile = document.createElement("div");
  tile.className = "word-tile";
  tile.textContent = word;
  tile.dataset.word = word;
  tile.dataset.tileId = id;
  tile.tabIndex = 0;
  tile.setAttribute("role", "button");

  tile.addEventListener("touchstart", onStartDrag, { passive: false });
  tile.addEventListener("mousedown", onStartDrag);
  tile.addEventListener("keydown", onTileKey);

  return tile;
}

// ------------------------------------------------------------------
// Moving tiles: drag, tap, or keyboard
// ------------------------------------------------------------------
function returnToBank(tile) {
  tile.classList.remove("correct");
  $("word-bank").appendChild(tile);
}

// Tap / Enter / Space: bank -> first empty line, line -> bank
function tapPlace(tile, currentParent) {
  const bank = $("word-bank");
  if (currentParent === bank) {
    const emptySlot = Array.from(document.querySelectorAll(".slot")).find(
      s => !s.querySelector(".word-tile")
    );
    if (emptySlot) {
      emptySlot.appendChild(tile);
    } else {
      bank.appendChild(tile);
    }
  } else {
    returnToBank(tile);
  }
}

function onTileKey(e) {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  const tile = e.currentTarget;
  if (tile.classList.contains("correct") && step1Complete) return;
  speakText(tile.dataset.word);
  tile.classList.remove("try-again");
  tapPlace(tile, tile.parentNode);
  tile.focus();
}

function getClientXY(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  if (e.changedTouches && e.changedTouches.length > 0) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

function onStartDrag(e) {
  const tile = e.currentTarget;
  if (tile.classList.contains("correct") && step1Complete) return;
  if (activeDrag) finalizeDrag(null);

  e.preventDefault();
  speakText(tile.dataset.word);
  tile.classList.remove("try-again");

  const { x, y } = getClientXY(e);
  const rect = tile.getBoundingClientRect();

  const placeholder = document.createElement("div");
  placeholder.style.width = rect.width + "px";
  placeholder.style.height = rect.height + "px";
  placeholder.style.visibility = "hidden";
  tile.parentNode.insertBefore(placeholder, tile);

  tile.style.width = rect.width + "px";
  tile.style.height = rect.height + "px";
  tile.classList.add("dragging");
  tile.style.left = rect.left + "px";
  tile.style.top = rect.top + "px";

  activeDrag = {
    tile,
    placeholder,
    startX: x,
    startY: y,
    offsetX: x - rect.left,
    offsetY: y - rect.top,
    moved: false
  };
}

function onMoveDrag(e) {
  if (!activeDrag) return;
  e.preventDefault();

  const { x, y } = getClientXY(e);
  const dx = Math.abs(x - activeDrag.startX);
  const dy = Math.abs(y - activeDrag.startY);
  if (dx > 6 || dy > 6) {
    activeDrag.moved = true;
  }

  activeDrag.tile.style.left = (x - activeDrag.offsetX) + "px";
  activeDrag.tile.style.top = (y - activeDrag.offsetY) + "px";

  // Highlight nearest slot using the centre of the dragged tile
  document.querySelectorAll(".slot").forEach(s => s.classList.remove("highlight"));
  const tileRect = activeDrag.tile.getBoundingClientRect();
  const hoveredSlot = getNearestSlot(
    tileRect.left + tileRect.width / 2,
    tileRect.top + tileRect.height / 2
  );
  if (hoveredSlot) hoveredSlot.classList.add("highlight");
}

function onEndDrag(e) {
  if (!activeDrag) return;
  e.preventDefault();
  finalizeDrag(e);
}

function finalizeDrag(e) {
  if (!activeDrag) return;
  const { tile, placeholder, moved } = activeDrag;
  activeDrag = null;

  document.querySelectorAll(".slot").forEach(s => s.classList.remove("highlight"));

  const tileRect = tile.getBoundingClientRect();
  const centerX = tileRect.left + tileRect.width / 2;
  const centerY = tileRect.top + tileRect.height / 2;

  // Reset inline dragging styles BEFORE appending to container
  tile.classList.remove("dragging");
  tile.style.position = "";
  tile.style.left = "";
  tile.style.top = "";
  tile.style.width = "";
  tile.style.height = "";

  const currentParent = placeholder.parentNode;

  if (!moved) {
    tapPlace(tile, currentParent);
  } else {
    // Find nearest slot based on tile centre (generous magnetic snap)
    const targetSlot = getNearestSlot(centerX, centerY);
    if (targetSlot) {
      const existingTile = targetSlot.querySelector(".word-tile");
      if (existingTile && existingTile !== tile) {
        if (!existingTile.classList.contains("correct")) {
          returnToBank(existingTile);
          targetSlot.appendChild(tile);
        } else {
          returnToBank(tile);
        }
      } else {
        targetSlot.appendChild(tile);
      }
    } else {
      // Dropped outside the slots area -> snap back to the word bank
      returnToBank(tile);
    }
  }

  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.removeChild(placeholder);
  }
}

// Global listeners: releasing a finger anywhere on screen always snaps cleanly
window.addEventListener("touchmove", onMoveDrag, { passive: false });
window.addEventListener("mousemove", onMoveDrag);
window.addEventListener("touchend", onEndDrag, { passive: false });
window.addEventListener("touchcancel", onEndDrag, { passive: false });
window.addEventListener("mouseup", onEndDrag);

function getNearestSlot(centerX, centerY) {
  const areaRect = $("slots-area").getBoundingClientRect();

  // Generous check: anywhere inside or within 35px of the slots container
  if (
    centerX < areaRect.left - 35 ||
    centerX > areaRect.right + 35 ||
    centerY < areaRect.top - 35 ||
    centerY > areaRect.bottom + 35
  ) {
    return null;
  }

  let closestSlot = null;
  let minDistance = Infinity;

  document.querySelectorAll(".slot").forEach(slot => {
    const rect = slot.getBoundingClientRect();
    const dist = Math.hypot(
      centerX - (rect.left + rect.width / 2),
      centerY - (rect.top + rect.height / 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestSlot = slot;
    }
  });

  return minDistance < 140 ? closestSlot : null;
}

// ------------------------------------------------------------------
// Checking
// ------------------------------------------------------------------
function checkWordOrder() {
  const slots = document.querySelectorAll(".slot");
  const bank = $("word-bank");
  const feedback = $("feedback-msg");

  let placedCount = 0;
  let correctCount = 0;

  slots.forEach((slot, idx) => {
    const tile = slot.querySelector(".word-tile");
    if (tile) {
      placedCount++;
      if (tile.dataset.word === targetWords[idx]) {
        tile.classList.remove("try-again");
        tile.classList.add("correct");
        correctCount++;
      } else {
        tile.classList.remove("correct");
        tile.classList.add("try-again");
        setTimeout(() => {
          bank.appendChild(tile);
        }, 650);
      }
    }
  });

  if (placedCount < targetWords.length) {
    feedback.textContent = "Fill all the lines first, then tap Check sentence!";
    feedback.className = "feedback-msg info show";
    return;
  }

  if (correctCount === targetWords.length) {
    step1Complete = true;
    feedback.textContent = "You built the sentence!";
    feedback.className = "feedback-msg celebrate show";
    $("hear-sentence-btn").style.display = "inline-flex";
    launchBurst();
    speakFullSentence();

    $("typing-section").classList.add("unlocked");
    setTimeout(() => {
      $("typing-input").focus();
    }, 400);
  } else {
    feedback.textContent = "Good try! Ticked words are in the right place. Try the yellow words again.";
    feedback.className = "feedback-msg info show";
  }
}

// iPads can swap straight quotes and apostrophes for curly ones; treat them as the same
function normaliseText(s) {
  return s
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function checkTypedSentence() {
  const input = $("typing-input");
  const feedback = $("typing-feedback");

  const studentText = normaliseText(input.value);
  const targetText = normaliseText(targetWords.join(" "));

  if (!studentText) {
    feedback.textContent = "Type the sentence in the box first.";
    feedback.className = "feedback-msg info show";
    return;
  }

  if (studentText === targetText) {
    input.classList.add("done");
    feedback.textContent = "Fantastic typing! Every word and punctuation mark matches!";
    feedback.className = "feedback-msg celebrate show";
    launchBurst();
    speakText("Fantastic typing! " + targetWords.join(" "));
  } else {
    const strip = t => t.toLowerCase().replace(/[.,!?;:"']/g, "");
    if (strip(studentText) === strip(targetText)) {
      feedback.textContent = "Almost there! Check your capital letters and punctuation.";
    } else {
      feedback.textContent = "Keep going! Look closely at the ticked words above and check your spelling.";
    }
    feedback.className = "feedback-msg info show";
  }
}

function launchBurst() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colours = ["#059FAA", "#FBB525", "#08366C"];
  for (let i = 0; i < 18; i++) {
    const dot = document.createElement("div");
    const size = 10 + Math.random() * 14;
    dot.className = "dot-burst";
    dot.style.width = size + "px";
    dot.style.height = size + "px";
    dot.style.background = colours[i % colours.length];
    dot.style.left = (15 + Math.random() * 70) + "vw";
    dot.style.top = (45 + Math.random() * 30) + "vh";
    dot.style.animationDelay = (Math.random() * 0.25) + "s";
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 1500);
  }
}
