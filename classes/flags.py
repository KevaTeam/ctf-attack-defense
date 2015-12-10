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

		print('connected:', self.addr) # Возможно лишнее
		
		print(self.addr[0])
		team = self.db.teams.find_one({'host': self.addr[0]})
		print(team)
		if not bool(team):
				self.conn.send(('Who are you?\n Goodbye\n').encode())
				self.conn.close()
		else:		
			komanda = team["name"]
			self.conn.send(('hello team ' + komanda + '\n').encode())

			while True:
				data = self.conn.recv(1024)
				data = str(data.rstrip().decode('utf-8'))
				print (data)                                #Лишнее
				data1 = self.db.flags.find_one({'flag': data})
				print(bool(data1))

				if not bool(data1):
					self.conn.send(('not found\n').encode())
					continue


				vremia = time.time()
				print(team)
				print(data1['service'])
				data2 = self.db.scoreboard.find_one({ 
					'team': team, 
					'service': {
						'name': data1['service']['name']
					}
				})

				print(data2)
				status = data2["status"]
				if status == 'up':
					whose = data1['team']
					if whose != komanda:
						print(data2)
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
					else:
						self.conn.send(('It`s your flag, fox\n').encode())
				else:
					self.conn.send(('your service don`t up\n').encode())

			self.conn.close()
			return True
		# except:
		# 	print('Something went wrong')
		# 	self.conn.close()