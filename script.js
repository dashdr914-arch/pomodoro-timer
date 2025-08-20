// Timer Variables
let timer;
let timeLeft;
let currentSession = 'work';
let sessionsCompleted = 0;
let totalSessions = 4;
let isRunning = false;
let totalFocusMinutes = 0;
let successfulSessions = 0;
let workDuration = 25;
let breakDuration = 5;
let sessionHistory = [];

// DOM Elements
const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');
const sessionTypeDisplay = document.getElementById('sessionType');
const sessionCountDisplay = document.getElementById('sessionCount');
const progressChart = document.getElementById('progressChart');
const totalFocusDisplay = document.getElementById('totalFocus');
const sessionsCompletedDisplay = document.getElementById('sessionsCompleted');
const successRateDisplay = document.getElementById('successRate');
const preset25Btn = document.getElementById('preset25');
const preset45Btn = document.getElementById('preset45');
const presetCustomBtn = document.getElementById('presetCustom');

// Initialize timer
function initTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.textContent = 'Start';
    
    if (currentSession === 'work') {
        timeLeft = workDuration * 60;
    } else {
        timeLeft = breakDuration * 60;
    }
    
    updateDisplay();
}

// Format time for display
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update timer display
function updateDisplay() {
    timeDisplay.textContent = formatTime(timeLeft);
    sessionTypeDisplay.textContent = currentSession === 'work' ? 'Focus Session' : 'Break Time';
    sessionCountDisplay.textContent = `Session ${sessionsCompleted + 1} of ${totalSessions}`;
}

// Start/Pause timer
function toggleTimer() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startBtn.textContent = 'Start';
    } else {
        isRunning = true;
        startBtn.textContent = 'Pause';
        
        timer = setInterval(() => {
            timeLeft--;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                sessionComplete();
            }
            
            updateDisplay();
        }, 1000);
    }
}

// Handle session completion
function sessionComplete() {
    if (currentSession === 'work') {
        totalFocusMinutes += workDuration;
        successfulSessions++;
        
        // Record completed work session
        sessionHistory.push({
            type: 'work',
            duration: workDuration,
            completed: true,
            timestamp: new Date()
        });
        
        if (sessionsCompleted < totalSessions - 1) {
            currentSession = 'break';
            timeLeft = breakDuration * 60;
            sessionTypeDisplay.textContent = 'Break Time';
            updateStats();
            updateChart();
        } else {
            // All sessions completed
            sessionsCompleted++;
            updateStats();
            updateChart();
            alert('Pomodoro completed! Well done!');
            resetTimer();
            return;
        }
    } else {
        // Record completed break session
        sessionHistory.push({
            type: 'break',
            duration: breakDuration,
            completed: true,
            timestamp: new Date()
        });
        
        sessionsCompleted++;
        currentSession = 'work';
        timeLeft = workDuration * 60;
        sessionTypeDisplay.textContent = 'Focus Session';
        updateStats();
        updateChart();
    }
    
    isRunning = false;
    startBtn.textContent = 'Start';
    updateDisplay();
}

// Reset timer
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.textContent = 'Start';
    sessionsCompleted = 0;
    currentSession = 'work';
    totalFocusMinutes = 0;
    successfulSessions = 0;
    sessionHistory = [];
    initTimer();
    updateStats();
    updateChart();
}

// Skip current session
function skipSession() {
    clearInterval(timer);
    isRunning = false;
    startBtn.textContent = 'Start';
    
    // Record skipped session
    sessionHistory.push({
        type: currentSession,
        duration: currentSession === 'work' ? workDuration : breakDuration,
        completed: false,
        timestamp: new Date()
    });
    
    if (currentSession === 'work') {
        currentSession = 'break';
        timeLeft = breakDuration * 60;
    } else {
        currentSession = 'work';
        timeLeft = workDuration * 60;
        sessionsCompleted++;
    }
    
    updateDisplay();
    updateStats();
    updateChart();
}

// Update statistics display
function updateStats() {
    totalFocusDisplay.textContent = `${totalFocusMinutes} min`;
    sessionsCompletedDisplay.textContent = `${sessionsCompleted}`;
    
    const successRate = sessionsCompleted > 0 ? 
        Math.round((successfulSessions / sessionsCompleted) * 100) : 0;
    successRateDisplay.textContent = `${successRate}%`;
}

// Update progress chart
function updateChart() {
    progressChart.innerHTML = '';
    
    // Show last 10 sessions
    const recentSessions = sessionHistory.slice(-10);
    
    recentSessions.forEach(session => {
        const bar = document.createElement('div');
        bar.className = `chart-bar ${session.type}`;
        
        // Height proportional to session duration
        const height = (session.duration / Math.max(workDuration, breakDuration)) * 100;
        bar.style.height = `${height}%`;
        
        const label = document.createElement('div');
        label.className = 'chart-label';
        
        // Format time for label
        const time = session.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        label.textContent = time;
        
        // Tooltip with session info
        bar.title = `${session.type} ${session.duration} min - ${session.completed ? 'Completed' : 'Skipped'}`;
        
        bar.appendChild(label);
        progressChart.appendChild(bar);
    });
}

// Set timer presets
function setPreset25() {
    workDuration = 25;
    breakDuration = 5;
    resetTimer();
}

function setPreset45() {
    workDuration = 45;
    breakDuration = 15;
    resetTimer();
}

function setPresetCustom() {
    const customWork = prompt('Enter work duration (minutes):', workDuration);
    const customBreak = prompt('Enter break duration (minutes):', breakDuration);
    
    if (customWork && customBreak && !isNaN(customWork) && !isNaN(customBreak)) {
        workDuration = parseInt(customWork);
        breakDuration = parseInt(customBreak);
        resetTimer();
    }
}

// Event listeners
startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);
skipBtn.addEventListener('click', skipSession);
preset25Btn.addEventListener('click', setPreset25);
preset45Btn.addEventListener('click', setPreset45);
presetCustomBtn.addEventListener('click', setPresetCustom);

// Initialize
initTimer();
updateStats();
updateChart();