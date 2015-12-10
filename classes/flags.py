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
		sock.listen(1)
		self.conn, self.addr = sock.accept()

		print('connected:', self.addr) # Возможно лишнее
		

		while True:
				print(self.addr[0])
				team = self.db.teams.find({'host': self.addr[0]})
				if not bool(team):
					self.conn.send(('Who are you?\n Goodbye').encode())
					self.conn.close()
				else:
					ip = self.addr[0]
					self.conn.send(('hello team ' + ip).encode())
					data = self.conn.recv(1024)
					data = str(data.rstrip().decode('utf-8'))
					print (data)                                #Лишнее
					vremia = time.time()
					data1 = self.db.flags.find_one({'flag': data})
					data2 = self.db.scoarboard.find_one
					print(data1)
					print(bool(data1))
					if bool(data1):
						lt = data1["timestamp"]
						lt = lt+self.life
						if lt >= vremia:
							self.conn.send(('received\n').encode())
						else:
							self.conn.send(('your flag is too old\n').encode())
					else:
						self.conn.send(('not found\n').encode())

		self.conn.close()
		return data
		# except:
		# 	print('Something went wrong')
		# 	self.conn.close()