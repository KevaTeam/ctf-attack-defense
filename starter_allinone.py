#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import subprocess
import os
import subprocess
from time import sleep
import json
import psutil
import datetime
import threading

pids = {
	'pid_start' : 0,
	'pid_flags' : 0,
	'pid_scoreboard' : 0,
}

pid_start = 0
pid_flags = 0
pid_scoreboard = 0

directory = "starter_allinone.d"

if not os.path.exists(directory):
    os.makedirs(directory)

def save_pids():
	with open(directory + "/pids.json", 'w') as outfile:
		json.dump(pids, outfile)

if os.path.isfile(directory + "/pids.json"):
	with open(directory + "/pids.json") as data_file:    
		pids = json.load(data_file)
else:
	save_pids();
	
logfile = open(directory + "/allinone.log", "w")

def processIsRun(pid):
	return True

def printMessage(command, s):
	s2 = command + ": [" + str(datetime.datetime.now()) + "] " + s
	logfile.write(s2 + "\n");
	print(s2)

def tee_pipe(command, pipe):
	for line in pipe:
		printMessage(command, line.decode("utf-8").strip())

threads = {}
processes = {}

def checkAndRun(command):
	if pids['pid_' + command] == 0:
		processes[command] = subprocess.Popen(["python3", "main.py", command], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
		pids['pid_' + command] = processes[command].pid
		threads[command + 'pipeout'] = threading.Thread(target=tee_pipe, args=(command, processes[command].stdout))
		threads[command + 'pipeout'].start();
		threads[command + 'pipeerr'] = threading.Thread(target=tee_pipe, args=(command, processes[command].stderr))
		threads[command + 'pipeerr'].start();
		
		printMessage("","Up 'main.py " + command + "' => " + str(pids['pid_' + command]))
		print(processes[command].poll())
		save_pids()
	else:
		if not psutil.pid_exists(pids['pid_' + command]):
			printMessage("", "Not found 'main.py " + command + "' => " + str(pids['pid_' + command]))
			pids['pid_' + command] = 0
			save_pids()
		else:
			p = processes[command].poll() # need for kill zombie
			# print(str(pids['pid_' + command]) + ' exists ' + str(p))

while True:
	# print("123 === ")
	checkAndRun('start');
	checkAndRun('flags');
	checkAndRun('scoreboard');
	sleep(5) # every 30 seconds check and try run
