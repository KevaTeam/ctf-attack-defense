from config.main import *
from pymongo import MongoClient

import functions
import argparse

client = MongoClient(host=DATABASE['HOST'], port=DATABASE['PORT'])
#client.jury.authenticate('keva', 'i_want_want_sleep')
db = client.jury

def init(parse):
    from classes.initialize import Initialize

    Initialize(db, parse)


def start(parse):
    if parse.slave:
        from classes.zond import Zond

        zond = Zond(db)

        zond.run()

    else:
        from classes.round import Round

        round = Round(db)
        round.next()

        functions.set_interval(round.next, CHECKER['ROUND_LENGTH'])


def flags(parse):
    from classes.flags import Flags

    flags = Flags(db)
    flags.start()


def scoreboard(parse):
    from classes.scoreboard import Scoreboard

    scoreboard = Scoreboard(db)
    scoreboard.start()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='The platform for the CTF-competition (Attack-Defense)',
                                     epilog='''Order of actions: init -> start -> flags -> scoreboard.
                                      Good game!''')

    sp = parser.add_subparsers(help='sub-command help')

    sp_init = sp.add_parser('init', help='Initialize the game. Generate teams, services, statistics.')
    sp_init.add_argument('--type', help='type of configuration file', nargs='?', default='api')
    sp_init.add_argument('--url', help='API server URL ', type=str, default='',)

    sp_init.set_defaults(func=init)

    sp_start = sp.add_parser('start', help='Run checkers and start the game.')
    sp_start.add_argument('--slave', help='Run as slave', action='store_true')
    sp_start.set_defaults(func=start)

    sp_flags = sp.add_parser('flags', help='The start of the module "flags"')
    sp_flags.set_defaults(func=flags)

    sp_scoreboard = sp.add_parser('scoreboard', help='Run scoreboard')
    sp_scoreboard.set_defaults(func=scoreboard)

    if 'func' in parser.parse_args():
        parser.parse_args().func(parser.parse_args())
    else:
        parser.print_help()


