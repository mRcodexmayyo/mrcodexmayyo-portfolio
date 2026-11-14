const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const header = $('#site-header');
const menuToggle = $('#menu-toggle');
const nav = $('#main-nav');

// Compact the sticky header once the reader scrolls into the page.
const updateHeader = () => header.classList.toggle('shrunk', window.scrollY > 24);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  menuToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  nav.classList.toggle('open', !open);
});
$$('.main-nav a').forEach((link) => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  nav.classList.remove('open');
}));

// Accessible photo gallery lightbox.
const lightbox = $('#lightbox');
$$('.gallery-item').forEach((item) => item.addEventListener('click', () => {
  $('#lightbox-image').src = item.dataset.image;
  $('#lightbox-image').alt = item.dataset.alt || '';
  $('#lightbox-caption').textContent = item.querySelector('span').textContent.replace(' ↗', '');
  lightbox.showModal();
}));
$('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });

const DEMO_EMAIL = 'teacher@catherine.school';
const DEMO_PASSWORD = 'Catherine2026!';
const STORAGE_KEY = 'catherine-primary-demo-students-v1';
const initialStudents = [
  { id: 's1', name: 'Amara Johnson', className: 'Year 4', maths: 82, english: 91, science: 87 },
  { id: 's2', name: 'Noah Williams', className: 'Year 4', maths: 74, english: 86, science: 79 },
  { id: 's3', name: 'Mila Chen', className: 'Year 4', maths: 95, english: 89, science: 93 },
  { id: 's4', name: 'Ethan Okafor', className: 'Year 4', maths: 68, english: 76, science: 72 },
  { id: 's5', name: 'Sofia Patel', className: 'Year 4', maths: 88, english: 94, science: 90 },
  { id: 's6', name: 'Leo Martin', className: 'Year 4', maths: '', english: 81, science: 77 }
];
let students = loadStudents();

function loadStudents() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch { /* Use sample records if local storage is unavailable or invalid. */ }
  return structuredClone(initialStudents);
}
function saveStudents() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(students)); }
  catch { /* Dashboard remains usable for this page session. */ }
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function studentAverage(student) {
  const marks = [student.maths, student.english, student.science].map(Number).filter(Number.isFinite);
  return marks.length ? marks.reduce((sum, mark) => sum + mark, 0) / marks.length : null;
}
function renderResults() {
  const query = $('#student-search').value.trim().toLowerCase();
  const filtered = students.filter((student) => student.name.toLowerCase().includes(query) || student.className.toLowerCase().includes(query));
  $('#results-body').innerHTML = filtered.length ? filtered.map((student) => {
    const average = studentAverage(student);
    const markInput = (subject, label) => `<input class="mark-input" type="number" min="0" max="100" step="1" inputmode="numeric" aria-label="${label} mark for ${escapeHTML(student.name)}" data-id="${escapeHTML(student.id)}" data-subject="${subject}" value="${student[subject] ?? ''}" placeholder="—">`;
    return `<tr><td>${escapeHTML(student.name)}</td><td>${escapeHTML(student.className)}</td><td>${markInput('maths', 'Mathematics')}</td><td>${markInput('english', 'English')}</td><td>${markInput('science', 'Science')}</td><td class="average-cell">${average === null ? '—' : `${average.toFixed(1)}%`}</td></tr>`;
  }).join('') : '<tr><td colspan="6">No students match your search.</td></tr>';
  $$('.mark-input').forEach((input) => input.addEventListener('change', updateMark));
  updateStats();
}
function updateStats() {
  const marks = students.flatMap((student) => [student.maths, student.english, student.science]).filter((mark) => mark !== '' && mark !== null && mark !== undefined && Number.isFinite(Number(mark))).map(Number);
  $('#stat-students').textContent = students.length;
  $('#stat-results').textContent = marks.length;
  $('#stat-average').textContent = marks.length ? `${(marks.reduce((total, mark) => total + mark, 0) / marks.length).toFixed(1)}%` : '—';
}
function updateMark(event) {
  const input = event.currentTarget;
  const value = input.value === '' ? '' : Number(input.value);
  if (value !== '' && (!Number.isInteger(value) || value < 0 || value > 100)) {
    input.setCustomValidity('Enter a whole number from 0 to 100.');
    input.reportValidity();
    input.setCustomValidity('');
    return;
  }
  const student = students.find((item) => item.id === input.dataset.id);
  if (!student) return;
  student[input.dataset.subject] = value;
  saveStudents();
  renderResults();
}

$('#login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const email = $('#teacher-email').value.trim().toLowerCase();
  const password = $('#teacher-password').value;
  const message = $('#login-message');
  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    message.textContent = 'That demo sign-in did not match. Use the sample credentials shown above.';
    return;
  }
  message.textContent = '';
  $('#dashboard-welcome').textContent = 'Welcome back, Catherine teacher.';
  $('#teacher-dashboard').hidden = false;
  renderResults();
  $('#teacher-dashboard').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('#logout-button').addEventListener('click', () => {
  $('#teacher-dashboard').hidden = true;
  $('#portal').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('#student-search').addEventListener('input', renderResults);

const studentDialog = $('#student-dialog');
$('#add-student').addEventListener('click', () => studentDialog.showModal());
$('#student-form').addEventListener('submit', (event) => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault();
  const name = $('#new-student-name').value.trim();
  const className = $('#new-student-class').value.trim();
  if (!name || !className) return;
  students.push({ id: crypto.randomUUID ? crypto.randomUUID() : `s${Date.now()}`, name, className, maths: '', english: '', science: '' });
  saveStudents();
  $('#new-student-name').value = '';
  $('#new-student-class').value = '';
  studentDialog.close();
  renderResults();
});

$('.show-password').addEventListener('click', (event) => {
  const input = $('#teacher-password');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  event.currentTarget.textContent = show ? 'Hide' : 'Show';
  event.currentTarget.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});
$('#year').textContent = new Date().getFullYear();
