from flask import Flask
from flask import render_template

import pymongo

class Scoreboard:

    def __init__(self, db):
        self.db = db
        self.app = Flask(__name__)


    def sort_team(self, service):
        count = 0
        team_name, services = service

        for service in services:
            count += int(services[service]['attack']) + int(services[service]['defense'])

        print(team_name + str(count))
        return count

    """ Seee http://flask.pocoo.org/docs/0.10/tutorial/dbcon/#tutorial-dbcon """
    def start(self):
        @self.app.route("/")
        def index():
            scoreboard = self.db.scoreboard.find()

            if scoreboard.count() == 0:
                # Хотелось бы добавить сюда время начала соревнований
                return render_template('game_not_started.html')

            sc = {}
            teams = {}

            color = {'UP':'success', 'DOWN':'danger', 'CORRUPT':'warning' ,'MUMBLE':'info'}

            for item in scoreboard:
                if item['team']['name'] not in sc:
                        sc[item['team']['name']] = {}
                        teams[item['team']['name']] = item['team']

                sc[item['team']['name']][item['service']['name']] = {
                    'status': item['status'],
                    'message': str(item['message']),
                    'attack': str(item['attack']),
                    'defense': str(item['defense']),
                    'up_round': str(item['up_round'])
                }

            sc = sorted(sc.items(), key=self.sort_team)
            # print(sorted(map(lambda )))
            round = self.db.flags.find().sort([ ('round', pymongo.DESCENDING) ]).limit(1)[0]['round']

            return render_template('index.html',
                scoreboard=sc,
                color=color,
                teams=teams
                                   ,
                round=round
            )
        self.app.debug = True
        self.app.run(host="0.0.0.0", port=2605)