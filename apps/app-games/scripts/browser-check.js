// Run in agent-browser: Get-Content -Raw scripts/browser-check.js | agent-browser eval --stdin
(async () => {
  const checks = [];
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  async function until(predicate, message) {
    for (let i = 0; i < 100; i++) {
      if (predicate()) return;
      await wait(100);
    }
    throw new Error(message);
  }
  async function click(text) {
    const button = [...document.querySelectorAll("button")].find(
      (el) => el.textContent.trim() === text && !el.disabled,
    );
    assert(button, `Button unavailable: ${text}`);
    button.click();
    await wait(80);
  }
  async function navigate(path) {
    if (location.pathname === path) return;
    const link = document.querySelector(`a[href="${path}"]`);
    assert(link, `Link unavailable: ${path}`);
    link.click();
    await until(() => location.pathname === path, `Navigation failed: ${path}`);
    await wait(200);
  }
  async function openGame(id) {
    await navigate("/games");
    await until(() => document.querySelector(`a[href="/games/${id}"]`), "Catalog missing");
    await navigate(`/games/${id}`);
    await until(() => document.querySelector(".playground"), `Game failed to load: ${id}`);
  }
  async function next() {
    await click("Próxima descoberta");
  }
  async function finish(id) {
    await click("Concluir aventura");
    assert(document.querySelector(".completion-screen"), `Completion missing: ${id}`);
    checks.push(`${id}: completed`);
  }
  const before = JSON.parse(localStorage.getItem("fulltime-brincar-v1") || '{"sessions":[]}').sessions.length;
  await openGame("quiz-emojis");
  await click("GATO");
  assert(document.querySelector(".feedback").textContent.includes("tentar de novo"), "Wrong-answer feedback missing");
  assert(!document.querySelector(".completion-screen"), "Wrong answer completed game");
  await click("Fazer uma pausa");
  assert(document.querySelector('[role="dialog"]'), "Pause dialog missing");
  await click("Continuar a aventura");
  await click("Quero uma dica");
  assert(document.querySelector(".hint-box"), "Hint missing");
  await click("LEÃO"); await next(); await click("MAÇÃ"); await next(); await click("BICICLETA");
  await finish("quiz-emojis");

  await openGame("caca-letras");
  for (const target of ["A", "E", "O"]) {
    for (const button of [...document.querySelectorAll(".letter-tile")].filter(el => el.textContent.trim() === target)) {
      button.click(); await wait(80);
    }
    if (target !== "O") await next();
  }
  await finish("caca-letras");

  await openGame("junta-silabas");
  for (const [index, syllables] of [["BO", "LA"], ["GA", "TO"], ["CA", "SA"]].entries()) {
    for (const syllable of syllables) await click(syllable);
    if (index !== 2) await next();
  }
  await finish("junta-silabas");

  await openGame("caca-palavras");
  for (const [index, positions] of [[0, 1, 2], [5, 6, 7, 8], [10, 11, 12]].entries()) {
    for (const position of positions) { document.querySelectorAll(".word-grid button")[position].click(); await wait(80); }
    await click("Conferir");
    if (index !== 2) await next();
  }
  await finish("caca-palavras");

  await openGame("desenhe-a-letra");
  for (const [index, letter] of ["A", "L", "E"].entries()) {
    await click("Prefiro uma atividade por teclado");
    await click(letter);
    if (index !== 2) await next();
  }
  await finish("desenhe-a-letra (keyboard alternative)");

  await openGame("memoria");
  const cards = () => document.querySelectorAll(".memory-grid button");
  cards()[0].click(); await wait(80); cards()[1].click(); await wait(80);
  assert(document.querySelector(".feedback").textContent.includes("tentar de novo"), "Memory mismatch feedback missing");
  await click("Virar as cartas e tentar outro par");
  for (const pair of [[0, 5], [1, 3], [2, 4]]) {
    for (const index of pair) { cards()[index].click(); await wait(80); }
  }
  await finish("memoria");

  await openGame("numeros");
  await click("3"); await next(); await click("4"); await next(); await click("2");
  await finish("numeros");

  await openGame("cores");
  await click("VERMELHO"); await next(); await click("AZUL"); await next(); await click("VERDE");
  await finish("cores");

  const stored = JSON.parse(localStorage.getItem("fulltime-brincar-v1"));
  assert(stored.sessions.length === before + 8, "Expected exactly one saved session per completion");
  assert(stored.sessions.slice(-8).every(session => session.stars === 3), "Star rewards incorrect");
  await navigate("/conquistas");
  assert(document.querySelectorAll(".achievement-card.earned").length === 8, "Achievements missing");
  checks.push("wrong answers, pause, hints, memory retry, localStorage, rewards and achievements: passed");
  return JSON.stringify({ passed: checks, sessions: stored.sessions.length, stars: stored.sessions.length * 3 });
})()
