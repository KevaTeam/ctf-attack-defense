# CTF-Attack-Defense System

The platform for the CTF-competition (Attack-Defense)

## Requirements

* `sudo apt-get install python3 pip3`
* `sudo apt install mongodb`
* `pip3 install pymongo`
* `pip3 install flask`

## Init game

	python3 main.py init 
	
or 
	
	python3 main.py init config.ini
	
## Start sending flags

	python3 main.py flags

## Run scoreboard (address and port will be printed)

	python3 main.py scoreboard
	
## Start game

	python3 main.py start
