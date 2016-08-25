__author__ = 'dmitry'

from config.main import CHECKER_METHOD
from functions import Message

from classes.checker.main import Checker
from classes.checker.queue import Queue
from classes.checker.threads import Threads
from classes.statistic import Statistic
from classes.config.get import ConfigGet

import random
import string
import time
import pymongo
import pika

class Round:
    db = {}

    round_count = 0

    path_to_checkers = 'checkers/'

    filename_checkers = 'check'

    def __init__(self, db):
        self.db = db
        self.config = ConfigGet(db)
        self.config.get_all()

        self.statistic = Statistic(self.db, self.config)
        self.checker = Checker()

        self.status_service = {}

        if CHECKER_METHOD == 'queue':
            self.checkerManager = Queue()
        else:
            self.checkerManager = Threads()

        self.round_count = self.db.flags.find().sort([ ('round', pymongo.DESCENDING) ]).limit(1)
        print(self.round_count)
        self.round_count = self.round_count[0]['round'] if self.round_count.count() else 0


    def next(self):
        self.statistic.summary(self.round_count, self.status_service)

        self.round_count += 1
        self.tasks = []
        print('Round: ' + str(self.round_count))

        for team in self.config.teams:
            for service in self.config.services:
                flag = self.generate_flags()
                flag_id = self.generate_flag_ids()

                print(team['name'] + ' ' + service['name'] + ' ' + flag)

                self.checkerManager.put(
                    team = team,
                    service = service,
                    flag = flag,
                    flag_id = flag_id
                )



    def generate_flags(self):
        return ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for x in range(33))

    def generate_flag_ids(self):
        return ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for x in range(10))

    def to_service(self, team, service, flag, flag_id):
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

    def set_queue(self, team, service):
        pass

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
