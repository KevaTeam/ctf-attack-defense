import functions

from classes.initialize import Initialize
from classes.round import Round
from classes.flags import Flags
from classes.scoreboard import Scoreboard

import argparse

from pymongo import MongoClient


client = MongoClient()

db = client.jury


def init():
    Initialize(db)


def start():
    config = functions.get_config(db)

    round = Round(db, config)
    round.next()

    functions.set_interval(round.next, 10)


def flags():
    config = functions.get_config(db)

    flags = Flags(db, config)
    flags.start()


def scoreboard():
    scoreboard = Scoreboard(db)
    scoreboard.start()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='The platform for the CTF-competition (Attack-Defense)',
                                     epilog='Order of actions: init -> start -> flags -> scoreboard')

    sp = parser.add_subparsers()

    sp_init = sp.add_parser('init', help='Initialize the game. Generate teams, services, statistics.')
    sp_init.set_defaults(func=init)

    sp_start = sp.add_parser('start', help='Run checkers and start the game.')
    sp_start.set_defaults(func=start)

    sp_flags = sp.add_parser('flags', help='The start of the module "flags"')
    sp_flags.set_defaults(func=flags)

    sp_scoreboard = sp.add_parser('scoreboard', help='Run scoreboard')
    sp_scoreboard.set_defaults(func=scoreboard)

    if 'func' in parser.parse_args():
        parser.parse_args().func()
    else:
        parser.print_help()


