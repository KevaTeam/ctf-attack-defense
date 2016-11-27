Платформа для проведения игр CTF в формате Attack-defense
=========================================================


Установка
---------
Автоматизированная установка производится на сервер с операционной системой debian или ubuntu.

Для установки необходимо перейти в рабочий каталог проекта и запустить install.sh

    ./install.sh
    
Установка на другие платформы производится вручную по аналогии.

Запуск
------
Система состоит из отдельных модулей с единой точкой входа.
Для начала необходимо проинициализировать

    python3 main.py init
    
Для запуска модулей необходимо выполнить команды:

    python3 main.py scoreboard                запуск таблицы результатов
    python3 main.py flags                     запуск приемки флагов
    python3 main.py start                     запуск master-сервера для чекеров (посылает информацию в очередь)
    python3 main.py start --slave             запуск slave-сервера 

English version (sea-kg)
========================
# CTF-Attack-Defense System

The platform for the CTF-competition (Attack-Defense)

## Requirements

* `sudo apt-get install python3 pip3 python3-psutil`
* `sudo apt install mongodb`
* `pip3 install pymongo`
* `pip3 install flask`

## Init game

	`python3 main.py init` or `python3 main.py init config.ini`

## 1. Start game
`python3 main.py start`
`python3 main.py start --slave`

## 2. Start sending flags
`python3 main.py flags`

## 3. Run scoreboard (address and port will be printed)
`python3 main.py scoreboard`
