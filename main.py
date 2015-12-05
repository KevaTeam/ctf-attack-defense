import functions
from classes.initialize import Initialize
from classes.round import Round
from classes.flags import Flags

from pymongo import MongoClient


client = MongoClient()

db = client.jury

config = Initialize(db)
# scoreboard = Scoreboard(db)
round = Round(db, config)
round.next()
functions.set_interval(round.next, config.output['settings']['round_length'])

flags = Flags(db)
flags.recv()