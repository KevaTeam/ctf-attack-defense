__author__ = 'dmitry'

from functions import ConsoleColors as colors
from classes.checker import Checker
import random
import string

class Round:

    teams = {}
    services = {}

    flags = {}

    round_count = 0

    def __init__(self, db, config):
        self.teams = config.teams
        self.services = config.services

        self.checker = Checker()


    def next(self):
        self.round_count += 1

        print('Round: ' + str(self.round_count))

        for team in self.teams:
            print(team['name'])
            for service in self.services:
                flag = self.generate_flags()
                self.checker.get(team['host'], 'checkers/up.pl', flag)
                print(service['name'] + flag)


    def generate_flags(self):
        return ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for x in range(33))