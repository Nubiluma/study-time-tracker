class Timer {
  constructor(seconds, minutes, hours, date) {
    this.seconds = seconds;
    this.minutes = minutes;
    this.hours = hours;
    this.date = date;
  }
}

const timerSeconds = document.querySelector("#timerSeconds");
const timerMinutes = document.querySelector("#timerMinutes");
const timerHours = document.querySelector("#timerHours");
const startBtn = document.querySelector("#btnStartTimer");
const pauseBtn = document.querySelector("#btnPauseTimer");
const resetBtn = document.querySelector("#btnResetTimer");
const main = document.querySelector("main");

let currentInterval;

const state = {
  activeTimer: null,
  savedTimers: [],
};

/*********************************************************************/

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

getDataFromLocalStorage();
renderTimer();

/*********************************************************************/

function startTimer() {
  if (state.activeTimer == null) {
    state.activeTimer = new Timer(0, 0, 0, formatDate(new Date()));
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
  updateLocalStorage();
}

function resetTimer() {
  if (state.activeTimer != null) {
    pauseTimer();
    demandUserFeedback();
  }
}

function saveTimer() {
  if (state.savedTimers.length === 0 || state.savedTimers[0] === null) {
    state.savedTimers.unshift(state.activeTimer);
    updateLocalStorage();
  } else if (state.savedTimers[0].date !== state.activeTimer.date) {
    state.savedTimers.unshift(state.activeTimer);
    updateLocalStorage();
  } else if (state.savedTimers[0].date === state.activeTimer.date) {
    state.savedTimers[0] = accountTimers(
      state.activeTimer,
      state.savedTimers[0]
    );
    updateLocalStorage();
  }
}

function accountTimers(activeTimer, savedTimer) {
  let sumSeconds = savedTimer.seconds + activeTimer.seconds;
  let sumMinutes = savedTimer.minutes + activeTimer.minutes;
  let sumHours = savedTimer.hours + activeTimer.hours;

  if (sumSeconds < 120 && sumMinutes < 120 && sumHours < 24) {
    if (sumSeconds >= 60) {
      sumSeconds -= 60;
      sumMinutes++;
    }
    if (sumMinutes >= 60) {
      sumMinutes -= 60;
      sumHours++;
    }
    savedTimer.seconds = sumSeconds;
    savedTimer.minutes = sumMinutes;
    savedTimer.hours = sumHours;

    console.log(savedTimer);
    return savedTimer;
  } else {
    console.error(
      "timer(s) invalid: seconds, minutes or hours exceed limit of 60 and/or 24!"
    );
  }
}

function demandUserFeedback() {
  const notification = document.createElement("aside");
  notification.id = "notification";
  const msg = document.createTextNode(
    "Do you want to save the timer's progress since last started?"
  );
  notification.appendChild(msg);
  const saveBtn = document.createElement("button");
  const confirmBtnTxt = document.createTextNode("Save");
  saveBtn.appendChild(confirmBtnTxt);
  const dismissBtn = document.createElement("button");
  const dismissBtnTxt = document.createTextNode("Dismiss");
  dismissBtn.appendChild(dismissBtnTxt);
  const cancelBtn = document.createElement("button");
  const cancelBtnTxt = document.createTextNode("Cancel");
  cancelBtn.appendChild(cancelBtnTxt);

  saveBtn.addEventListener("click", saveAction);
  dismissBtn.addEventListener("click", dismissAction);
  cancelBtn.addEventListener("click", cancelAction);

  notification.appendChild(saveBtn);
  notification.appendChild(dismissBtn);
  notification.appendChild(cancelBtn);

  main.appendChild(notification);
}

function saveAction() {
  saveTimer();
  state.activeTimer = null;
  updateLocalStorage();
  renderTimer();
  const notification = document.querySelector("#notification");
  notification.remove();
}

function dismissAction() {
  state.activeTimer = null;
  updateLocalStorage();
  renderTimer();
  const notification = document.querySelector("#notification");
  notification.remove();
}

function cancelAction() {
  const notification = document.querySelector("#notification");
  notification.remove();
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
  } else {
    timerSeconds.innerText = "00";
    timerMinutes.innerText = "00";
    timerHours.innerText = "00";
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

function formatDate(date) {
  return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
}
