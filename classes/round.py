__author__ = 'dmitry'

from functions import ConsoleColors as colors
from classes.checker import Checker
import random
import string
import time
import threading

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
        self.teams = config.teams
        self.services = config.services
        self.tasks = []
        self.checker = Checker()


    def next(self):
        self.summary_statistic()

        self.round_count += 1
        self.tasks = []
        print('Round: ' + str(self.round_count))
        sc = self.db.scoreboard.find()

        for team in self.teams:
            print(team['name'])

            for service in self.services:
                # TODO: make async call
                self.tasks.append(threading.Thread(target=self.to_service, args=(team, service, )))
                self.tasks[-1].daemon = True
                self.tasks[-1].start()
                # self.to_service(team, service)

        for e, j in enumerate(self.tasks):
            j.join(timeout=2)

    def summary_statistic(self):
        for team in self.teams:
            for service in self.services:
                count_attack = self.db.stolen_flags.find({
                    'team._id': team['_id'],
                    'flag.service._id': service['_id'],
                    'round': self.round_count
                }).count()

                count_defense = self.db.flags.find({
                    'team._id': team['_id'],
                    'service._id': service['_id'],
                    'round': self.round_count,
                    'stolen': False
                }).count()

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
        print (flag)
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

        path = self.path_to_checkers + self.filename_checkers + '_' + str(service['_id'])

        try:
            self.checker.check(team['host'], path)

            print('check - ok')

            self.checker.put(team['host'], path, flag, flag_id)

            print('put - ok')
            self.checker.get(team['host'], path, flag, flag_id)

            # TODO: make 2 get for old flag

            self.update_scoreboard(team, service, 101)

        except Exception as error:
            print('------------------------------------------------------')
            print(colors.FAIL + 'ERROR in service ' + str(service['name']) + ' for team ' + team['name'] + colors.ENDC)
            code, message = error.args
            print(code)
            print(message)
            self.update_scoreboard(team, service, code, message)
            print('------------------------ END ---------------------------')

    def update_scoreboard(self, team, service, status_code, message=''):
        codes = {
            101: 'UP',
            102: 'CORRUPT',
            103: 'MUMBLE',
            104: 'DOWN'
        }
        
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
