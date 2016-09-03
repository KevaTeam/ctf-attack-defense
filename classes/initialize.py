from classes.config.put import Put as ConfigPut
import os, stat
from functions import Message

class Initialize:
    config = ''
    db = {}
    teams = []
    services = []
    settings = []

    def __init__(self, db, type):
        self.db = db
        
        self.config = ConfigPut(type)

        self.delete_old_data()
        self.create_teams()
        self.create_service()
        self.generate_scoreboard()
        
    def delete_old_data(self):
        Message.info('Removing old data ... ')

        self.db.teams.delete_many({})
        self.db.services.delete_many({})
        self.db.scoreboard.delete_many({})
        self.db.flags.delete_many({})
        self.db.stolen_flags.delete_many({})

        Message.info('\tDone')

    def create_teams(self):
        Message.success('Generate teams')

        for e in self.config.teams:
            Message.info("\tInit team {" + e["name"] + "} (Network: " + e["network"] + ")");
            self.db.teams.insert_one(e)

    def create_service(self):
        Message.success('Generate services')

        for e in self.config.services:
            Message.info("\tInit service {" + e["name"] + "}");

            self.db.services.insert_one(e)
            self.create_program(e['name'], e['program'])

    def create_program(self, filename, program):
        path_to_checkers = self.config.settings['path_to_checkers']
        if not os.path.exists(path_to_checkers):
            os.mkdir(path_to_checkers, mode=0o777)

        folder = path_to_checkers + '/' + filename
        file_path = folder + '/' + self.config.settings['filename_checkers']

        if not os.path.exists(folder):
            os.mkdir(folder, mode=0o777)

        file = open(file_path, 'w')
        file.write(program + "\r\n")
        file.close()

        # Выставляем права на выполнение
        os.chmod(file_path, 0o777)

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
