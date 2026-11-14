
let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let cards = JSON.parse(localStorage.getItem("cards") || "[]");
let quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");

let currentCard = 0;
let flipped = false;
let quizIndex = 0;
let score = 0;
let seconds = 1500;
let timer = null;

function saveData() {
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("cards", JSON.stringify(cards));
  localStorage.setItem("quizzes", JSON.stringify(quizzes));
}

function stats() {
  document.getElementById("noteCount").textContent = notes.length;
  document.getElementById("cardCount").textContent = cards.length;
  document.getElementById("quizCount").textContent = quizzes.length;
}

// NOTES

function saveNote() {
  const title = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteContent").value.trim();
  const subject = document.getElementById("subject").value.trim();

  if (!title || !content) {
    alert("Enter a title and your notes!");
    return;
  }

  notes.unshift({title, content, subject});
  saveData();
  renderNotes();

  document.getElementById("noteTitle").value = "";
  document.getElementById("noteContent").value = "";
  document.getElementById("subject").value = "";
}

function renderNotes() {
  const list = document.getElementById("notesList");
  const search = document.getElementById("search").value.toLowerCase();

  list.replaceChildren();

  notes.forEach((n, i) => {
    if (!(n.title + n.subject + n.content).toLowerCase().includes(search)) return;

    const box = document.createElement("div");
    box.className = "note";

    const title = document.createElement("h3");
    title.textContent = n.title;

    const subject = document.createElement("p");
    subject.textContent = n.subject;

    const content = document.createElement("p");
    content.textContent = n.content;

    const study = document.createElement("button");
    study.textContent = "Study with AI";
    study.onclick = () => {
      document.getElementById("aiInput").value = n.content;
      document.getElementById("ai").scrollIntoView();
    };

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.onclick = () => {
      notes.splice(i, 1);
      saveData();
      renderNotes();
    };

    box.append(title, subject, content, study, del);
    list.append(box);
  });

  stats();
}

// NOTE SUMMARIZER

function summarize() {
  const text = document.getElementById("aiInput").value.trim();
  const mode = document.getElementById("aiMode").value;

  if (!text) {
    alert("Paste your notes first!");
    return;
  }

  const sentences = text.match(/[^.!?\n]+[.!?]?/g)
    ?.map(s => s.trim()).filter(Boolean) || [];

  let result = "";

  if (mode === "summary") {
    const count = Math.max(1, Math.ceil(sentences.length / 3));
    result = "📖 SUMMARY\n\n" + sentences.slice(0, count).join(". ");
  }

  if (mode === "keypoints") {
    result = "📌 IMPORTANT POINTS\n\n" +
      sentences.map((s, i) => `${i + 1}. ${s}`).join("\n\n");
  }

  if (mode === "simple") {
    result = "💡 NOTES IN SMALL PARTS\n\n" +
      sentences.map((s, i) => `${i + 1}. ${s}`).join("\n\n");
  }

  const output = document.getElementById("aiOutput");
  output.textContent = result;
  output.classList.remove("hidden");
}

// FLASHCARDS

function addCard() {
  const question = document.getElementById("question").value.trim();
  const answer = document.getElementById("answer").value.trim();

  if (!question || !answer) return alert("Enter both fields!");

  cards.push({question, answer});
  currentCard = cards.length - 1;
  flipped = false;

  document.getElementById("question").value = "";
  document.getElementById("answer").value = "";

  saveData();
  renderCards();
}

function renderCards() {
  const area = document.getElementById("flashArea");
  area.replaceChildren();

  if (!cards.length) {
    area.textContent = "No flashcards yet.";
    stats();
    return;
  }

  const c = cards[currentCard];
  const box = document.createElement("div");
  box.className = "note";

  const question = document.createElement("h3");
  question.textContent = flipped ? c.answer : c.question;

  const flip = document.createElement("button");
  flip.textContent = "Flip Card";
  flip.onclick = () => {
    flipped = !flipped;
    renderCards();
  };

  const next = document.createElement("button");
  next.textContent = "Next →";
  next.onclick = () => {
    currentCard = (currentCard + 1) % cards.length;
    flipped = false;
    renderCards();
  };

  box.append(question, flip, next);
  area.append(box);
  stats();
}

// QUIZ

function addQuiz() {
  const question = document.getElementById("quizQuestion").value.trim();

  const options = ["o1", "o2", "o3"].map(id =>
    document.getElementById(id).value.trim()
  );

  if (!question || options.some(x => !x)) {
    return alert("Complete all quiz fields!");
  }

  quizzes.push({
    question,
    options,
    correct: Number(document.getElementById("correct").value)
  });

  document.getElementById("quizQuestion").value = "";
  ["o1", "o2", "o3"].forEach(id => {
    document.getElementById(id).value = "";
  });

  saveData();
  stats();
  alert("Question added!");
}

function startQuiz() {
  if (!quizzes.length) return alert("Add quiz questions first!");

  quizIndex = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  const area = document.getElementById("quizArea");
  area.replaceChildren();

  if (quizIndex >= quizzes.length) {
    const result = document.createElement("h3");
    result.textContent = `🎉 Your score: ${score}/${quizzes.length}`;
    area.append(result);
    return;
  }

  const q = quizzes[quizIndex];

  const heading = document.createElement("h3");
  heading.textContent = q.question;
  area.append(heading);

  q.options.forEach((option, i) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.style.display = "block";

    btn.onclick = () => {
      if (i === q.correct) score++;
      else alert("Correct answer: " + q.options[q.correct]);

      quizIndex++;
      showQuestion();
    };

    area.append(btn);
  });
}

// TIMER

function updateClock() {
  document.getElementById("clock").textContent =
    String(Math.floor(seconds / 60)).padStart(2, "0") + ":" +
    String(seconds % 60).padStart(2, "0");
}

function startTimer() {
  if (timer) return;

  timer = setInterval(() => {
    if (seconds <= 0) {
      pauseTimer();
      alert("🎉 Study session completed!");
      return;
    }

    seconds--;
    updateClock();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  timer = null;
}

function resetTimer() {
  pauseTimer();
  seconds = 1500;
  updateClock();
}

// START

renderNotes();
renderCards();
stats();
updateClock();
