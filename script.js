// State Management
let students = JSON.parse(localStorage.getItem('cpp_students_data')) || [];
let cgpaCourses = JSON.parse(localStorage.getItem('cgpa_courses_data')) || [];

// Standard Grade Points Mapping (4.0 Scale)
const GRADE_MAP = {
    'A': 4.00,
    'A-': 3.75,
    'B+': 3.50,
    'B': 3.00,
    'B-': 2.75,
    'C+': 2.50,
    'C': 2.00,
    'D': 1.00,
    'F': 0.00
};

// DOM Elements - Navigation Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// DOM Elements - Section 1 (Marks)
const marksForm = document.getElementById('marksForm');
const studentNameInput = document.getElementById('studentName');
const rawMarksInput = document.getElementById('rawMarks');
const livePreview = document.getElementById('livePreview');
const previewPills = document.getElementById('previewPills');
const previewCount = document.getElementById('previewCount');
const previewTotal = document.getElementById('previewTotal');
const previewAvg = document.getElementById('previewAvg');
const studentTableBody = document.getElementById('studentTableBody');
const statTotalStudents = document.getElementById('statTotalStudents');
const statClassAverage = document.getElementById('statClassAverage');
const statTopPerformer = document.getElementById('statTopPerformer');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const btnPresets = document.getElementById('btnPresets');
const btnExport = document.getElementById('btnExport');
const btnClearAll = document.getElementById('btnClearAll');

// DOM Elements - Section 2 (CGPA)
const priorCgpaInput = document.getElementById('priorCgpa');
const priorCreditsInput = document.getElementById('priorCredits');
const courseRowsContainer = document.getElementById('courseRowsContainer');
const btnAddCourse = document.getElementById('btnAddCourse');
const btnCalculateCgpa = document.getElementById('btnCalculateCgpa');
const btnResetCgpa = document.getElementById('btnResetCgpa');
const cgpaDisplay = document.getElementById('cgpaDisplay');
const totalCreditsDisplay = document.getElementById('totalCreditsDisplay');
const honorsDisplay = document.getElementById('honorsDisplay');
const cgpaSummaryTableBody = document.getElementById('cgpaSummaryTableBody');
const btnExportCgpa = document.getElementById('btnExportCgpa');

// DOM Elements - Theme
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupTabNavigation();
    renderMarksSection();
    initCgpaRows();
    renderCgpaSection();
});

// Tab Switcher Logic
function setupTabNavigation() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.getAttribute('data-tab');
            document.getElementById(target).classList.add('active');
        });
    });
}

/* ==========================================
   SECTION 1: MARKS ANALYTICS (C++ Stringstream)
   ========================================== */
function parseMarksString(inputStr) {
    if (!inputStr.trim()) return [];
    const tokens = inputStr.replace(/,/g, ' ').trim().split(/\s+/);
    const marks = [];

    for (const token of tokens) {
        const num = parseFloat(token);
        if (!isNaN(num) && num >= 0 && num <= 100) {
            marks.push(num);
        }
    }
    return marks;
}

rawMarksInput.addEventListener('input', () => {
    const marks = parseMarksString(rawMarksInput.value);
    if (marks.length === 0) {
        livePreview.classList.add('hidden');
        return;
    }

    livePreview.classList.remove('hidden');
    previewPills.innerHTML = marks.map(m => `<span class="pill">${m}</span>`).join('');
    const total = marks.reduce((s, v) => s + v, 0);
    const avg = total / marks.length;

    previewCount.textContent = marks.length;
    previewTotal.textContent = total.toFixed(2);
    previewAvg.textContent = avg.toFixed(2);
});

marksForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = studentNameInput.value.trim();
    const marks = parseMarksString(rawMarksInput.value);

    if (!name || marks.length === 0) {
        alert("Please provide a name and valid numeric marks.");
        return;
    }

    const total = marks.reduce((s, v) => s + v, 0);
    const average = total / marks.length;

    students.push({
        id: Date.now(),
        name: name,
        marks: marks,
        total: total,
        average: parseFloat(average.toFixed(2))
    });

    saveAndRenderMarks();
    marksForm.reset();
    livePreview.classList.add('hidden');
});

