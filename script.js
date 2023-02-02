class Timer {
  constructor(seconds, minutes, hours, date, startingTime) {
    this.seconds = seconds;
    this.minutes = minutes;
    this.hours = hours;
    this.date = date;
    this.startingTime = startingTime;
  }
}

const timerMarkupElement = document.querySelector("#timer");
const startBtn = document.querySelector("#btnStartTimer");
const pauseBtn = document.querySelector("#btnPauseTimer");
const resetBtn = document.querySelector("#btnResetTimer");
const pastTimerContainer = document.querySelector("#pastTimerContainer");
const pastTimerList = document.querySelector("#pastTimerList");
const activeTimerContainer = document.querySelector("#activeTimerContainer");
const notification = document.querySelector(".notification");
const saveBtn = document.querySelector("#save-btn");
const dismissBtn = document.querySelector("#dismiss-btn");
const cancelBtn = document.querySelector("#cancel-btn");

let currentInterval;

const state = {
  activeTimer: null,
  savedTimers: [],
};

/*********************************************************************/

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

saveBtn.addEventListener("click", saveAction);
dismissBtn.addEventListener("click", dismissAction);
cancelBtn.addEventListener("click", cancelAction);

getDataFromLocalStorage();
renderActiveTimer();
renderPastTimers();

/*********************************************************************/
/**EVENTS*/

/**
 * start interval of every second and update active timer
 * create new active timer object if none is existing
 * @returns if active timer's date does not match today's date to prevent timer from progressing
 */
function startTimer() {
  if (state.activeTimer == null) {
    state.activeTimer = new Timer(
      0,
      0,
      0,
      formatDate(new Date()),
      generateStartingTimeforTimer()
    );
  } else if (!isActiveTimerDateToday()) {
    showNotificationForUserFeedback();
    return;
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
    renderActiveTimer();
  }, 1000);
}

/**
 * clear currently running interval to prevent timer from updating/progressing (pause)
 */
function pauseTimer() {
  clearInterval(currentInterval);
  updateLocalStorage();
}

/**
 * pause timer and demand user feedback of what to do with timer's progress (save, dismiss or cancel action)
 */
function resetTimer() {
  if (state.activeTimer != null) {
    pauseTimer();
    showNotificationForUserFeedback();
  }
}

/**
 * save active timer to saved timers in localStorage
 * overwrite first saved timer object if active timer has same date, otherwise add as new element to array at index 0
 */
function saveTimer() {
  if (state.savedTimers.length === 0 || state.savedTimers[0] === null) {
    state.savedTimers.unshift(state.activeTimer);
    updateLocalStorage();
  } else if (!isActiveTimerDateToday()) {
    state.savedTimers.unshift(state.activeTimer);
    updateLocalStorage();
  } else if (isActiveTimerDateToday()) {
    state.savedTimers[0] = accountTimers(
      state.activeTimer,
      state.savedTimers[0]
    );
    updateLocalStorage();
  }
}

/**
 * save-button clicked
 * save changes of active timer to storage and reset active timer
 */
function saveAction() {
  saveTimer();
  state.activeTimer = null;
  updateLocalStorage();
  renderActiveTimer();
  renderPastTimers();
  removeNotificationOverlay();
  startBtn.disabled = false;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
}

/**
 * dismiss-button clicked
 * reset active timer and do not save changes to storage
 */
function dismissAction() {
  state.activeTimer = null;
  updateLocalStorage();
  renderActiveTimer();
  removeNotificationOverlay();
  startBtn.disabled = false;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
}

/**
 * cancel-button clicked
 * do not do anything with active timer, only delete notification markup element from dom
 */
function cancelAction() {
  removeNotificationOverlay();
  startBtn.disabled = false;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
}

/*********************************************************************/
/**MARKUP RENDERING*/

/**
 * render active timer in dom as span elements
 */
function renderActiveTimer() {
  if (state.activeTimer != null) {
    timerMarkupElement.innerText =
      formatSingleDigit(state.activeTimer.hours) +
      ":" +
      formatSingleDigit(state.activeTimer.minutes) +
      ":" +
      formatSingleDigit(state.activeTimer.seconds);
  } else {
    timerMarkupElement.innerText = "00:00:00";
  }
}

/**
 * render latest timers of savedTimers array in list
 */
function renderPastTimers() {
  pastTimerList.innerHTML = "";

  for (const timer of state.savedTimers) {
    createMarkupForPastTimerList(timer);
  }
}

