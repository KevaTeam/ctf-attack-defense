from functions import ConsoleColors as colors

class Initialize:
    db = {}

    teams = [
        {
            'name': 'Keva',
            'host': '192.168.0.1'
        },
        {
            'name': 'Life',
            'host': '192.168.0.2'
        },
        {
            'name': 'Yozik',
            'host': '192.168.0.3'
        },
        {
            'name': 'Hetto',
            'host': '192.168.0.4'
        }
    ]

    services = [
        {
            'name': '1 service',
        },
        {
            'name': '2 service',
        },
        {
            'name': '3 service',
        },
        {
            'name': '4 service',
        }
    ]

    def __init__(self, db):
        self.db = db

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
            self.db.services.insert_one(e)

            # Check teams
            # for e in self.db.services.find():
            #     print(e)
