import os
import socket
import time
from flask import Flask
from flask import render_template


class Scoreboard:

    def __init__(self, db):
        self.db = db
        self.app = Flask(__name__)


    def start(self):
        @self.app.route("/")
        def index():
            scoreboard = self.db.scoreboard.find()
            sc = {}
            color = {'UP':'success', 'DOWN':'danger', 'CORRUPT':'warning' ,'MUMBLE':'info'}
            for item in scoreboard:

            	if item['team']['name'] not in sc:
            	   	sc[item['team']['name']] = {}

            	sc[item['team']['name']][item['service']['name']] = {
            		'status': item['status']
            	}
            print(sc)
            return render_template('index.html', scoreboard=sc, color=color)

        self.app.debug = True
        self.app.run()
#
# def send_answer(conn, status='200 OK', typ='text/html; charset=utf-8', data=''):
# 	data = data.encode('utf-8')
# 	conn.send(b'HTTP/1.1 ' + status.encode('utf-8') + b'\r\n')
# 	conn.send(b'Server: simplehttp\r\n')
# 	conn.send(b'Connection: close\r\n')
# 	conn.send(b'Content-Type: ' + typ.encode('utf-8') + b'\r\n')
# 	conn.send(b'Content-Length: ' + bytes(len(data)) + b'\r\n')
# 	conn.send(b'\r\n')
# 	conn.send(data)
#
# data = {
# 	'score': 124
# }
#
# def getIndex():
# 	with open('index.html', 'r') as file:
# 		content = file.read()
# 		return content.format(**data)
#
#
# def get_on(conn, addr):
# 	send_answer(conn, data=getIndex())
#
#
#
# s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# s.bind(('', 8000))
# s.listen(10000)
#
#
# try:
# 	while 1:
# 		conn, addr = s.accept()
# 		print('New connection from ' + addr[0])
# 		try:
# 			get_on(conn, addr)
# 		except:
# 			send_answer(conn, '500 Internal Server Error', data='<center><h1>500 Internal Server Error</h1></center>')
# 		finally:
# 			conn.close()
# finally: s.close()
