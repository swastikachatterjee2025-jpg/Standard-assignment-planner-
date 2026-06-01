const storageKey = "smartAssignmentPlanner.assignments";
const themeKey = "smartAssignmentPlanner.theme";
const priorityRank = { high: 1, medium: 2, low: 3 };

const sampleAssignments = [
  {
    id: crypto.randomUUID(),
    subject: "Data Science",
    title: "Model Evaluation Report",
    description: "Compare model metrics and add a short reflection on bias and validation.",
    dueDate: getDateOffset(2),
    dueTime: "18:00",
    priority: "high",
    completed: false,
    reminded: false,
  },
  {
    id: crypto.randomUUID(),
    subject: "Marketing",
    title: "Consumer Behavior Slides",
    description: "Prepare a concise deck with examples from campus interviews.",
    dueDate: getDateOffset(5),
    dueTime: "12:30",
    priority: "medium",
    completed: false,
    reminded: false,
  },
  {
    id: crypto.randomUUID(),
    subject: "Literature",
    title: "Poetry Response Journal",
    description: "Write a 900-word response with two quoted passages.",
    dueDate: getDateOffset(9),
    dueTime: "21:00",
    priority: "low",
    completed: true,
    reminded: false,
  },
];

let assignments = loadAssignments();
let currentMonth = new Date();
let priorityAscending = true;

const elements = {
  loader: document.getElementById("loader"),
  themeToggle: document.getElementById("themeToggle"),
  menuToggle: document.getElementById("menuToggle"),
  closeSidebar: document.getElementById("closeSidebar"),
  sidebar: document.getElementById("sidebar"),
  backdrop: document.getElementById("backdrop"),
  form: document.getElementById("assignmentForm"),
  formTitle: document.getElementById("formTitle"),
  assignmentId: document.getElementById("assignmentId"),
  subjectInput: document.getElementById("subjectInput"),
  titleInput: document.getElementById("titleInput"),
  descriptionInput: document.getElementById("descriptionInput"),
  dateInput: document.getElementById("dateInput"),
  timeInput: document.getElementById("timeInput"),
  priorityInput: document.getElementById("priorityInput"),
  resetForm: document.getElementById("resetForm"),
  assignmentList: document.getElementById("assignmentList"),
  searchInput: document.getElementById("searchInput"),
  subjectFilter: document.getElementById("subjectFilter"),
  priorityFilter: document.getElementById("priorityFilter"),
  statusFilter: document.getElementById("statusFilter"),
  sortPriority: document.getElementById("sortPriority"),
  totalCount: document.getElementById("totalCount"),
  completedCount: document.getElementById("completedCount"),
  pendingCount: document.getElementById("pendingCount"),
  productivityCount: document.getElementById("productivityCount"),
  progressBar: document.getElementById("progressBar"),
  progressMessage: document.getElementById("progressMessage"),
  calendarTitle: document.getElementById("calendarTitle"),
  calendarGrid: document.getElementById("calendarGrid"),
  prevMonth: document.getElementById("prevMonth"),
  nextMonth: document.getElementById("nextMonth"),
  quoteText: document.getElementById("quoteText"),
  newQuote: document.getElementById("newQuote"),
  fab: document.getElementById("fab"),
  toast: document.getElementById("toast"),
  confettiCanvas: document.getElementById("confettiCanvas"),
};

const quotes = [
  "Small progress every day adds up to big results.",
  "You do not need more hours. You need clearer priorities.",
  "Future you is built by the next focused study block.",
  "Start before it feels perfect. Momentum edits the plan.",
  "A calm planner makes a louder deadline easier to handle.",
];

document.addEventListener("DOMContentLoaded", init);

function init() {
  applyStoredTheme();
  setMinimumDate();
  bindEvents();
  renderAll();
  revealOnScroll();
  typeTagline();
  showDueReminders();

  setTimeout(() => elements.loader.classList.add("hidden"), 650);
  setInterval(() => renderAssignmentList(), 60_000);
  setInterval(showDueReminders, 120_000);
}

