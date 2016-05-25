__author__ = 'dmitry'

from functions import ConsoleColors as colors
from functions import Message
from classes.checker import Checker
import random
import string
import time
import threading
import pymongo

class Round:
    db = {}
    teams = {}
    services = {}

    flags = {}

    round_count = 0

    path_to_checkers = 'checkers/'

    filename_checkers = 'check'

    def __init__(self, db, config):
        self.db = db
        self.teams = config['teams']
        self.services = config['services']
        self.tasks = []
        self.checker = Checker()
        self.status_service = {}

        self.round_count = self.db.flags.find().sort([ ('round', pymongo.DESCENDING) ]).limit(1)
        print(self.round_count)
        self.round_count = self.round_count[0]['round'] if self.round_count.count() else 0


    def next(self):
        self.summary_statistic()

        self.round_count += 1
        self.tasks = []
        print('Round: ' + str(self.round_count))

        for team in self.teams:
            for service in self.services:
                # TODO: make async call

                self.tasks.append(threading.Thread(name=team['name'] + ' ' + service['name'], target=self.to_service, args=(team, service, )))
                self.tasks[-1].daemon = True
                self.tasks[-1].start()
                # self.to_service(team, service)

        for e, j in enumerate(self.tasks):
            j.join(timeout=1)

    def summary_statistic(self):
        for team in self.teams:
            for service in self.services:
                count_attack = self.db.stolen_flags.find({
                    'team._id': team['_id'],
                    'flag.service._id': service['_id'],
                    'round': self.round_count
                }).count()

                if team['name'] + '_' + service['name'] in self.status_service and self.status_service[team['name'] + '_' + service['name']] == 101:
                    count_defense = self.db.flags.find({
                        'team._id': team['_id'],
                        'service._id': service['_id'],
                        'round': self.round_count,
                        'stolen': False
                    }).count()
                else:
                    count_defense = 0

                self.db.scoreboard.update_one(
                    {
                        'team._id': team['_id'],
                        'service._id': service['_id']
                    },
                    {
                        '$inc': {
                            'attack': count_attack,
                            'defense': count_defense
                        }
                    }
                )

    def generate_flags(self):
        return ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for x in range(33))

    def generate_flag_ids(self):
        return ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for x in range(10))

    def to_service(self, team, service):
        flag = self.generate_flags()
        flag_id = self.generate_flag_ids()
        print (team['name'] + ' ' + service['name'] + ' ' + flag)
        #print (flag_id)
        self.db.flags.insert_one({
            'round': self.round_count,
            'team': team,
            'service': service,
            'flag': flag,
            'flag_id': flag_id,
            'stolen': False,
            'timestamp': time.time()
        })

        path = self.path_to_checkers + service['name'] + '/' + self.filename_checkers

        action = ''
        try:
            action = 'check'
            self.checker.check(team['host'], path)

            action = 'put'
            self.checker.put(team['host'], path, flag, flag_id)

            action = 'get'
            self.checker.get(team['host'], path, flag, flag_id)

            self.update_scoreboard(team, service, 101)

        except Exception as error:
            code, message = error.args

            Message.fail(team['name'] + ' ' + service['name'] + ' ' + action + ' => error (message: ' + str(message) + ')')
            self.update_scoreboard(team, service, code, message)

    def update_scoreboard(self, team, service, status_code, message=''):
        codes = {
            101: 'UP',
            102: 'CORRUPT',
            103: 'MUMBLE',
            104: 'DOWN'
        }

        self.status_service[team['name'] + '_' + service['name']] = status_code

        if status_code not in codes:
            Message.fail(service['name'] + ' checker is not valid')
            exit(0)

        self.db.scoreboard.update_one(
            {
                'team._id': team['_id'],
                'service._id': service['_id']
            },
            {
                "$set": {
                    "status": codes[status_code],
                    'message': message
                },
                '$inc': {
                    'up_round': 1 if status_code == 101 else 0
                }
            }
        )
