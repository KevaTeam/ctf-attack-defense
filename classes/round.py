__author__ = 'dmitry'

from functions import ConsoleColors as colors
from classes.checker import Checker
import random
import string
import time

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

        self.checker = Checker()


    def next(self):
        self.round_count += 1

        print('Round: ' + str(self.round_count))

        for team in self.teams:
            print(team['name'])
            for service in self.services:
                # TODO: make async call
                self.to_service(team, service)

    def generate_flags(self):
        return ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for x in range(33))

    def generate_flag_ids(self):
        return ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for x in range(10))

    def to_service(self, team, service):
        flag = self.generate_flags()
        flag_id = self.generate_flag_ids()

        self.db.flags.insert_one({
            'round': self.round_count,
            'flag': flag,
            'flag_id': flag_id,
            'teams': team['_id'],
            'service': service['_id'],
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

            # self.db.scoreboard.update_one({'team':  })

        except Exception as error:
            print('------------------------------------------------------')
            print(colors.FAIL + 'ERROR in service ' + str(service['name']) + colors.ENDC)
            print(error)
            print('------------------------ END ---------------------------')
            # print('This is corrupt' + error)

