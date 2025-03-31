document.addEventListener('DOMContentLoaded', () => {
    const repsInput = document.getElementById('reps');
    const contractTimeInput = document.getElementById('contract-time');
    const relaxTimeInput = document.getElementById('relax-time');
    const startWorkoutButton = document.getElementById('start-workout');
    const timerDisplay = document.getElementById('timer');
    const progressBar = document.getElementById('progress-bar');
    const repCounter = document.getElementById('rep-counter');
    const resultsSection = document.getElementById('results');
    const summaryDisplay = document.getElementById('summary');
    const saveProgressButton = document.getElementById('save-progress');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const phaseIndicator = document.getElementById('phase-indicator');
    const stopWorkoutButton = document.getElementById('stop-workout');
    const logList = document.getElementById('log-list');
    const backHomeButton = document.getElementById('back-home');
    const warmUpButton = document.getElementById('warm-up');
    const slowHoldButton = document.getElementById('slow-hold');
    const fastPulseButton = document.getElementById('fast-pulse');
    const prevDayButton = document.getElementById('prev-day');
    const nextDayButton = document.getElementById('next-day');
    const logDateDisplay = document.getElementById('log-date');

    let interval;
    let currentRep = 0;
    let totalReps;
    let contractTime;
    let relaxTime;
    let isContracting = true;
    let currentLogDate = new Date().toISOString().split('T')[0];

    startWorkoutButton.addEventListener('click', startWorkout);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    saveProgressButton.addEventListener('click', saveProgress);
    stopWorkoutButton.addEventListener('click', stopWorkout);
    backHomeButton.addEventListener('click', backToHome);
    warmUpButton.addEventListener('click', () => setDefaults(10, 5, 3));
    slowHoldButton.addEventListener('click', () => setDefaults(10, 10, 5));
    fastPulseButton.addEventListener('click', () => setDefaults(20, 1, 1));
    prevDayButton.addEventListener('click', () => changeLogDate(-1));
    nextDayButton.addEventListener('click', () => changeLogDate(1));

    loadLog();

    function startWorkout() {
        totalReps = parseInt(repsInput.value);
        contractTime = parseInt(contractTimeInput.value);
        relaxTime = parseInt(relaxTimeInput.value);
        currentRep = 0;
        isContracting = true;
        document.getElementById('customization').classList.add('hidden');
        document.getElementById('workout').classList.remove('hidden');
        updateRepCounter();
        phaseIndicator.textContent = 'Contracting';
        startTimer(contractTime);
    }

    function startTimer(duration) {
        let timeRemaining = duration;
        timerDisplay.textContent = formatTime(timeRemaining);
        interval = setInterval(() => {
            timeRemaining--;
            timerDisplay.textContent = formatTime(timeRemaining);
            updateProgressBar(duration, timeRemaining);
            if (timeRemaining <= 0) {
                clearInterval(interval);
                if (isContracting) {
                    currentRep++;
                    if (currentRep < totalReps) {
                        isContracting = false;
                        phaseIndicator.textContent = 'Relaxing';
                        startTimer(relaxTime);
                    } else {
                        endWorkout();
                    }
                } else {
                    isContracting = true;
                    phaseIndicator.textContent = 'Contracting';
                    startTimer(contractTime);
                }
                updateRepCounter();
            }
        }, 1000);
    }

    function updateProgressBar(total, remaining) {
        const progress = ((total - remaining) / total) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function updateRepCounter() {
        repCounter.textContent = `Rep ${currentRep} of ${totalReps}`;
    }

    function endWorkout() {
        document.getElementById('workout').classList.add('hidden');
        resultsSection.classList.remove('hidden');
        summaryDisplay.textContent = `Completed ${totalReps} reps in ${totalReps * (contractTime + relaxTime)} seconds.`;
        addLogEntry(totalReps, contractTime, relaxTime);
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function toggleDarkMode() {
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
    }

    function saveProgress() {
        const progress = {
            reps: totalReps,
            contractTime,
            relaxTime,
            date: new Date().toISOString()
        };
        localStorage.setItem('kegelProgress', JSON.stringify(progress));
        alert('Progress saved!');
    }

    function stopWorkout() {
        clearInterval(interval);
        document.getElementById('workout').classList.add('hidden');
        document.getElementById('customization').classList.remove('hidden');
    }

    function addLogEntry(reps, contractTime, relaxTime) {
        const logEntry = {
            reps,
            contractTime,
            relaxTime,
            date: new Date().toISOString()
        };
        const logEntries = getLogEntries();
        logEntries.push(logEntry);
        localStorage.setItem('kegelLog', JSON.stringify(logEntries));
        renderLogEntries();
    }

    function getLogEntries() {
        const logEntries = localStorage.getItem('kegelLog');
        return logEntries ? JSON.parse(logEntries) : [];
    }

    function renderLogEntries() {
        const logEntries = getLogEntries();
        const filteredEntries = logEntries.filter(entry => entry.date.split('T')[0] === currentLogDate);
        logList.innerHTML = '';
        filteredEntries.forEach(renderLogEntry);
        logDateDisplay.textContent = currentLogDate;
    }

    function renderLogEntry(logEntry) {
        const logItem = document.createElement('li');
        logItem.textContent = `Reps: ${logEntry.reps}, Contract Time: ${logEntry.contractTime}s, Relax Time: ${logEntry.relaxTime}s, Date: ${logEntry.date}`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteLogEntry(logEntry));
        logItem.appendChild(deleteButton);
        logList.appendChild(logItem);
    }

    function loadLog() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            body.classList.add('dark-mode');
        }
        renderLogEntries();
    }

    function deleteLogEntry(logEntry) {
        let logEntries = getLogEntries();
        logEntries = logEntries.filter(entry => entry.date !== logEntry.date);
        localStorage.setItem('kegelLog', JSON.stringify(logEntries));
        renderLogEntries();
    }

    function backToHome() {
        document.getElementById('results').classList.add('hidden');
        document.getElementById('customization').classList.remove('hidden');
    }

    function setDefaults(reps, contractTime, relaxTime) {
        repsInput.value = reps;
        contractTimeInput.value = contractTime;
        relaxTimeInput.value = relaxTime;
    }

    function changeLogDate(days) {
        const date = new Date(currentLogDate);
        date.setDate(date.getDate() + days);
        currentLogDate = date.toISOString().split('T')[0];
        renderLogEntries();
    }
});
