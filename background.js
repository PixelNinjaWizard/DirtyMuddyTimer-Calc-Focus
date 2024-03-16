  let countdownTimer;
  let endTime; // Storing the end time for resume functionality & processing

  chrome.runtime.onInstalled.addListener(() => {
      console.log('Extension installed');
      chrome.storage.local.set({ isTimerRunning: false, timerEndTime: null });
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.command) {
          case "startTimer":
              startTimer(message.duration);
              sendResponse({ message: "Timer started" });
              break;
          case "pauseTimer":
              pauseTimer();
              sendResponse({ message: "Timer paused" });
              break;
          case "resumeTimer":
              resumeTimer();
              sendResponse({ message: "Timer resumed" });
              break;
          default:
              sendResponse({ message: "Unknown command" });
      }
      return true; // Add asynchronous response - may change this
  });

  function startTimer(duration) {
      clearTimeout(countdownTimer);
      endTime = Date.now() + duration * 60000;
      updateTimerState(true, endTime);
      countdownTimer = setTimeout(finishTimer, duration * 60000);
  }

  function pauseTimer() {
      clearTimeout(countdownTimer);
      updateTimerState(false, endTime);
  }

  function resumeTimer() {
      chrome.storage.local.get(['timerEndTime'], function(data) {
          if (data && data.timerEndTime) {
              const remainingTime = data.timerEndTime - Date.now();
              if (remainingTime > 0) {
                  startTimer(remainingTime / 60000);
              } else {
                  finishTimer();
              }
          }
      });
  }

  function finishTimer() {
      notify("Timer Done", "Your timer has finished!");
      updateTimerState(false, null);
  }

  function notify(title, message) {
      chrome.notifications.create('', {
          title: title,
          message: message,
          iconUrl: 'icons/icon48.png',
          type: 'basic'
      });
  }

  function updateTimerState(isRunning, timerEndTime) {
      chrome.storage.local.set({ isTimerRunning: isRunning, timerEndTime: timerEndTime });
  }