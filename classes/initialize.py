from functions import ConsoleColors as colors
import os, stat, json, sys
from urllib.request import urlopen
from functions import get_data_from_api, Message


class Initialize:
    db = {}

    path_to_checkers = 'checkers/'

    filename_checkers = 'check'

    teams = []

    services = []

    settings = []

    def __init__(self, db):
        self.db = db
        
        data = get_data_from_api()

        try:
            self.settings = data["response"]["settings"]
            self.teams = data["response"]["teams"]
            self.services = data["response"]["services"]
        except Exception:
            Message.fail('Error with parse in response')
            sys.exit(0)

        self.delete_old_data()

        self.create_teams()

        self.create_service()

        self.generate_scoreboard()

        self.output = {
            'teams': self.teams,
            'services': self.services,
            'settings': self.settings,
        }

    def delete_old_data(self):
        Message.success('Clear old data')

        self.db.teams.delete_many({})
        self.db.services.delete_many({})
        self.db.scoreboard.delete_many({})
        self.db.flags.delete_many({})
        self.db.stolen_flags.delete_many({})

    def create_teams(self):
        Message.success('Generate teams')

        for e in self.teams:
            self.db.teams.insert_one(e)

    def create_service(self):
        Message.success('Generate services')

        for e in self.services:
            insert_result = self.db.services.insert_one(e)

            self.create_program(str(insert_result.inserted_id), e['program'])

    def create_program(self, service_id, program):
        path = self.path_to_checkers + self.filename_checkers + '_' + service_id

        if not os.path.exists(self.path_to_checkers):
            os.mkdir(self.path_to_checkers, mode=0o777)

        file = open(path, 'w')
        file.write(program)
        file.close()

        # Выставляем права на выполнение
        os.chmod(path, stat.S_IRWXU)

    def generate_scoreboard(self):
        Message.success('Generate scoreboard')

        for team in self.db.teams.find({}):
            for service in self.db.services.find({}):
                self.db.scoreboard.insert_one({
                    'team': team,
                    'service': service,
                    'status': 'UP',
                    'message': '',
                    'up_round': 0,
                    'attack': 0,
                    'defense': 0
                })
