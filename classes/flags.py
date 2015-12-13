#!/usr/bin/env python
# -*- coding: utf-8 -*-

import multiprocessing
import socket, json, sys, time
from classes.round import Round
from urllib.request import urlopen
from functions import ConsoleColors as colors




class Flags:
	def __init__(self, db):
		self.db = db
		try:
			response = urlopen("http://api.keva.su/method/jury.get").read().decode('utf8')
		except Exception:
			print(colors.FAIL + 'Error with requests in response' + colors.ENDC)
			sys.exit(0)

		data = json.loads(response)

		try:
			lifetime = data["response"]["settings"]["flags"]["lifetime"]
			round_length = data["response"]["settings"]["round_length"]
		except Exception:
			print(colors.FAIL + 'Error with parse in response' + colors.ENDC)
			sys.exit(0)
		self.life = lifetime*round_length

	def start(self):
		self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		self.socket.bind(('0.0.0.0', 9090))
		self.socket.listen(1)

		while True:
			conn, address = self.socket.accept()
			print('connected:', address) # Возможно лишнее!!!
			process = multiprocessing.Process(target=self.recv, args=(conn, address))
			process.daemon = True
			process.start()

	def recv(self, connection, address):
		team = self.db.teams.find_one({'host': address[0]})

		if not bool(team):
				connection.send(('Who are you?\n Goodbye\n').encode())
				connection.close()
		else:		

			connection.send(('hello team ' + team["name"] + '\n').encode())

			while True:
				data = connection.recv(1024)
				data = str(data.rstrip().decode('utf-8'))

				flag = self.db.flags.find_one({'flag': data})
				if not bool(flag):
					connection.send(('not found\n').encode())
					continue

				if flag['team']['name'] == team["name"]:
					connection.send(('It`s your flag, fox\n').encode())
					continue

				realtime = time.time()
				self.life = self.life+flag["timestamp"]
				if self.life <= realtime:
					connection.send(('this flag is too old\n').encode())
					continue

				# status = self.db.scoreboard.find_one({ 
				# 	'team': team, 
				# 	'service': {
				# 		'name': flag['service']['name']
				# 	}
				# })				
				# if status["status"] != 'up':
				# 	connection.send(('Up this service & try again later\n').encode())

				connection.send(('recived\n').encode())

			connection.close()
			return True
		# except:
		# 	print('Something went wrong')
		# 	connection.close()