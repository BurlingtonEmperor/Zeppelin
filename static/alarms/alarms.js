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

// warnings
let warningArray = [];
let warningChangeArray = [];

const warningDOM = document.getElementById("warnings");

function checkIfWarningExists (warningNum) {
  for (let i = 0; i < warningArray.length; i++) {
    if (parseInt(warningArray[i]) == warningNum) {
      return true;
    }
  }
  return false;
}

function removeWarning (warningNum) {
  let remove_warning_warning_num = warningNum;
  if (checkIfWarningExists(remove_warning_warning_num)) {
    if (warningArray.length < 2) {
      warningArray = [];
    }

    else {
      const last_storage = warningArray[warningArray.length - 1];
      let deletion_storage;
      for (let i = 0; i < warningArray.length; i++) {
        if (parseInt(warningArray[i]) == remove_warning_warning_num) {
          deletion_storage = i;
        }
      }

      let deletion_storage2 = warningArray[deletion_storage];
      warningArray[deletion_storage] = last_storage;
      warningArray[warningArray.length - 1] = deletion_storage2;

      warningArray.pop();
    }
  }
}

function throwWarning (warningNum) {
  let throw_warning_warning_num = warningNum;
  if (checkIfWarningExists(throw_warning_warning_num)) {
    return false;
  }

  warningArray.push(throw_warning_warning_num);
}

function generateWarningDOM () {
  warningDOM.innerHTML = "";
  function makeDOM_WarningMSG (warningMessage) {
    warningDOM.innerHTML += "<div class='warning text'>" + String(warningMessage) + "</div>";
  }

  for (let i = 0; i < warningArray.length; i++) {
    switch (parseInt(warningArray[i])) {
      case 0:
        makeDOM_WarningMSG("NO HARDWARE COMMUNICATION");
        break;
      case 1:
        makeDOM_WarningMSG("HARDWARE CONNECTION LOST");
        break;
    }
  }
}