const questionText = document.getElementById("questionText");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const resultDiv = document.getElementById("result");
const playfield = document.getElementById("playfield");
const buttonHome = document.querySelector(".buttons-container");
const summaryModal = document.getElementById('summaryModal');
const summaryContent = document.getElementById('summaryContent');
const closeSummaryBtn = document.getElementById('closeSummaryBtn');

let answers = [];


const questions = QUESTION_CONFIG.questions;
let currentIndex = 0;

// ===== LOAD QUESTION =====
function loadQuestion() {
  const q = questions[currentIndex];
  questionText.textContent = q.text;
  yesBtn.textContent = q.btnYesText;
  noBtn.textContent = q.btnNoText;

  resultDiv.classList.add("hidden");
  yesBtn.disabled = false;
  noBtn.disabled = false;

  resetButtons();
  applyRunningLogic(q);
}

// ===== RESET =====
function resetButtons() {
  [yesBtn, noBtn].forEach((btn) => {
    btn.classList.remove("running");
    btn.style.left = "";
    btn.style.top = "";
    buttonHome.appendChild(btn);
  });
}

// ===== ANSWER =====
// function handleAnswer(isYes) {
//   const q = questions[currentIndex];
//   resultDiv.textContent = isYes ? q.yesResultText : q.noResultText;
//   answers.push({
//     question: questions[currentIndex].text,
//     answer: isYes ? q.yesResultText : q.noResultText,
//   });

//   resultDiv.classList.remove("hidden");
//   yesBtn.disabled = true;
//   noBtn.disabled = true;

//   setTimeout(() => {
//     currentIndex++;

//     if (currentIndex >= questions.length) {
//       showSummary();
//     } else {
//       loadQuestion();
//     }
//   }, 1200);
// }

function handleAnswer(isYes) {
    const q = questions[currentIndex];
    answers.push({
        question: questions[currentIndex].text,
        answer: isYes ? q.yesResultText : q.noResultText
    });

    resultDiv.textContent = isYes
        ? q.yesResultText
        : q.noResultText;

    resultDiv.classList.remove('hidden');
    yesBtn.disabled = true;
    noBtn.disabled = true;

    setTimeout(() => {
        currentIndex++;

        if (currentIndex >= questions.length) {
            showSummary();
        } else {
            loadQuestion();
        }
    }, 1200);
}


// ===== RUN LOGIC =====
function applyRunningLogic(question) {
  const yesRun = question.runningButtons.includes("yes");
  const noRun = question.runningButtons.includes("no");

  yesBtn.onclick = !yesRun ? () => handleAnswer(true) : null;
  noBtn.onclick = !noRun ? () => handleAnswer(false) : null;

  document.onmousemove = (e) => {
    if (yesRun) handleRun(e, yesBtn);
    if (noRun) handleRun(e, noBtn);
  };
}

// ===== HANDLE RUN =====
function handleRun(e, btn) {
  if (btn.disabled) return;

  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

  if (dist < QUESTION_CONFIG.buttonBehavior.triggerDistance) {
    if (!btn.classList.contains("running")) {
      btn.classList.add("running");

      /* 🔒 KHÓA SIZE */
      btn.style.width = rect.width + "px";
      btn.style.height = rect.height + "px";

      playfield.appendChild(btn);
      btn.style.left = rect.left + "px";
      btn.style.top = rect.top + "px";
    }
    moveButton(btn);
  }
}

// ===== MOVE FULL VIEWPORT =====
function moveButton(btn) {
  const SAFE = 24;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const rect = btn.getBoundingClientRect();

  const x = Math.random() * (vw - rect.width - SAFE * 2) + SAFE;
  const y = Math.random() * (vh - rect.height - SAFE * 2) + SAFE;

  btn.style.left = x + "px";
  btn.style.top = y + "px";
}

// ===== INITIALIZE =====
function showSummary() {
    document.onmousemove = null;

    summaryContent.innerHTML = answers
        .map((a, i) =>
            `❓ <b>${i + 1}.</b> ${a.question}<br>👉 ${a.answer}`
        )
        .join('<br><br>');

    summaryModal.classList.remove('hidden');
}


loadQuestion();
closeSummaryBtn.onclick = () => {
    summaryModal.classList.add('hidden');

    // reset state
    currentIndex = 0;
    answers = [];

    yesBtn.style.display = '';
    noBtn.style.display  = '';
    resultDiv.classList.add('hidden');

    loadQuestion();
};
