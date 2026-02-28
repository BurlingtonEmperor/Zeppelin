from flask import Flask, render_template, request, jsonify;
from flask_socketio import SocketIO, emit;

from threading import Timer;

import webbrowser;
import requests;
import time;
import os;

import serial.tools.list_ports;
import serial;

URL = "http://127.0.0.1:8080"
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

def main_board_find (vendor_id):
  arduino_port = None
  ports = serial.tools.list_ports.comports()

  for port in ports:
    if port.vid == vendor_id:
      arduino_port = port.device
      break
    elif 'Arduino' in port.description:
      arduino_port = port.device
      break
    
  if not arduino_port:
    return None
    
  return arduino_port

@app.route('/')
def index():
  return render_template("index.html")

@app.route('/afind_board', methods=['POST'])
def afind_board():
  afind_board_data = request.get_json()
  custom_vendor_id = afind_board_data.get("vendor_id")
  
  return str(alternate_board_find(custom_vendor_id))

@app.route('/send_signal_to_board', methods=['POST'])
def send_signal_to_board():
  signal_to_send = request.get_json()
  final_signal_to_send = signal_to_send.get("signal_num")

  curr_port = signal_to_send.get("board_porter")
  curr_rate = signal_to_send.get("baud_rater")

  board = connect_to_board_precheck(curr_port, curr_rate)

  board.write(final_signal_to_send.encode('utf-8'))
  return "sent"

@app.route('/read_signal_from_board', methods=['POST'])
def read_signal_from_board():
  signal_to_send = request.get_json()
  curr_port = signal_to_send.get("board_porter")
  curr_rate = signal_to_send.get("baud_rater")

  try:
    board = connect_to_board_precheck(curr_port, curr_rate)

    if (board.in_waiting > 0):
      try:
        raw_data = board.readline()
        data = raw_data.decode('utf-8').strip()
        
        if (data):
          return data
      except Exception as e:
        return ("Encountered an error: " + e)
    else:
      return "nothing"
  except:
    return "nothing"

@app.route('/create_log_auto', methods=['POST'])
def create_log_auto():
  signal_to_read = request.get_json()
  log_data_au = signal_to_read.get("log_data")
    
  lines = log_data_au
    
  timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
  filename = f"autoclave_log_{timestamp}.txt"
  foldername = "logs"

  os.makedirs(foldername, exist_ok=True)
  file_path = os.path.join(foldername, filename)

  try:
    with open(file_path, "w") as f:
      for line in lines:
        f.write(line + "\n")
      return "Created log as " + file_path
  except Exception as err:
    return f"File Error: {str(err)}"

@app.route('/exit_system')
def exit_system():
  func = request.environ.get('werkzeug.server.shutdown')
  if func is None:
    os.kill(os.getpid(), signal.SIGINT)
  func()

def open_browser():
  webbrowser.open_new(URL)

if __name__ == '__main__':
  Timer(1, open_browser).start()
    
  # app.run(port=8080, debug=True, use_reloader=False)
  socketio.run(app, port=8080, debug=True, use_reloader=False)