#!/usr/bin/python
#  coding=utf-8

from sys import argv, exit

def check(hostname):
    return 101

def put(hostname, id, flag):
    return 101

def get(hostname, id, flag):
    return 101

if __name__ == '__main__':
    if len(argv) > 1:
        if argv[1] == "check":
            if len(argv) > 2:
                exit(check(argv[2]))
        elif argv[1] == "put":
            if len(argv) > 4:
                exit(put(argv[2], argv[3], argv[4]))
        elif argv[1] == "get":
            if len(argv) > 4:
                exit(get(argv[2], argv[3], argv[4]))
    exit(110)