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
		self.conn, addr = sock.accept()

		print('connected:', addr) # Возможно лишнее
		

		while True:
				data = self.conn.recv(1024)
				data = str(data.rstrip().decode('utf-8'))
				print (data)                                #Лишнее
				# print (self.lifetime)		#Lishnee
				# print (self.round_length)	#lishnee
				vremia = time.time()
				# print (time)
				data1 = self.db.flags.find_one({'flag': data})
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