function bindEvents() {
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.menuToggle.addEventListener("click", openSidebar);
  elements.closeSidebar.addEventListener("click", closeSidebar);
  elements.backdrop.addEventListener("click", closeSidebar);
  elements.sidebar.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeSidebar));
  elements.form.addEventListener("submit", handleFormSubmit);
  elements.resetForm.addEventListener("click", resetForm);
  elements.searchInput.addEventListener("input", renderAssignmentList);
  elements.subjectFilter.addEventListener("change", renderAssignmentList);
  elements.priorityFilter.addEventListener("change", renderAssignmentList);
  elements.statusFilter.addEventListener("change", renderAssignmentList);
  elements.sortPriority.addEventListener("click", sortAssignmentsByPriority);
  elements.prevMonth.addEventListener("click", () => changeMonth(-1));
  elements.nextMonth.addEventListener("click", () => changeMonth(1));
  elements.newQuote.addEventListener("click", showRandomQuote);
  elements.fab.addEventListener("click", () => {
    document.getElementById("assignments").scrollIntoView({ behavior: "smooth" });
    elements.titleInput.focus({ preventScroll: true });
  });
}

function loadAssignments() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    localStorage.setItem(storageKey, JSON.stringify(sampleAssignments));
    return sampleAssignments;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveAssignments() {
  localStorage.setItem(storageKey, JSON.stringify(assignments));
}

function handleFormSubmit(event) {
  event.preventDefault();

  const assignment = {
    id: elements.assignmentId.value || crypto.randomUUID(),
    subject: elements.subjectInput.value.trim(),
    title: elements.titleInput.value.trim(),
    description: elements.descriptionInput.value.trim(),
    dueDate: elements.dateInput.value,
    dueTime: elements.timeInput.value,
    priority: elements.priorityInput.value,
    completed: false,
    reminded: false,
  };

  const existingIndex = assignments.findIndex((item) => item.id === assignment.id);
  if (existingIndex >= 0) {
    assignment.completed = assignments[existingIndex].completed;
    assignment.reminded = assignments[existingIndex].reminded;
    assignments[existingIndex] = assignment;
    showToast("Assignment updated.");
  } else {
    assignments.unshift(assignment);
    showToast("Assignment added to your planner.");
  }

  saveAssignments();
  resetForm();
  renderAll();
}

function resetForm() {
  elements.form.reset();
  elements.assignmentId.value = "";
  elements.formTitle.textContent = "Add Assignment";
  setMinimumDate();
}

function editAssignment(id) {
  const assignment = assignments.find((item) => item.id === id);
  if (!assignment) return;

  elements.assignmentId.value = assignment.id;
  elements.subjectInput.value = assignment.subject;
  elements.titleInput.value = assignment.title;
  elements.descriptionInput.value = assignment.description;
  elements.dateInput.value = assignment.dueDate;
  elements.timeInput.value = assignment.dueTime;
  elements.priorityInput.value = assignment.priority;
  elements.formTitle.textContent = "Edit Assignment";
  document.getElementById("assignments").scrollIntoView({ behavior: "smooth" });
}

function deleteAssignment(id) {
  assignments = assignments.filter((item) => item.id !== id);
  saveAssignments();
  renderAll();
  showToast("Assignment deleted.");
}

function toggleCompleted(id) {
  const assignment = assignments.find((item) => item.id === id);
  if (!assignment) return;

  assignment.completed = !assignment.completed;
  saveAssignments();
  renderAll();

  if (assignment.completed) {
    showToast("Task completed. Nice work.");
    launchConfetti();
  } else {
    showToast("Task moved back to pending.");
  }
}

function sortAssignmentsByPriority() {
  assignments.sort((a, b) => {
    const direction = priorityAscending ? 1 : -1;
    return (priorityRank[a.priority] - priorityRank[b.priority]) * direction;
  });
  priorityAscending = !priorityAscending;
  saveAssignments();
  renderAssignmentList();
}

