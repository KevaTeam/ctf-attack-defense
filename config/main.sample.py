import os

DATABASE = {
	'HOST': 'localhost',
	'PORT': 27017
}

API_SERVER = ''

CHECKER = {
	'ROUND_LENGTH': 60, # Длина раунда в секундах
	'LENGTH': 4 # Время жизни флага в раундах
}

FLAGS = {
	'PORT': 2605
}

CHECKER_METHOD = 'async' # Async or queue

QUEUE = {
	'HOST': 'localhost',
	'USERNAME': 'username',
	'PASSWORD': 'pass'
}

BASE_PATH = os.path.dirname(__file__) + '/../'