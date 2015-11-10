from functions import ConsoleColors as colors
import os, stat, json
from urllib.request import urlopen

class Initialize:
    db = {}

    path_to_checkers = 'checkers/'

    filename_checkers = 'check'

    teams = []

    services = []

    def __init__(self, db):
        self.db = db
        response = urlopen("http://api.keva.su/method/jury.get").read().decode('utf8')
        data = json.loads(response)

        self.settings = data["response"]["settings"]
        self.teams = data["response"]["teams"]
        self.services = data["response"]["services"]

        print(colors.OKGREEN + 'Generate teams' + colors.ENDC)
        self.create_teams()

        print(colors.OKGREEN + 'Generate services' + colors.ENDC)
        self.create_service()

    def create_teams(self):

        # Delete all teams
        self.db.teams.delete_many({})

        # Create teams
        for e in self.teams:
            self.db.teams.insert_one(e)

        # Check teams
        # for e in self.db.teams.find():
        #     print(e)


    def create_service(self):

        # Delete all teams
        self.db.services.delete_many({})

        # Create teams
        for e in self.services:
            insert_result = self.db.services.insert_one(e)

            self.create_program(str(insert_result.inserted_id), e['program'])
            # Check teams
        # for e in self.db.services.find():
        #     print(e)

    def create_program(self, service_id, program):
        path = self.path_to_checkers + self.filename_checkers + '_' + service_id

        file = open(path, 'w')

        file.write(program)
        file.close()

        # Выставляем права на выполнение
        os.chmod(path, stat.S_IRWXU)