function deleteStudent(id) {
    students = students.filter(s => s.id !== id);
    saveAndRenderMarks();
}

btnClearAll.addEventListener('click', () => {
    if (students.length && confirm("Clear all student mark records?")) {
        students = [];
        saveAndRenderMarks();
    }
});

btnPresets.addEventListener('click', () => {
    const presets = [
        { name: "Alex Johnson", raw: "88.5 92.0 79.5 95.0" },
        { name: "Maria Garcia", raw: "65.0 70.5 68.0 72.0" },
        { name: "Liam Smith", raw: "45.0 52.0 48.5 50.0" }
    ];

    presets.forEach(p => {
        const marks = parseMarksString(p.raw);
        const total = marks.reduce((s, v) => s + v, 0);
        students.push({
            id: Date.now() + Math.random(),
            name: p.name,
            marks: marks,
            total: total,
            average: parseFloat((total / marks.length).toFixed(2))
        });
    });

    saveAndRenderMarks();
});

function renderMarksSection() {
    let list = [...students];
    const query = searchInput.value.toLowerCase().trim();
    if (query) list = list.filter(s => s.name.toLowerCase().includes(query));

    const sortVal = sortSelect.value;
    if (sortVal === 'newest') list.sort((a, b) => b.id - a.id);
    else if (sortVal === 'oldest') list.sort((a, b) => a.id - b.id);
    else if (sortVal === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortVal === 'avgDesc') list.sort((a, b) => b.average - a.average);
    else if (sortVal === 'avgAsc') list.sort((a, b) => a.average - b.average);

    if (list.length === 0) {
        studentTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">No student records found.</td></tr>`;
    } else {
        studentTableBody.innerHTML = list.map(s => `
            <tr>
                <td><strong>${escapeHtml(s.name)}</strong></td>
                <td>${s.marks.join(', ')}</td>
                <td>${s.total.toFixed(2)}</td>
                <td><strong>${s.average.toFixed(2)}</strong></td>
                <td><span class="badge ${s.average >= 50 ? 'badge-pass' : 'badge-fail'}">${s.average >= 50 ? 'PASS' : 'FAIL'}</span></td>
                <td class="text-right"><button class="btn-delete" onclick="deleteStudent(${s.id})">🗑️</button></td>
            </tr>
        `).join('');
    }

    statTotalStudents.textContent = students.length;
    if (students.length === 0) {
        statClassAverage.textContent = "0.00";
        statTopPerformer.textContent = "N/A";
    } else {
        const avg = students.reduce((s, v) => s + v.average, 0) / students.length;
        statClassAverage.textContent = avg.toFixed(2);
        const top = [...students].sort((a, b) => b.average - a.average)[0];
        statTopPerformer.textContent = `${top.name} (${top.average.toFixed(2)})`;
    }
}

function saveAndRenderMarks() {
    localStorage.setItem('cpp_students_data', JSON.stringify(students));
    renderMarksSection();
}

searchInput.addEventListener('input', renderMarksSection);
sortSelect.addEventListener('change', renderMarksSection);

/* ==========================================
   SECTION 2: CGPA & GRADE CALCULATOR LOGIC
   ========================================== */
function initCgpaRows() {
    if (cgpaCourses.length === 0) {
        // Add 3 default initial course rows
        addCourseRow("Course 1", "A", 3);
        addCourseRow("Course 2", "B+", 3);
        addCourseRow("Course 3", "A-", 4);
    } else {
        renderCourseInputs();
    }
}

function addCourseRow(name = "", grade = "A", credits = 3) {
    cgpaCourses.push({
        id: Date.now() + Math.random(),
        name: name,
        grade: grade,
        credits: parseInt(credits) || 3
    });
    renderCourseInputs();
}

function removeCourseRow(id) {
    cgpaCourses = cgpaCourses.filter(c => c.id !== id);
    renderCourseInputs();
    renderCgpaSection();
}

