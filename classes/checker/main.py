import subprocess
from config.main import BASE_PATH
__author__ = 'dmitry'


class Checker:
    STATUS_CODE = {
        'SUCCESS': 101,
        'CORRUPT': 102,
        'MUMBLE':  103,
        'DOWN':    104
    }

    def __init__(self):
        pass

    def status(self, popen):
        code = popen.returncode

        if code == self.STATUS_CODE['SUCCESS']:
            return True

        # if code not in self.STATUS_CODE.values():
        #     code = 0

        raise Exception(popen.returncode, popen.stdout.read())

    def get(self, host, path_to_program, flag, flag_id):
        args = (BASE_PATH + path_to_program, "get", host, flag_id, flag)

        popen = subprocess.Popen(args, stdout=subprocess.PIPE)

        popen.wait()
        # TODO: сделать запись в лог переменной output
        output = popen.stdout.read()

        return self.status(popen)

    def check(self, host, path_to_program):
        args = (BASE_PATH + path_to_program, "check", host)
        popen = subprocess.Popen(args, stdout=subprocess.PIPE)
        popen.wait()

        return self.status(popen)

    def put(self, host, path_to_program, flag, flag_id):
        args = (BASE_PATH + path_to_program, "put", host, flag_id, flag)

        popen = subprocess.Popen(args, stdout=subprocess.PIPE)
        popen.wait()

        output = popen.stdout.read()

        return self.status(popen)
