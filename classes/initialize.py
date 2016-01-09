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

        Message.success('Clear old data')
        self.delete_old_data()

        Message.success('Generate teams')
        self.create_teams()

        Message.success('Generate services')
        self.create_service()

        Message.success('Generate scoreboard')
        self.generate_scoreboard()

        self.output = {
            'teams': self.teams,
            'services': self.services,
            'settings': self.settings,
        }

    def delete_old_data(self):
        self.db.teams.delete_many({})
        self.db.services.delete_many({})
        self.db.scoreboard.delete_many({})
        self.db.flags.delete_many({})

    def create_teams(self):
        for e in self.teams:
            self.db.teams.insert_one(e)

    def create_service(self):
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
        for team in self.db.teams.find({}):
            for service in self.db.services.find({}):
                self.db.scoreboard.insert_one({
                    'team': team,
                    'service': service,
                    'status': 'UP',
                    'message': ''
                })