function getFilteredAssignments() {
  const search = elements.searchInput.value.toLowerCase().trim();
  const subject = elements.subjectFilter.value;
  const priority = elements.priorityFilter.value;
  const status = elements.statusFilter.value;

  return assignments.filter((assignment) => {
    const text = `${assignment.subject} ${assignment.title} ${assignment.description}`.toLowerCase();
    const matchesSearch = text.includes(search);
    const matchesSubject = subject === "all" || assignment.subject === subject;
    const matchesPriority = priority === "all" || assignment.priority === priority;
    const matchesStatus =
      status === "all" ||
      (status === "completed" && assignment.completed) ||
      (status === "pending" && !assignment.completed);
    return matchesSearch && matchesSubject && matchesPriority && matchesStatus;
  });
}

function renderAll() {
  renderDashboard();
  renderSubjectFilter();
  renderAssignmentList();
  renderCalendar();
}

function renderDashboard() {
  const total = assignments.length;
  const completed = assignments.filter((item) => item.completed).length;
  const pending = total - completed;
  const productivity = total ? Math.round((completed / total) * 100) : 0;

  elements.totalCount.textContent = total;
  elements.completedCount.textContent = completed;
  elements.pendingCount.textContent = pending;
  elements.productivityCount.textContent = `${productivity}%`;
  elements.progressBar.style.width = `${productivity}%`;
  elements.progressMessage.textContent = total
    ? `${completed} of ${total} assignments complete. Keep the streak alive.`
    : "Add your first assignment to begin planning.";
}

function renderSubjectFilter() {
  const current = elements.subjectFilter.value;
  const subjects = [...new Set(assignments.map((item) => item.subject).filter(Boolean))].sort();
  elements.subjectFilter.innerHTML = `<option value="all">All Subjects</option>`;
  subjects.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    elements.subjectFilter.append(option);
  });
  elements.subjectFilter.value = subjects.includes(current) ? current : "all";
}

function renderAssignmentList() {
  const filtered = getFilteredAssignments();
  elements.assignmentList.innerHTML = "";

  if (!filtered.length) {
    elements.assignmentList.innerHTML = `<div class="empty-state">No assignments match this view.</div>`;
    return;
  }

  filtered.forEach((assignment) => {
    const card = document.createElement("article");
    const status = getDeadlineStatus(assignment);
    card.className = `assignment-card ${assignment.priority} ${assignment.completed ? "completed" : ""} ${
      status.overdue ? "overdue" : ""
    }`;

    card.innerHTML = `
      <header>
        <div>
          <h3>${escapeHtml(assignment.title)}</h3>
          <div class="assignment-meta">
            <span><i class="fa-solid fa-book"></i> ${escapeHtml(assignment.subject)}</span>
            <span><i class="fa-solid fa-calendar"></i> ${formatDateTime(assignment)}</span>
            <span><i class="fa-solid fa-stopwatch"></i> ${status.label}</span>
          </div>
        </div>
        <span class="priority-pill ${assignment.priority}">${capitalize(assignment.priority)}</span>
      </header>
      <p>${escapeHtml(assignment.description || "No extra details added.")}</p>
      <div class="card-actions">
        <button type="button" aria-label="Toggle complete" data-action="complete" data-id="${assignment.id}">
          <i class="fa-solid ${assignment.completed ? "fa-rotate-left" : "fa-check"}"></i>
        </button>
        <button type="button" aria-label="Edit assignment" data-action="edit" data-id="${assignment.id}">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button type="button" aria-label="Delete assignment" data-action="delete" data-id="${assignment.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
        <span class="status-pill">${assignment.completed ? "Completed" : "Pending"}</span>
      </div>
    `;

    card.addEventListener("click", handleCardAction);
    elements.assignmentList.append(card);
  });
}

function handleCardAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  if (action === "complete") toggleCompleted(id);
  if (action === "edit") editAssignment(id);
  if (action === "delete") deleteAssignment(id);
}

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());
  const monthName = currentMonth.toLocaleString(undefined, { month: "long", year: "numeric" });
  const todayKey = toDateKey(new Date());

  elements.calendarTitle.textContent = monthName;
  elements.calendarGrid.innerHTML = "";

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const key = toDateKey(date);
    const dayAssignments = assignments.filter((item) => item.dueDate === key);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `calendar-day ${date.getMonth() !== month ? "muted" : ""} ${key === todayKey ? "today" : ""}`;
    cell.innerHTML = `<span class="date-number">${date.getDate()}</span>`;

    dayAssignments.slice(0, 3).forEach((assignment) => {
      const dot = document.createElement("span");
      dot.className = `deadline-dot ${assignment.priority}`;
      dot.textContent = assignment.title;
      cell.append(dot);
    });

    cell.addEventListener("click", () => {
      if (dayAssignments.length) {
        showToast(`${dayAssignments.length} deadline${dayAssignments.length > 1 ? "s" : ""} on ${date.toDateString()}.`);
      }
    });
    elements.calendarGrid.append(cell);
  }
}

function changeMonth(offset) {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
  renderCalendar();
}

function getDeadlineStatus(assignment) {
  if (assignment.completed) return { label: "Done", overdue: false, urgent: false };

  const due = new Date(`${assignment.dueDate}T${assignment.dueTime}`);
  const now = new Date();
  const diff = due - now;

  if (diff < 0) return { label: "Overdue", overdue: true, urgent: false };

  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (hours < 24) return { label: `${hours}h ${minutes}m left`, overdue: false, urgent: true };
  return { label: `${Math.ceil(diff / 86_400_000)} days left`, overdue: false, urgent: false };
}

function showDueReminders() {
  assignments.forEach((assignment) => {
    const status = getDeadlineStatus(assignment);
    if (status.urgent && !assignment.reminded) {
      assignment.reminded = true;
      showToast(`Urgent: ${assignment.title} is due soon.`);
    }
  });
  saveAssignments();
}

function showRandomQuote() {
  const next = quotes[Math.floor(Math.random() * quotes.length)];
  elements.quoteText.textContent = next;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => elements.toast.classList.remove("show"), 3200);
}

function launchConfetti() {
  const canvas = elements.confettiCanvas;
  const context = canvas.getContext("2d");
  const colors = ["#25f5ff", "#ff4fb8", "#8f5cff", "#ffd166", "#37e58d"];
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight * 0.3,
    size: 5 + Math.random() * 8,
    speed: 2 + Math.random() * 5,
    angle: Math.random() * Math.PI,
    spin: Math.random() * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  let frame = 0;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((piece) => {
      piece.y += piece.speed;
      piece.x += Math.sin(piece.angle + frame * piece.spin) * 2;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.angle + frame * piece.spin);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.65);
      context.restore();
    });

    frame += 1;
    if (frame < 150) requestAnimationFrame(draw);
    else context.clearRect(0, 0, canvas.width, canvas.height);
  }

  draw();
}

function revealOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
}

function typeTagline() {
  const target = document.getElementById("typedTagline");
  const text = "Plan Smart. Study Better.";
  let index = 0;
  target.textContent = "";
  const timer = setInterval(() => {
    target.textContent += text[index];
    index += 1;
    if (index >= text.length) clearInterval(timer);
  }, 55);
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  localStorage.setItem(themeKey, isLight ? "light" : "dark");
  elements.themeToggle.innerHTML = `<i class="fa-solid ${isLight ? "fa-sun" : "fa-moon"}"></i>`;
}

function applyStoredTheme() {
  const theme = localStorage.getItem(themeKey);
  if (theme === "light") document.body.classList.add("light-mode");
  elements.themeToggle.innerHTML = `<i class="fa-solid ${
    document.body.classList.contains("light-mode") ? "fa-sun" : "fa-moon"
  }"></i>`;
}

function openSidebar() {
  elements.sidebar.classList.add("open");
  elements.backdrop.classList.add("show");
}

function closeSidebar() {
  elements.sidebar.classList.remove("open");
  elements.backdrop.classList.remove("show");
}

function setMinimumDate() {
  elements.dateInput.min = toDateKey(new Date());
  if (!elements.dateInput.value) elements.dateInput.value = toDateKey(new Date());
  if (!elements.timeInput.value) elements.timeInput.value = "17:00";
}

function getDateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(assignment) {
  const date = new Date(`${assignment.dueDate}T${assignment.dueTime}`);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
