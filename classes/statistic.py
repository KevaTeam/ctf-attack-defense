from config.main import CHECKER

class Statistic:
    codes = {
        'UP': 101,
        'CORRUPT': 102,
        'MUMBLE': 103,
        'DOWN': 104
    }

    def __init__(self, db, config):
        self.db = db
        self.config = config

        pass

    # Подводим итоги последнего раунда и сохраняем в базу
    def summary(self, round):
        scoreboard = self.db.scoreboard.find()
        status_service = {}
        for item in scoreboard:
            status_service[item['team']['name'] + '_' + item['service']['name']] = self.codes[item['status']]

        print(status_service)
        for team in self.config.get_all_teams():
            for service in self.config.get_all_services():
                last_legacy_round = round - CHECKER['LENGTH']

                count_attack = self.db.stolen_flags.find({
                    'team._id': team['_id'],
                    'flag.service._id': service['_id'],
                    'round': last_legacy_round if last_legacy_round > 0 else 0
                }).count()

                if team['name'] + '_' + service['name'] in status_service and status_service[team['name'] + '_' + service['name']] == 101:
                    count_defense = self.db.flags.find({
                        'team._id': team['_id'],
                        'service._id': service['_id'],
                        'round': round,
                        'stolen': False
                    }).count()
                else:
                    count_defense = 0

                self.db.scoreboard.update_one(
                    {
                        'team._id': team['_id'],
                        'service._id': service['_id']
                    },
                    {
                        '$inc': {
                            'attack': count_attack,
                            'defense': count_defense
                        }
                    }
                )
