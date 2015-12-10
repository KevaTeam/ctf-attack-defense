#!/usr/bin/env python
# -*- coding: utf-8 -*-

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

	def recv(self):
		# try:
		sock = socket.socket()
		sock.bind(('', 9090))
		sock.listen(10)
		self.conn, self.addr = sock.accept()

		print('connected:', self.addr) # Возможно лишнее!!!
		
		team = self.db.teams.find_one({'host': self.addr[0]})

		if not bool(team):
				self.conn.send(('Who are you?\n Goodbye\n').encode())
				self.conn.close()
		else:		

			self.conn.send(('hello team ' + team["name"] + '\n').encode())

			while True:
				data = self.conn.recv(1024)
				data = str(data.rstrip().decode('utf-8'))

				flag = self.db.flags.find_one({'flag': data})
				if not bool(flag):
					self.conn.send(('not found\n').encode())
					continue

				if flag['team']['name'] == team["name"]:
					self.conn.send(('It`s your flag, fox\n').encode())
					continue

				realtime = time.time()
				self.life = self.life+flag["timestamp"]
				if self.life <= realtime:
					self.conn.send(('this flag is too old\n').encode())
					continue

				# status = self.db.scoreboard.find_one({ 
				# 	'team': team, 
				# 	'service': {
				# 		'name': flag['service']['name']
				# 	}
				# })				
				# if status["status"] != 'up':
				# 	self.conn.send(('Up this service & try again later\n').encode())

				self.conn.send(('recived\n').encode())

			self.conn.close()
			return True
		# except:
		# 	print('Something went wrong')
		# 	self.conn.close()