import requests, os, sys, json

from config.main import API_SERVER
from functions import Message


class Put:
    loaded = False

    path_to_config_file = 'config/game.json'
    settings = {
        'path_to_checkers': 'checkers',
        'filename_checkers': 'check'
    }

    services = {},
    teams = {},

    def __init__(self, args):
        self.args = args

        Message.info('Get config from ' + self.args.type)

        if self.args.type == 'json':
            self.from_json()
        else:
            self.from_api()

        if not self.loaded:
            Message.fail("Couldn't get config...Exit")
            sys.exit(0)

    def from_api(self):
        try:
            # Определяем путь до API сервера (откуда мы получаем команды)
            api_url = self.args.url if self.args.url != '' else API_SERVER

            if api_url == '':
                Message.fail('API server url is not defined in config/main.py.')
                Message.fail('Use python3 main.py init --url=\'SOME_URL\' instead')
                sys.exit(0)

            response = requests.get(api_url).json()
            data = response['response']

            self.services = data["services"]
            self.teams = data["teams"]

            self.settings.update(data["settings"])

            self.loaded = True
        except Exception as e:
            print(e)
            Message.fail('Error with requests in response')

    def from_json(self):
        if not os.path.isfile(self.path_to_config_file):
            Message.fail('File not found: ' + self.path_to_config_file)
            return

        self.filename = self.path_to_config_file

        try:
            with open(self.filename) as data_file:
                data = json.load(data_file)

            self.settings = data['settings']
            self.teams = data['teams']
            self.services = data['services']

            self.loaded = True
        except KeyError as e:
            Message.fail('Not found parameter ' + str(e) + ' in ' + self.path_to_config_file)
