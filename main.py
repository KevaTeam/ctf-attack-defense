import functions
from classes.initialize import Initialize

from pymongo import MongoClient


client = MongoClient()

db = client.jury



def hello():
    print("hello, world")


config = Initialize(db)

functions.set_interval(hello, 30)
