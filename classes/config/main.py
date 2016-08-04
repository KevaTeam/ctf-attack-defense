import requests, os, sys, json

from functions import Message

class Config:
	loaded = False

	path_to_config_file = 'config/game.json'
	settings = {
		'path_to_checkers': 'checkers/',
		'filename_checkers': 'check'
	}

	services = {},
	teams = {},

	def __init__(self, method='api'):
		Message.info('Get config from ' + method)
		if method == 'json':
			self.from_json()
		else:
			self.from_api()

		if not self.loaded:
			Message.fail("Couldn't get config...Exit")
			sys.exit(0)

	def from_api(self):
		try:
			response = requests.get("http://api.keva.su/method/jury.get").json()
			
			data = response['response']

			self.services = data["response"]["services"]
			self.teams = data["response"]["teams"]

			self.settings.update(data["response"]["settings"])
			
			self.loaded = True
		except Exception:
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