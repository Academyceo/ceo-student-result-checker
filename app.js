const DEMO_RESULTS = [
  { id: "CEO/2026/001", name: "Amara Johnson", className: "Grade 10", subjects: { Mathematics: 92, English: 88, Science: 95, History: 84, "Computer Studies": 97 } },
  { id: "CEO/2026/002", name: "Daniel Okafor", className: "Grade 10", subjects: { Mathematics: 78, English: 85, Science: 81, History: 76, "Computer Studies": 90 } },
  { id: "CEO/2026/003", name: "Zara Williams", className: "Grade 9", subjects: { Mathematics: 96, English: 91, Science: 89, History: 94, "Computer Studies": 93 } },
  { id: "CEO/2026/004", name: "Noah Mensah", className: "Grade 9", subjects: { Mathematics: 67, English: 74, Science: 72, History: 69, "Computer Studies": 80 } },
  { id: "CEO/2026/005", name: "Maya Chen", className: "Grade 11", subjects: { Mathematics: 87, English: 93, Science: 91, History: 88, "Computer Studies": 96 } },
  { id: "CEO/2026/006", name: "Ethan Patel", className: "Grade 11", subjects: { Mathematics: 73, English: 79, Science: 77, History: 82, "Computer Studies": 75 } },
  { id: "CEO/2026/007", name: "Aisha Bello", className: "Grade 8", subjects: { Mathematics: 90, English: 86, Science: 92, History: 89, "Computer Studies": 85 } },
];

const STORAGE_KEY = "ceo-student-result-checker-results";
const TEACHER_EMAIL = "teacher@ceo.edu";
const TEACHER_PASSWORD = "ceo123";
const subjects = ["Mathematics", "English", "Science", "History", "Computer Studies"];
const lookupForm = document.querySelector("#lookup-form");
const lookupMessage = document.querySelector("#lookup-message");
const resultContainer = document.querySelector("#result-container");
const teacherContent = document.querySelector("#teacher-content");

function loadResults() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [...DEMO_RESULTS];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Saved results have an invalid format.");
    return parsed;
  } catch (error) {
    console.error("Could not load saved student results.", error);
    lookupMessage.textContent = "Saved results could not be loaded. Clear this site's browser storage and refresh to restore the demo data.";
    lookupMessage.className = "message error";
    return [...DEMO_RESULTS];
  }
}

let results = loadResults();
let isTeacherLoggedIn = false;

function saveResults() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    return true;
  } catch (error) {
    console.error("Could not save student results.", error);
    return false;
  }
}

