class Timer {
  constructor(seconds, minutes, hours, date) {
    this.seconds = seconds;
    this.minutes = minutes;
    this.hours = hours;
    this.date = date;
  }
}

const timerSeconds = document.getElementById("timerSeconds");
const timerMinutes = document.getElementById("timerMinutes");
const timerHours = document.getElementById("timerHours");
const startBtn = document.getElementById("btnStartTimer");
const pauseBtn = document.getElementById("btnPauseTimer");
const resetBtn = document.getElementById("btnResetTimer");

let currentInterval;

const state = {
  activeTimer: null,
  savedTimers: [],
};

/*********************************************************************/

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);

getDataFromLocalStorage();
renderTimer();

/*********************************************************************/

function startTimer() {
  if (state.activeTimer == null) {
    state.activeTimer = new Timer(0, 0, 0, Date());
  }
  currentInterval = setInterval(() => {
    state.activeTimer.seconds++;
    if (state.activeTimer.seconds === 60) {
      state.activeTimer.seconds = 0;
      state.activeTimer.minutes++;
      if (state.activeTimer.minutes === 60) {
        state.activeTimer.minutes = 0;
        state.activeTimer.hours++;
      }
    }

    updateLocalStorage();
    renderTimer();
  }, 1000);
}

function pauseTimer() {
  clearInterval(currentInterval);

  if (
    state.savedTimers.length === 0 ||
    state.savedTimers[0].date !== state.activeTimer.date
  ) {
    state.savedTimers.unshift(state.activeTimer);
  } else {
    state.savedTimers[0] = state.activeTimer;
  }
  console.log(state.savedTimers);
  updateLocalStorage();
}

/*********************************************************************/

function renderTimer() {
  if (state.activeTimer != null) {
    if (state.activeTimer.seconds < 10) {
      timerSeconds.innerText = "0" + state.activeTimer.seconds;
    } else {
      timerSeconds.innerText = state.activeTimer.seconds;
    }
    if (state.activeTimer.minutes < 10) {
      timerMinutes.innerText = "0" + state.activeTimer.minutes;
    } else {
      timerMinutes.innerText = state.activeTimer.minutes;
    }
    if (state.activeTimer.hours < 10) {
      timerHours.innerText = "0" + state.activeTimer.hours;
    } else {
      timerHours.innerText = state.activeTimer.hours;
    }
  }
}

/*********************************************************************/

function getDataFromLocalStorage() {
  const activeTimerFromLocalStorage = localStorage.getItem("activeTimer");
  const savedTimersFromLocalStorage = localStorage.getItem("savedTimers");
  if (activeTimerFromLocalStorage) {
    state.activeTimer = JSON.parse(activeTimerFromLocalStorage);
  }
  if (savedTimersFromLocalStorage) {
    state.savedTimers = JSON.parse(savedTimersFromLocalStorage);
  }
}

function updateLocalStorage() {
  localStorage.setItem("activeTimer", JSON.stringify(state.activeTimer));
  localStorage.setItem("savedTimers", JSON.stringify(state.savedTimers));
}
