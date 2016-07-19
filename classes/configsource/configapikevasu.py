__author__ = 'sea-kg'

from functions import Message
import string
import time

class ConfigApiKevaSu:
	settings = {}
	teams = []
	services = []
	loaded = False
	def __init__(self):
		try:
			response = requests.get("http://api.keva.su/method/jury.get").json()
			self.settings = data["response"]["settings"]
			self.teams = data["response"]["teams"]
			self.services = data["response"]["services"]
			self.loaded = True
		except Exception:
			Message.fail('Error with requests in response')
			self.loaded = False

	def isLoaded(self):
		return self.loaded
		