function renderCourseInputs() {
    courseRowsContainer.innerHTML = cgpaCourses.map((c, idx) => `
        <div class="course-row">
            <input type="text" placeholder="Course Name" value="${escapeHtml(c.name || '')}" onchange="updateCourse(${c.id}, 'name', this.value)">
            <select onchange="updateCourse(${c.id}, 'grade', this.value)">
                ${Object.keys(GRADE_MAP).map(g => `<option value="${g}" ${c.grade === g ? 'selected' : ''}>${g} (${GRADE_MAP[g].toFixed(2)})</option>`).join('')}
            </select>
            <input type="number" min="1" max="6" value="${c.credits}" onchange="updateCourse(${c.id}, 'credits', this.value)" placeholder="Credits">
            <button class="btn-remove-row" onclick="removeCourseRow(${c.id})" title="Remove">✕</button>
        </div>
    `).join('');
}

function updateCourse(id, field, value) {
    const course = cgpaCourses.find(c => c.id === id);
    if (course) {
        if (field === 'credits') course.credits = parseInt(value) || 0;
        else course[field] = value;
    }
    saveCgpaState();
}

btnAddCourse.addEventListener('click', () => {
    addCourseRow(`Course ${cgpaCourses.length + 1}`, "A", 3);
});

btnResetCgpa.addEventListener('click', () => {
    cgpaCourses = [];
    priorCgpaInput.value = "";
    priorCreditsInput.value = "";
    addCourseRow("Course 1", "A", 3);
    saveCgpaState();
    renderCgpaSection();
});

btnCalculateCgpa.addEventListener('click', () => {
    renderCgpaSection();
});

function renderCgpaSection() {
    let currentTotalPoints = 0;
    let currentTotalCredits = 0;

    const summaryRowsHTML = cgpaCourses.map(c => {
        const gradePoint = GRADE_MAP[c.grade] || 0.00;
        const totalPoints = gradePoint * c.credits;
        currentTotalPoints += totalPoints;
        currentTotalCredits += c.credits;

        return `
            <tr>
                <td><strong>${escapeHtml(c.name || 'Unnamed Course')}</strong></td>
                <td><span class="badge badge-pass">${c.grade}</span></td>
                <td>${gradePoint.toFixed(2)}</td>
                <td>${c.credits}</td>
                <td><strong>${totalPoints.toFixed(2)}</strong></td>
            </tr>
        `;
    }).join('');

    cgpaSummaryTableBody.innerHTML = summaryRowsHTML || `<tr><td colspan="5" class="empty-state">No courses added.</td></tr>`;

    // Prior Semester Inclusions
    const priorCgpa = parseFloat(priorCgpaInput.value) || 0;
    const priorCredits = parseInt(priorCreditsInput.value) || 0;

    const cumulativePoints = currentTotalPoints + (priorCgpa * priorCredits);
    const cumulativeCredits = currentTotalCredits + priorCredits;

    const overallCGPA = cumulativeCredits > 0 ? (cumulativePoints / cumulativeCredits) : 0.00;

    cgpaDisplay.textContent = overallCGPA.toFixed(2);
    totalCreditsDisplay.textContent = cumulativeCredits;

    // Academic Honors Classification
    if (overallCGPA >= 3.75) honorsDisplay.textContent = "First Class Honors 🌟";
    else if (overallCGPA >= 3.00) honorsDisplay.textContent = "Second Class Upper 👍";
    else if (overallCGPA >= 2.25) honorsDisplay.textContent = "Second Class Lower 📘";
    else if (overallCGPA >= 2.00) honorsDisplay.textContent = "Pass Grade ⚖️";
    else honorsDisplay.textContent = "Academic Probation ⚠️";
}

function saveCgpaState() {
    localStorage.setItem('cgpa_courses_data', JSON.stringify(cgpaCourses));
}

// Export CSVS
btnExport.addEventListener('click', () => exportCSV(students, "student_marks.csv"));
btnExportCgpa.addEventListener('click', () => {
    let csv = "Course Name,Grade,Grade Point,Credits,Total Points\n";
    cgpaCourses.forEach(c => {
        const gp = GRADE_MAP[c.grade] || 0;
        csv += `"${c.name}",${c.grade},${gp.toFixed(2)},${c.credits},${(gp * c.credits).toFixed(2)}\n`;
    });
    downloadCSV(csv, "cgpa_report.csv");
});

function downloadCSV(csvContent, filename) {
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Theme Switcher
themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.body.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
});

function initTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
    }
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
}