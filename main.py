import functions
import classes.initialize

from pymongo import MongoClient

client = MongoClient()

db = client.jury

teams = [
    {
        'name': 'Keva',
        'host': '192.168.0.1'
    },
    {
        'name': 'Life',
        'host': '192.168.0.2'
    },
    {
        'name': 'Yozik',
        'host': '192.168.0.3'
    },
    {
        'name': 'Hetto',
        'host': '192.168.0.4'
    }
]
for e in teams:
    db.teams.insert_one(e)

for e in db.teams.find():
    print(e)


def initialize():
    print('Initialize success')


def hello():
    print("hello, world")


initialize()

functions.set_interval(hello, 30)
