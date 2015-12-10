#!/usr/bin/env python
# -*- coding: utf-8 -*-

import socket
from classes.round import Round


class Flags:
    def __init__(self, db):
        self.db = db

    def recv(self):
        sock = socket.socket()
        sock.bind(('', 9090))
        sock.listen(1)
        conn, addr = sock.accept()

        print ('connected:', addr)
        #s = 'close'
        while True:
            data = conn.recv(1024)
            data = str(data.rstrip().decode('utf-8'))
            print (data)
            data1 = self.db.flags.find({'flag': data})
            print(data1.count())
            if data1.count() != 0:
                conn.send(('received\n').encode())
            else:
                conn.send(('not found\n').encode())

        conn.close()
        return data

