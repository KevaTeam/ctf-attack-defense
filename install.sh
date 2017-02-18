#!/bin/bash

#
# Support Functions
#
function install_python_deps {
    echo Installing Python Deps - Sudo Required!
    sudo pip3 install pymongo
    sudo pip3 install requests
    sudo pip install --upgrade pip setuptools
    sudo pip3 install flask
    sudo pip3 install pika
}

#
# Main Install Logic
#
if [ "$(uname)" == "Darwin" ]; then
    # Install for Mac
    echo Installing for Mac!

    echo Installing Python 3 and Mongo
    brew install python3 mongodb

    echo Installing RabbitMQ Server
    brew install rabbitmq
    
    install_python_deps

    echo Moving config/main.sample.py to config/main.py
    cp config/main.sample.py config/main.py

    echo Done!
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Install for Linux
    echo Installing for Linux!

    echo Updating apt - sudo required!
    sudo apt-get update

    echo Installing Python 3 and pip3
    sudo apt-get install python3 python3-pip -y

    echo Installing Mongo
    sudo apt-get install mongodb -y

    echo Installing RabbitMQ Server
    sudo apt-get install rabbitmq-server
    
    install_python_deps

    echo Moving config/main.sample.py to config/main.py
    cp config/main.sample.py config/main.py

    echo Done!
else
    echo Install.sh not supported for you OS. Please report your problem https://github.com/shipko/ctf-attack-defense/issues/new
fi
