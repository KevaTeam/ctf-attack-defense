#!/usr/bin/env python
# -*- coding: utf-8 -*-

import socket
from classes.round import Round

class Flags:
	def __init__(self, db):
		self.db = db


	def recv(self):
		sock = socket.socket()
		sock.bind(('', 9090))
		sock.listen(1)
		conn, addr = sock.accept()

		print ('connected:', addr)
		#s = 'close'
		while True:
				data = conn.recv(1024)
				print (data)
				data1 = self.db.flags.find({"flag": data})
				for e in data1:
					print (e)
				#print (data1)
      # if data == s:
      #  conn.send(('goodbye').encode())
      #  break
				conn.send(('received\n').encode())
		return data

		conn.close()
