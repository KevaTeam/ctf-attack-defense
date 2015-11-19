import subprocess

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

    def status(self, code):
        if code == self.STATUS_CODE['SUCCESS']:
            return True

        raise Exception(code)

    def get(self, host, path_to_program, flag, flag_id):
        args = (path_to_program, "get", host, flag_id, flag)

        popen = subprocess.Popen(args, stdout=subprocess.PIPE)

        popen.wait()
        # TODO: сделать запись в лог переменной output
        output = popen.stdout.read()

        return self.status(popen.returncode)

    def check(self, host, path_to_program):
        args = (path_to_program, "check", host)

        popen = subprocess.Popen(args, stdout=subprocess.PIPE)
        popen.wait()

        output = popen.stdout.read()

        print('output ' + str(popen.returncode))

        return self.status(popen.returncode)

    def put(self, host, path_to_program, flag, flag_id):
        args = (path_to_program, "put", host, flag_id, flag)

        popen = subprocess.Popen(args, stdout=subprocess.PIPE)
        popen.wait()

        output = popen.stdout.read()

        return self.status(popen.returncode)