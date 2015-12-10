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

		api = json.loads(response)

		try:
			self.lifetime = data["response"]["flags"]["lifetime"]
			self.round_lenght = data["response"]["round_lenght"]
		except Exception:
			print(colors.FAIL + 'Error with parse in response' + colors.ENDC)
			sys.exit(0)
		life = self.lifetime*self.round_lenght


	def recv(self):
		sock = socket.socket()
		sock.bind(('', 9090))
		sock.listen(1)
		conn, addr = sock.accept()

		print ('connected:', addr) # Возможно лишнее

		while True:
				data = conn.recv(1024)
				data = str(data.rstrip().decode('utf-8'))
				print (data)                                #Лишнее
				# print (self.lifetime)		#Lishnee
				# print (self.round_lenght)	#lishnee
				time = time.time()
				# print (time)
				data1 = self.db.flags.find({'flag': data})
				print(data1.count())
				if data1.count():
					lt = data1.get(timestamp)
					lt = lt+life
					if lt <= time:
						conn.send(('received\n').encode())
				else:
					conn.send(('not found\n').encode())
				for e in data1: #ЛИШНЕЕ
					print (e)
		return data

		conn.close()
