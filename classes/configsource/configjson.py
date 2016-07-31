__author__ = 'sea-kg'

from functions import Message
import string
import time
import sys
import os.path
import json
from pprint import pprint

class ConfigJson:
	settings = {}
	teams = []
	services = []
	loaded = False
	
	def __init__(self, filename):
		if not os.path.isfile(filename):
			self.loaded = False
			Message.fail('File not found: ' + filename)
			return
		self.filename = filename;
		try:
			with open(filename) as data_file:    
				data = json.load(data_file)
			self.settings = data['settings']
			self.teams = data['teams']
			self.services = data['services']
			self.loaded = True
		except Exception:
			Message.fail('Invalid format of file: ' + filename)
			self.loaded = False
	
	def isLoaded(self):
		return self.loaded
