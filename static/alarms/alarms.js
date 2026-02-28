function playAlarm (alarmNum) {
  let alarmPath;
  switch (alarmNum) {
    case 0:
      alarmPath = "/static/alarms/altitude.mp3";
      break;
  }

  const audio = new Audio(alarmPath);
  audio.play();
}