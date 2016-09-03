# from classes.`
import threading

class Threads:
    list = []
    thread = []

    def __init__(self):
        pass

    def put(self, **kwargs):
        self.list.append(kwargs)
        pass

    def run(self):
        self.thread = []
        for item in self.list:
            self.thread.append(threading.Thread(
                name=item['team']['name'] + ' ' + item['service']['name'],
                target=item['to_service'],
                args=(item['team'], item['service'], item['flag'], item['flag_id']))
            )
            self.thread[-1].daemon = True
            self.thread[-1].start()

        for e, j in enumerate(self.thread):
            j.join(timeout=1)


    def clear(self):
        self.list = []