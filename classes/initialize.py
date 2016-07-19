from functions import ConsoleColors as colors
import os, stat, json, sys
from urllib.request import urlopen
from functions import Message


class Initialize:
    db = {}

    path_to_checkers = 'checkers/'

    filename_checkers = 'check'

    teams = []
    services = []
    settings = []

    def __init__(self, db, configsource):
        self.db = db
        try:
            self.settings = configsource.settings
            self.teams = configsource.teams
            self.services = configsource.services
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
        Message.success('Removing old data ... ')

        self.db.teams.delete_many({})
        self.db.services.delete_many({})
        self.db.scoreboard.delete_many({})
        self.db.flags.delete_many({})
        self.db.stolen_flags.delete_many({})

    def create_teams(self):
        Message.success('Generate teams')
        for e in self.teams:
            print("\tInit team {" + e["name"] + "} (Network: " + e["network"] + ")");
            self.db.teams.insert_one(e)

    def create_service(self):
        Message.success('Generate services')
        for e in self.services:
            print("\tInit service {" + e["name"] + "}");
            self.db.services.insert_one(e)
            self.create_program(e['name'], e['program'])

    def create_program(self, filename, program):
        folder = self.path_to_checkers + '/' + filename

        if not os.path.exists(self.path_to_checkers):
            Message.fail('Did not exists folder with ' + self.path_to_checkers)
            sys.exit(-1);
			
        file_path = folder + '/' + self.filename_checkers
        if not os.path.exists(folder):
            os.mkdir(folder, mode=0o777)

        file = open(file_path, 'w')
        file.write(program)
        file.close()

        # Выставляем права на выполнение
        os.chmod(file_path, stat.S_IRWXU)

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
