from __future__ import print_function
import sys
import threading

import pika, time, json

from bson import json_util
from functions import Message
from classes.checker.main import Checker
from config.main import QUEUE

try:
    import thread
except ImportError:
    import _thread as thread


class Zond:
    path_to_checkers = 'checkers/'

    filename_checkers = 'check'
    thread = []

    codes = {
        101: 'UP',
        102: 'CORRUPT',
        103: 'MUMBLE',
        104: 'DOWN'
    }

    def __init__(self, db):
        self.db = db

        self.checker = Checker()
        connection = pika.BlockingConnection(pika.ConnectionParameters(
            host='localhost',
            credentials=pika.credentials.PlainCredentials(QUEUE['USERNAME'], QUEUE['PASSWORD'])
        ))
        self.channel = connection.channel()

        self.channel.queue_declare(queue='tasks')

        print(' [*] Waiting for messages. To exit press CTRL+C')

    def run(self):
        self.channel.basic_consume(self.callback,
                              queue='tasks',
                              no_ack=True)

        self.channel.start_consuming()

    def callback(self, ch, method, properties, body):
        data = json.loads(body.decode('utf8'))

        print(" [x] Received %r %r" % (data['team']['name'],data['service']['name']))

        self.thread.append(threading.Thread(
            name=(data['team']['name'] + data['service']['name']),
            target=self.to_service,
            args=(data['round'], data['team'], data['service'], data['flag'], data['flag_id']))
        )
        self.thread[-1].daemon = True
        self.thread[-1].start()

        for e, j in enumerate(self.thread):
            j.join(timeout=1)

    def cdquit(self, fn_name):
        # print to stderr, unbuffered in Python 2.
        print('{0} took too long'.format(fn_name), file=sys.stderr)
        sys.stderr.flush()  # Python 3 stderr is likely buffered.
        thread.interrupt_main()  # raises KeyboardInterrupt

    def exit_after(self, s):
        '''
        use as decorator to exit process if
        function takes longer than s seconds
        '''

        def outer(fn):
            def inner(*args, **kwargs):
                timer = threading.Timer(s, self.cdquit, args=[fn.__name__])
                timer.start()
                try:
                    result = fn(*args, **kwargs)
                finally:
                    timer.cancel()
                return result

            return inner

        return outer

    def to_service(self, round, team, service, flag, flag_id):
        team = json_util.loads(json.dumps(team))
        service = json_util.loads(json.dumps(service))

        self.db.flags.insert_one({
            'round': round,
            'team': team,
            'service': service,
            'flag': flag,
            'flag_id': flag_id,
            'stolen': False,
            'timestamp': time.time()
        })

        path = self.path_to_checkers + service['name'] + '/' + self.filename_checkers

        action = ''
        try:
            action = 'check'
            self.checker.check(team['host'], path)

            action = 'put'
            self.checker.put(team['host'], path, flag, flag_id)

            action = 'get'
            self.checker.get(team['host'], path, flag, flag_id)

            self.update_scoreboard(team, service, 101)

        except Exception as error:
            code, message = error.args
            print(error)
            Message.fail(team['name'] + ' ' + service['name'] + ' ' + action + ' => error (message: ' + str(message) + ')')
            self.update_scoreboard(team, service, code, message)


    def update_scoreboard(self, team, service, status_code, message=''):
        codes = {
            101: 'UP',
            102: 'CORRUPT',
            103: 'MUMBLE',
            104: 'DOWN'
        }

        # self.status_service[team['name'] + '_' + service['name']] = status_code

        if status_code not in codes:
            Message.fail('\t Invalid checker return code for ' + service['name'])
            status_code = 104

        self.db.scoreboard.update_one(
            {
                'team._id': team['_id'],
                'service._id': service['_id']
            },
            {
                "$set": {
                    "status": codes[status_code],
                    'message': message
                },
                '$inc': {
                    'up_round': 1 if status_code == 101 else 0
                }
            }
        )
