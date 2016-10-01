#!/usr/bin/env python
# -*- coding: utf-8 -*-
from classes.config.get import ConfigGet
from config.main import *
import multiprocessing
import socket
import sys
import time
import re
import pymongo
from ipaddress import IPv4Address, IPv4Network
from functions import Message


class Flags:
    socket = None

    def __init__(self, db):
        self.db = db
        self.conn = None
        self.address = None

        self.config = ConfigGet(self.db)


        try:
            lifetime = CHECKER['LENGTH']
            round_length = CHECKER['ROUND_LENGTH']
        except KeyError:
            Message.fail('Error with parse in response')
            sys.exit(0)

        self.life = lifetime * round_length
        self.port = 2605#self.config.settings['flags']['port']

    def start(self):
        Message.success('Class is initialized. Starting')
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.bind(('0.0.0.0', self.port))
            self.socket.listen(1)

            while True:
                self.conn, self.address = self.socket.accept()
                Message.info('connected:' + self.address[0])

                process = multiprocessing.Process(target=self.recv, args=(self.conn, self.address))
                process.daemon = True
                process.start()

        except KeyboardInterrupt:
            print('Module flags is shutdown')
            self.conn.close()
            exit(0)

    def recv(self, connection, address):
        teams = self.db.teams.find()
        # ip = IPv4Address()
        print(address)
        team = False
        for e in teams:
            if e['network'] == '10.16.7.159/24':
                e['network'] = '10.16.7.0/24'

            if IPv4Address(address[0]) in IPv4Network(e['network']):
                print(e)
                team = e
                break

        if not bool(team):
            connection.send(('Who are you?\n Goodbye\n').encode())
            connection.close()    
        else:
            try:
                self.process_one_team(connection, team)
            except BrokenPipeError:
                print('Client is disconnected')
                sys.exit(0)

    def process_one_team(self, connection, team):
        connection.send(('Welcome! \nYour team - ' + team["name"] + '\n').encode())

        while True:
            data = connection.recv(1024)
            data = str(data.rstrip().decode('utf-8'))

            if not re.match('^\w{33}=$',data):
                connection.send(('this is not flag\n').encode())
                continue

            flag = self.db.flags.find_one({'flag': data})

            
            if not bool(flag):
                flags_crypto = self.db.flags.find({'service.name': "crypto-inc"})

                for f in flags_crypto:
                    if f['flag'] == data.upper():
                        flag = f
                if not bool(flag):
                    connection.send(('Flag is not found\n').encode())
                    continue

            if flag['team']['_id'] == team['_id']:
                connection.send(('It`s your flag\n').encode())
                continue


            if (self.life + flag["timestamp"]) <= time.time():
                connection.send(('This flag is too old\n').encode())
                continue

            status = self.db.scoreboard.find_one({
                'team._id': team['_id'],
                'service._id': flag['service']['_id']
            })

            if status["status"] != 'UP':
                connection.send(('Your service '+ flag['service']['name'] +' is not working\n').encode())
                continue

            count_round = self.db.flags.find().sort([ ('round', pymongo.DESCENDING) ]).limit(1)[0]['round']

            is_stolen = self.db.stolen_flags.find_one({
                'team._id': team['_id'],
                'flag._id': flag['_id']
            })

            if is_stolen:
                connection.send(('You are already pass this flag\n').encode())
                continue

            self.db.stolen_flags.insert_one({
                'team': team,
                'flag': flag,
                'round': count_round,
                'timestamp': time.time()
            })

            self.db.flags.update_one({'flag': data}, {"$set": {"stolen": True}})

            connection.send(('received\n').encode())
