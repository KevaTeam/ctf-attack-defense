from threading import Timer
from sys import exit

import requests

def set_interval(func, sec):
    def func_wrapper():
        set_interval(func, sec)
        func()

    t = Timer(sec, func_wrapper)
    t.start()
    return t


def get_data_from_api():
    try:
        return requests.get("http://api.keva.su/method/jury.get").json()
    except Exception:
        Message.fail('Error with requests in response')
        exit(0)


def get_config(db):
    data = get_data_from_api()

    teams = []
    for team in db.teams.find():
        teams.append(team)

    services = []
    for service in db.services.find():
        services.append(service)


    return {
        'teams': teams,
        'services': services,
        'settings': data["response"]["settings"]
    }

# Some methods for print message
class ConsoleMessage:
    def __init__(self):
        pass


    def success(self, str):
        print(ConsoleColors.OKGREEN + str + ConsoleColors.ENDC)


    def info(self, str):
        print(ConsoleColors.OKBLUE + str + ConsoleColors.ENDC)


    def warning(self, str):
        print(ConsoleColors.WARNING + str + ConsoleColors.ENDC)


    def fail(self, str):
        print(ConsoleColors.FAIL + str + ConsoleColors.ENDC)


Message = ConsoleMessage()


# Colors for console
class ConsoleColors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
