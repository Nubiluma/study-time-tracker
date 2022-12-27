class Timer {
  constructor(seconds, minutes, hours, isStopped) {
    this.seconds = seconds;
    this.minutes = minutes;
    this.hours = hours;
    this.isStopped = isStopped;
  }
}

const timerSeconds = document.getElementById("timerSeconds");
const timerMinutes = document.getElementById("timerMinutes");
const timerHours = document.getElementById("timerHours");
const startBtn = document.getElementById("btnStartTimer");
const pauseBtn = document.getElementById("btnPauseTimer");
const resetBtn = document.getElementById("btnResetTimer");

const state = {
  timer: [],
};

startBtn.addEventListener("click", startTimer);

function startTimer() {
  const timer = new Timer(0, 0, 0, true);
  setInterval(() => {
    timer.seconds++;
    if (timer.seconds === 60) {
      timer.seconds = 0;
      timer.minutes++;
      if (timer.minutes === 60) {
        timer.minutes = 0;
        timer.hours++;
      }
    }

    if (timer.seconds < 10) {
      timerSeconds.innerText = "0" + timer.seconds;
    } else {
      timerSeconds.innerText = timer.seconds;
    }
    if (timer.minutes < 10) {
      timerMinutes.innerText = "0" + timer.minutes;
    } else {
      timerMinutes.innerText = timer.minutes;
    }
    if (timer.hours < 10) {
      timerHours.innerText = "0" + timer.hours;
    } else {
      timerHours.innerText = timer.hours;
    }
  }, 1000);
}

function pauseTimer() {}
