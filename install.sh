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

    install_python_deps

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

    install_python_deps

    echo Done!
fi
