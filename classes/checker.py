import subprocess

__author__ = 'dmitry'


class Checker:

    def __init__(self):
        pass

    def get(self, host, path_to_program, flag, flag_id):
        args = (path_to_program, "-c", "somefile.xml", "-d", "text.txt", "-r", "aString", "-f", "anotherString")
        #Or just:
        #args = "bin/bar -c somefile.xml -d text.txt -r aString -f anotherString".split()
        popen = subprocess.Popen(args, stdout=subprocess.PIPE)
        popen.wait()
        output = popen.stdout.read()
        # print(output)
        print(host, path_to_program, flag, flag_id, output)