function gradeFor(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function getAverage(student) {
  const scores = Object.values(student.subjects);
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function renderResult(student) {
  const average = getAverage(student);
  const term = student.term || "End of Term";
  const rows = Object.entries(student.subjects)
    .map(([subject, score]) => `<div class="subject-row"><span>${escapeHtml(subject)}</span><span>${score}<span class="grade-pill">${gradeFor(score)}</span></span></div>`)
    .join("");

  resultContainer.innerHTML = `
    <article class="result-card">
      <div class="result-topline">
        <div><h3>${escapeHtml(student.name)}</h3><span class="result-id">${escapeHtml(student.id)} · ${escapeHtml(student.className)}</span></div>
        <span class="term-label">${escapeHtml(term.toUpperCase())}<br>RESULT</span>
      </div>
      <div class="result-summary">
        <div class="summary-item"><span>Average score</span><strong>${average.toFixed(1)}%</strong></div>
        <div class="summary-item"><span>Overall grade</span><strong>${gradeFor(average)}</strong></div>
        <div class="summary-item"><span>Subjects</span><strong>${Object.keys(student.subjects).length}</strong></div>
      </div>
      <div class="subject-list">${rows}</div>
      <p class="result-note">Keep up the great work. Contact your teacher if you have questions about your results.</p>
    </article>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function lookupStudent(studentId) {
  const student = results.find((record) => record.id.toLowerCase() === studentId.trim().toLowerCase());
  if (!student) {
    resultContainer.innerHTML = "";
    lookupMessage.textContent = "We couldn't find a result for that student ID. Please check it and try again.";
    lookupMessage.className = "message error";
    return;
  }
  lookupMessage.textContent = "";
  lookupMessage.className = "message";
  renderResult(student);
  resultContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderDemoStudents() {
  const demoStudents = document.querySelector("#demo-students");
  const demoResults = results.filter((student) => DEMO_RESULTS.some((demo) => demo.id === student.id));
  demoStudents.innerHTML = demoResults.map((student) => `
    <article class="student-card">
      <div class="student-card-copy"><strong>${escapeHtml(student.name)}</strong><small>${escapeHtml(student.id)} · ${escapeHtml(student.className)}</small></div>
      <button type="button" data-student-id="${escapeHtml(student.id)}" aria-label="View ${escapeHtml(student.name)}'s result">→</button>
    </article>`).join("");
  document.querySelector("#demo-count").textContent = demoResults.length;
}

lookupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  lookupStudent(new FormData(lookupForm).get("studentId").toString());
});

document.querySelector("#demo-students").addEventListener("click", (event) => {
  const button = event.target.closest("[data-student-id]");
  if (!button) return;
  document.querySelector("#student-id").value = button.dataset.studentId;
  lookupStudent(button.dataset.studentId);
});

function renderTeacherLogin() {
  teacherContent.innerHTML = `
    <div class="teacher-login-layout">
      <form class="teacher-login-form" id="teacher-login-form">
        <label>Email address<input name="email" type="email" autocomplete="username" placeholder="teacher@ceo.edu" required></label>
        <label>Password<input name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required></label>
        <p class="message" id="teacher-message" role="status" aria-live="polite"></p>
        <button class="button button-gold" type="submit">Sign in <span aria-hidden="true">→</span></button>
      </form>
      <aside class="login-demo">
        <span class="login-demo-label">DEMO TEACHER LOGIN</span>
        <p>Email: <strong>${TEACHER_EMAIL}</strong><br>Password: <strong>${TEACHER_PASSWORD}</strong></p>
        <p>This demo stores results in this browser only. It is not a secure authentication system.</p>
      </aside>
    </div>`;

  document.querySelector("#teacher-login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = document.querySelector("#teacher-message");
    if (form.get("email").toString().trim().toLowerCase() !== TEACHER_EMAIL || form.get("password") !== TEACHER_PASSWORD) {
      message.textContent = "Incorrect email or password. Use the demo credentials shown here.";
      message.className = "message error";
      return;
    }
    isTeacherLoggedIn = true;
    renderTeacherDashboard();
  });
}

function renderTeacherDashboard() {
  teacherContent.innerHTML = `
    <div class="teacher-dashboard">
      <p class="teacher-welcome">Signed in to the demo teacher account. Add a student result below; changes are saved in this browser.</p>
      <div class="teacher-actions"><p>${results.length} student records</p><button class="button-outline" id="teacher-logout" type="button">Sign out</button></div>
      <form class="result-form" id="add-result-form">
        <label>Student full name<input name="name" type="text" maxlength="80" placeholder="Full name" required></label>
        <label>Student ID<input name="id" type="text" maxlength="40" placeholder="e.g. CEO/2026/008" required></label>
        <label>Class / grade<input name="className" type="text" maxlength="40" placeholder="e.g. Grade 8" required></label>
        <label>Academic term<select name="term"><option>End of Term</option><option>Mid Term</option><option>Annual</option></select></label>
        <div class="subject-fields">${subjects.map((subject) => `<label>${subject} score<input name="${escapeHtml(subject)}" type="number" min="0" max="100" step="1" placeholder="0–100" required></label>`).join("")}</div>
        <p class="message" id="add-result-message" role="status" aria-live="polite"></p>
        <button class="button button-gold" type="submit">Add student result <span aria-hidden="true">→</span></button>
      </form>
      <div class="teacher-table-wrap">${renderTeacherTable()}</div>
    </div>`;

  document.querySelector("#teacher-logout").addEventListener("click", () => {
    isTeacherLoggedIn = false;
    renderTeacherLogin();
  });
  document.querySelector("#add-result-form").addEventListener("submit", addStudentResult);
}

function renderTeacherTable() {
  const rows = results.map((student) => `
    <tr><td>${escapeHtml(student.name)}</td><td>${escapeHtml(student.id)}</td><td>${escapeHtml(student.className)}</td><td>${escapeHtml(student.term || "End of Term")}</td><td>${getAverage(student).toFixed(1)}%</td><td>${gradeFor(getAverage(student))}</td></tr>`).join("");
  return `<table class="teacher-table"><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>CLASS</th><th>TERM</th><th>AVERAGE</th><th>GRADE</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function addStudentResult(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const message = document.querySelector("#add-result-message");
  const id = data.get("id").toString().trim();
  if (results.some((student) => student.id.toLowerCase() === id.toLowerCase())) {
    message.textContent = "That student ID is already in use. Enter a unique ID.";
    message.className = "message error";
    return;
  }

  const student = {
    id,
    name: data.get("name").toString().trim(),
    className: data.get("className").toString().trim(),
    term: data.get("term").toString(),
    subjects: Object.fromEntries(subjects.map((subject) => [subject, Number(data.get(subject))])),
  };
  if (!student.name || !id || !student.className || Object.values(student.subjects).some((score) => !Number.isInteger(score) || score < 0 || score > 100)) {
    message.textContent = "Enter a name and class, and whole-number scores from 0 to 100 for every subject.";
    message.className = "message error";
    return;
  }

  results.push(student);
  if (!saveResults()) {
    results.pop();
    message.textContent = "The result could not be saved. Check browser storage settings and try again.";
    message.className = "message error";
    return;
  }
  renderDemoStudents();
  renderTeacherDashboard();
  lookupMessage.textContent = `${student.name}'s result has been added. Search for ${student.id} to view it.`;
  lookupMessage.className = "message success";
}

document.querySelector("#current-year").textContent = new Date().getFullYear();
renderDemoStudents();
if (isTeacherLoggedIn) renderTeacherDashboard();
else renderTeacherLogin();
