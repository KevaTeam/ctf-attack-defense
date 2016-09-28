class ConfigGet:
    def __init__(self, db):
        self.db = db

    def get_all_teams(self):
        return self.db.teams.find()

    def get_all_services(self):
        return self.db.services.find()

    def get_all(self):
        self.teams = self.get_all_teams()
        self.services = self.get_all_services()
