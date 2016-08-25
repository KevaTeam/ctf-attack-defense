class Statistic:
    def __init__(self, db, config):
        self.db = db
        self.config = config
        pass

    def summary(self, round, status_service):
        for team in self.config.teams:
            for service in self.config.services:
                count_attack = self.db.stolen_flags.find({
                    'team._id': team['_id'],
                    'flag.service._id': service['_id'],
                    'round': round
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
