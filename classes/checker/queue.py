import pika

class Queue:
    list = []

    def __init__(self):
        connection = pika.BlockingConnection(pika.ConnectionParameters(
            'localhost'))
        self.channel = connection.channel()

    def send(self):
        pass

    def put(self, **kwargs):
        self.list.append(kwargs)

    def run(self):
        pass

    def clear(self):
        pass