from functions import ConsoleColors as colors
import os, stat, json, sys
from urllib.request import urlopen

class Initialize:
    db = {}

    path_to_checkers = 'checkers/'

    filename_checkers = 'check'

    teams = []

    services = []

    settings = []

    def __init__(self, db):
        self.db = db
        try:
            response = urlopen("http://api.keva.su/method/jury.get").read().decode('utf8')
        except Exception:
            print(colors.FAIL + 'Error with requests in response' + colors.ENDC)
            sys.exit(0)

        data = json.loads(response)

        try:
            self.settings = data["response"]["settings"]
            self.teams = data["response"]["teams"]
            self.services = data["response"]["services"]
        except Exception:
            print(colors.FAIL + 'Error with parse in response' + colors.ENDC)
            sys.exit(0)

        self.db.scoreboard.delete_many({})
        print(colors.OKGREEN + 'Generate teams' + colors.ENDC)
        self.create_teams()

        print(colors.OKGREEN + 'Generate services' + colors.ENDC)
        self.create_service()

        self.generate_scoreboard()

        self.output = {
            'teams': self.teams,
            'services': self.services,
            'settings': self.settings,
        }

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

        if not os.path.exists(self.path_to_checkers):
            os.mkdir(self.path_to_checkers, mode=0o777)

        file = open(path, 'w')
        file.write(program)
        file.close()

        # Выставляем права на выполнение
        os.chmod(path, stat.S_IRWXU)

    def generate_scoreboard(self):
        for team in self.teams:
            for service in self.services:
                # print(team)
                self.db.scoreboard.insert_one({
                    'team': team,
                    'service': service,
                    'status': 'UP',
                    'message': ''
                })

        print(self.db.scoreboard.find({}))