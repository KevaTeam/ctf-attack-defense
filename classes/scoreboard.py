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
        self.app.run(host="0.0.0.0", port=2205)