const socket = io();

function streamServerData () {
  socket.emit("check_server_connection", {test : "check to see if server is up"}, (response) => {
    if (response.continue) {
      streamServerData();
    }
  });
}

let prev_connection_data = "None";
function streamConnectionData () {
  let payload = {
    vendor_id : "0x2341"
  };
    
  socket.emit("check_board_connection", payload, (response) => {
    if (response.continue) {
      generateWarningDOM();
      streamConnectionData();
    }
    
    prev_connection_data = response.status;
    switch (response.status) {
      case "None":
        if (prev_connection_data == response.status) {
          throwWarning(0);
        }

        else {
          throwWarning(1);
        }
        break;
      default:
        removeWarning(0);
        removeWarning(1);
        break;
    }
  });
}

streamConnectionData();
streamServerData();