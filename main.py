import functions
from classes.initialize import Initialize
from classes.round import Round
from classes.flags import Flags
from classes.scoreboard import Scoreboard

from sys import argv, exit
from pymongo import MongoClient


client = MongoClient()

db = client.jury


def init():
    Initialize(db)


def start():
    config = functions.get_config(db)

    round = Round(db, config)
    round.next()

    functions.set_interval(round.next, config['settings']['round_length'])


def flags():
    config = functions.get_config(db)

    flags = Flags(db, config)
    flags.start()


def scoreboard():
    scoreboard = Scoreboard(db)
    scoreboard.start()

if __name__ == '__main__':
    if len(argv) > 1:
        if argv[1] == "init":
            init()
        elif argv[1] == "start":
            start()
        elif argv[1] == "flags":
            flags()
        elif argv[1] == 'scoreboard':
            scoreboard()
    else:
        print("Please, enter command")
        print('\n'.join(['init', 'start', 'flags', 'scoreboard']))



