import pika, json
from bson import json_util

class Queue:
    list = []
    queue_name = 'tasks'


    def __init__(self):
        # Устанавливаем соединение
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                'localhost'
            )
        )
        self.channel = connection.channel()

        self.channel.queue_declare(queue=self.queue_name)

    def send(self):
        pass

    def put(self, **kwargs):
        self.list.append(kwargs)

    def run(self):
        for task in self.list:
            self.channel.basic_publish(
                exchange='',
                routing_key=self.queue_name,
                body=json.dumps(task, default=json_util.default)
            )

            print('Sended')

    def clear(self):
        # Если вдруг у нас задания не отправились в очередь
        self.list = []

        # Очищаем очередь, если задания остались
        self.channel.queue_purge(queue=self.queue_name)