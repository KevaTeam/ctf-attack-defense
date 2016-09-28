#!/bin/bash
if [ "$(uname)" == "Darwin" ]; then
    # Install for Mac
    echo Installing for Mac!

    echo Installing Python 3 and Mongo
    brew install python3 mongodb

    echo Installing Python Deps - sudo required
    sudo pip3 install pymongo
    sudo pip3 install requests
    sudo pip install --upgrade pip setuptools
    sudo pip3 install flask

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

    echo Installing Python Deps
    sudo pip3 install pymongo
    sudo pip3 install requests
    sudo pip install --upgrade pip setuptools
    sudo pip3 install flask

    echo Done!
fi
