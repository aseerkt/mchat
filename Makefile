deploydb:
	sudo docker compose -f docker-compose.prod.yml up

destroydb:
	sudo docker compose -f docker-compose.prod.yml down