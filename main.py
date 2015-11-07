import functions
from classes.initialize import Initialize
from classes.round import Round

from pymongo import MongoClient


client = MongoClient()

db = client.jury

config = Initialize(db)

round = Round(db, config)

functions.set_interval(round.next, 6)
