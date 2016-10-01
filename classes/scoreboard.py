from flask import Flask
from flask import render_template
from flask import jsonify
from flask import request

import pymongo
import json


class Scoreboard:

    def __init__(self, db):
        self.db = db

        self.app = Flask(__name__)

    def sort_team(self, service):
        count = 0
        team_name, services = service
	
        for service in services:
            count += round((services[service]['uptime'] * (int(services[service]['attack']) + int(services[service]['defense'])) * 0.01), 2) 
            #count += int(services[service]['attack']) + int(services[service]['defense'])


        return count
    def sort_service(self, service):
        print('service')
        print(service)
        return 1
    """ Seee http://flask.pocoo.org/docs/0.10/tutorial/dbcon/#tutorial-dbcon """
    def start(self):
        @self.app.route("/")
        def index():
            try:
                scoreboard = self.db.scoreboard.find()

                if scoreboard.count() == 0:
                    # Хотелось бы добавить сюда время начала соревнований
                    return render_template('game_not_started.html')

                sc = {}
                teams = {}

                color = {'UP':'success', 'DOWN':'danger', 'CORRUPT':'warning' ,'MUMBLE':'info'}

                visitor_team = self.db.teams.find_one({'host': request.remote_addr})
                if visitor_team == None:
                    visitor_team = {'_id': ''}

                count_round = self.db.flags.find().sort([ ('round', pymongo.DESCENDING) ]).limit(1)[0]['round']

                for item in scoreboard:
                    team_name = item['team']['name']
                    if team_name not in sc:
                        sc[team_name] = {}
                        teams[team_name] = item['team']
                        teams[team_name]['score'] = 0

                    sc[team_name][item['service']['name']] = {
                        'status': item['status'],
                        'own': item['team']['_id'] == visitor_team['_id'],
                        'message': item['message'],
                        'attack': str(item['attack']),
                        'defense': str(item['defense']),
                        'up_round': int(item['up_round']),
                        'uptime': (item['up_round'] / count_round) * 100
                    }
                    uptime = (item['up_round'] / count_round) * 100

                    teams[team_name]['score'] += round((uptime * (item['attack'] + item['defense']) * 0.01), 2)
                    teams[team_name]['score'] = round(teams[team_name]['score'], 2)

                sc = sorted(sc.items(), key=self.sort_team)[::-1]
		

                return render_template('index.html',
                                       scoreboard=sc,
                                       color=color,
                                       teams=teams,
                                       round=count_round,
                                       services={'history':{}, 'crypto-inc':{}, 'support':{}, 'loogles':{}, 'runaway': {} }
                                       )
            except Exception:
                return render_template('is_not_avialable.html')

        @self.app.route('/api/rating')
        def api_rating():
            #try:
                scoreboard = self.db.scoreboard.find()

                if scoreboard.count() == 0:
                    # Хотелось бы добавить сюда время начала соревнований
                    return render_template('game_not_started.html')

                sc = {}
                teams = {}

                color = {'UP':'success', 'DOWN':'danger', 'CORRUPT':'warning' ,'MUMBLE':'info'}

                visitor_team = self.db.teams.find_one({'host': request.remote_addr})
                if visitor_team == None:
                    visitor_team = {'_id': ''}

                count_round = self.db.flags.find().sort([ ('round', pymongo.DESCENDING) ]).limit(1)[0]['round']

                for item in scoreboard:
                    team_name = item['team']['name']
                    if team_name not in sc:
                        sc[team_name] = {}
                        teams[team_name] = item['team']
                        teams[team_name]['score'] = 0

                    sc[team_name][item['service']['name']] = {
                        'status': item['status'],
                        'own': item['team']['_id'] == visitor_team['_id'],
                        'message': item['message'],
                        'attack': str(item['attack']),
                        'defense': str(item['defense']),
                        'up_round': int(item['up_round']),
                        'uptime': (item['up_round'] / count_round) * 100
                    }
                    uptime = (item['up_round'] / count_round) * 100

                    teams[team_name]['score'] += round((uptime * (item['attack'] + item['defense']) * 0.01), 2)
                    teams[team_name]['score'] = round(teams[team_name]['score'], 2)

                sc = sorted(sc.items(), key=self.sort_team)[::-1]
                for i,a in enumerate(sc):
                    print(str(i))
                    #sc[i] = sorted(sc[i].items(), key=self.sort_service)
                    

                #print(sc)
                return render_template('index.html',
                                       scoreboard=sc,
                                       color=color,
                                       teams=teams,
                                       round=count_round
                                       )
            #except Exception as e:
                #print(e)
                #return render_template('is_not_avialable.html')

        self.app.debug = True
        self.app.run(host="0.0.0.0", port=9000, threaded=True)
