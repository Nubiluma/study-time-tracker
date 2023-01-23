class Timer {
  constructor(seconds, minutes, hours, date) {
    this.seconds = seconds;
    this.minutes = minutes;
    this.hours = hours;
    this.date = date;
  }
}

const timerMarkupElement = document.querySelector("#timer");
const startBtn = document.querySelector("#btnStartTimer");
const pauseBtn = document.querySelector("#btnPauseTimer");
const resetBtn = document.querySelector("#btnResetTimer");
const pastTimerContainer = document.querySelector("#pastTimerContainer");
const pastTimerList = document.querySelector("#pastTimerList");
const activeTimerContainer = document.querySelector("#activeTimerContainer");

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
    state.activeTimer = new Timer(0, 0, 0, formatDate(new Date()));
  } else if (!isActiveTimerDateToday()) {
    createNotificationForUserFeedback();
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
    createNotificationForUserFeedback();
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
    createNotificationForUserFeedback();
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
  removeNotification();
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
  removeNotification();
  startBtn.disabled = false;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
}

/**
 * cancel-button clicked
 * do not do anything with active timer, only delete notification markup element from dom
 */
function cancelAction() {
  removeNotification();
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

function renderPastTimers() {
  pastTimerList.innerHTML = "";

  for (const timer of state.savedTimers) {
    createMarkupForPastTimerList(timer);
  }
}

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
 * create markup for user to decide what to do with active timer
 * let user choose to save, dismiss or cancel decision
 */
function createNotificationForUserFeedback() {
  startBtn.disabled = true;
  pauseBtn.disabled = true;
  resetBtn.disabled = true;

  const notificationBlur = document.createElement("div");
  notificationBlur.id = "notificationBlur";
  notificationBlur.classList.add("blur");

  const notificationContainer = document.createElement("aside");
  notificationContainer.classList.add("notification");
  const notification = document.createElement("p");
  notificationContainer.id = "notification";
  const msg = document.createTextNode(
    "Do you want to save the timer's progress?"
  );
  notification.appendChild(msg);
  const saveBtn = document.createElement("button");
  saveBtn.classList.add("notification-buttons");
  const saveBtnTxt = document.createTextNode("Save");
  saveBtn.appendChild(saveBtnTxt);
  const dismissBtn = document.createElement("button");
  dismissBtn.classList.add("notification-buttons");
  const dismissBtnTxt = document.createTextNode("Dismiss");
  dismissBtn.appendChild(dismissBtnTxt);
  const cancelBtn = document.createElement("button");
  cancelBtn.classList.add("notification-buttons");
  const cancelBtnTxt = document.createTextNode("Cancel");
  cancelBtn.appendChild(cancelBtnTxt);

  saveBtn.addEventListener("click", saveAction);
  dismissBtn.addEventListener("click", dismissAction);
  cancelBtn.addEventListener("click", cancelAction);

  notificationContainer.appendChild(notification);
  notificationContainer.appendChild(saveBtn);
  notificationContainer.appendChild(dismissBtn);
  notificationContainer.appendChild(cancelBtn);

  document
    .querySelector("body")
    .insertBefore(notificationBlur, document.querySelector("main"));
  document.querySelector("main").appendChild(notificationContainer);
}

function removeNotification() {
  const notification = document.querySelector("#notification");
  const blur = document.querySelector("#notificationBlur");
  notification.remove();
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
 * @param {*} activeTimer active timer
 * @param {*} savedTimer saved timer from array
 * @returns accounted sum of activeTimer and savedTimer as savedTimer
 */
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