/**
 * render latest timers of savedTimers array as list item elements
 * @param {*} timerObject element of savedTimers array
 */
function createMarkupForPastTimerList(timerObject) {
  const timerListItem = document.createElement("li");
  timerListItem.classList.add("li-timer-item");
  const timerDateInfo = document.createElement("div");
  timerDateInfo.classList.add("li-timer-item-date-info-element");
  const timerInfo = document.createElement("div");
  timerInfo.classList.add("li-timer-item-info-element");
  const timerDateTxt = document.createTextNode(timerObject.date);
  const timerTxt = document.createTextNode(
    "⏱️" + formatTimerForMarkup(timerObject)
  );

  timerDateInfo.appendChild(timerDateTxt);
  timerInfo.appendChild(timerTxt);
  timerListItem.appendChild(timerDateInfo);
  timerListItem.appendChild(timerInfo);
  pastTimerList.appendChild(timerListItem);
}

/**
 * show dialog for user to decide what to do with active timer
 * disable timer buttons while open
 * let user choose to save, dismiss or cancel decision
 */
function showNotificationForUserFeedback() {
  notification.open = true;
  startBtn.disabled = true;
  pauseBtn.disabled = true;
  resetBtn.disabled = true;

  const notificationBlur = document.createElement("div");
  notificationBlur.id = "notificationBlur";
  notificationBlur.classList.add("blur");
  document
    .querySelector("body")
    .insertBefore(notificationBlur, document.querySelector("main"));
}

/**
 * close dialog element and remove blur/darkening effect of background
 */
function removeNotificationOverlay() {
  notification.open = false;
  const blur = document.querySelector("#notificationBlur");
  blur.remove();
}

/*********************************************************************/
/**UTILITY*/

/**
 * check if active timer's date matches today's date (both as formated string)
 * @returns true if date matches today's date
 */
function isActiveTimerDateToday() {
  if (state.activeTimer != null) {
    return state.activeTimer.date === formatDate(new Date());
  }
}

/**
 * account seconds, minutes and hours of two timer objects
 * @param {*} timer1 active timer
 * @param {*} timer2 saved timer from array
 * @returns accounted sum of activeTimer and savedTimer as savedTimer
 */
function accountTimers(timer1, timer2) {
  let sumSeconds = timer2.seconds + timer1.seconds;
  let sumMinutes = timer2.minutes + timer1.minutes;
  let sumHours = timer2.hours + timer1.hours;

  if (sumSeconds < 120 && sumMinutes < 120 && sumHours < 24) {
    if (sumSeconds >= 60) {
      sumSeconds -= 60;
      sumMinutes++;
    }
    if (sumMinutes >= 60) {
      sumMinutes -= 60;
      sumHours++;
    }
    timer2.seconds = sumSeconds;
    timer2.minutes = sumMinutes;
    timer2.hours = sumHours;

    console.log(timer2);
    return timer2;
  } else {
    console.error(
      "timer(s) invalid: seconds, minutes or hours exceed limit of 60 and/or 24!"
    );
  }
}

/**
 * format timer by inserting "0" before value if it consists of only 1 digit
 * @param {*} timer
 * @returns formated timer
 */
function formatTimerForMarkup(timer) {
  if (timer != null) {
    const formatedTimer =
      formatSingleDigit(timer.hours) +
      ":" +
      formatSingleDigit(timer.minutes) +
      ":" +
      formatSingleDigit(timer.seconds);

    //console.log(formatedTimer);
    return formatedTimer;
  }
}

/**
 * format and convert date from Date() API object: months(0-11)/days(1-31)/year(all 4 digits)
 * @param {*} date Date() API object
 * @returns formated string of date
 */
function formatDate(date) {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  let day = date.getDate();

  if (date.getDate() < 10) {
    day = "0" + date.getDate();
  }

  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return month + "|" + day + "|" + year;
}

function generateStartingTimeforTimer() {
  const seconds = new Date().getSeconds();
  const minutes = new Date().getMinutes();
  const hours = new Date().getHours();
  const startingTime = { seconds, minutes, hours };
  return startingTime;
}

/**
 * format single digit number to two digit string
 * @param {*} number
 * @returns changed number as string or unchanged number as number
 */
function formatSingleDigit(number) {
  if (number < 10) {
    return "0" + number;
  }
  return number;
}

/*********************************************************************/
/**STORAGE & BACKEND*/

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
