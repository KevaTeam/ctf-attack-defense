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
    config = Initialize(db)
    # scoreboard = Scoreboard(db)
    round = Round(db, config)
    round.next()

    functions.set_interval(round.next, config.output['settings']['round_length'])


def flags():
    flags = Flags(db)
    flags.start()


def scoreboard():
    scoreboard = Scoreboard(db)
    scoreboard.start()

if __name__ == '__main__':
    if len(argv) > 1:
        if argv[1] == "init":
            init()
        elif argv[1] == "flags":
            flags()
        elif argv[1] == 'scoreboard':
            scoreboard()
    else:
        print("Please, enter command (init, etc)")



