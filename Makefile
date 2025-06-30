KEY := $$HOME/.ssh/ghdeploykey
SERVERHOST=ubuntu@vloz.website
REMOTE_DIR=$(SERVERHOST):zamunda-scrapper/movies.json

prod:
	git pull
	make compose-up

run-container:
	docker image build . -t maimunda
	docker container rm -f c-maimunda
	docker container run --restart always -p 80:80 -dp 443:443 --name c-maimunda maimunda

compose-up:
	docker compose up -d --build

install:
	echo {"username": "","password": "","workers": 1,"pageSize": 10} > config.json
	make -j 2 install-fe install-be
	
install-fe:
	cd frontend && npm install 

install-be:
	go get ./cmd

dev-fe:
	npm run --prefix frontend dev

dev-be:
	go run ./cmd -serve

dev:
	make -j 2 dev-fe dev-be

scrape:
	bash -c "mv movies.json movies.json.bak || true"
	bash -c "rm -f movies.json"
	go run ./cmd -scrape

bench:
	go test ./cmd -bench=.

copy-movies:
	bash -c "scp -i $(KEY) ./movies.json $(REMOTE_DIR) && ssh -i $(KEY) $(SERVERHOST) \"cd zamunda-scrapper && make prod\""

update-movies:
	make scrape
	make copy-movies

logs:
	docker cp backend:/var/log/maimunda/maimunda.log .

cert:
	openssl req -x509 -nodes -newkey rsa:2048 -keyout server.rsa.key -out server.rsa.crt -days 3650
	ln -sf server.rsa.key server.key
	ln -sf server.rsa.crt server.crt
	mv ./server.rsa.crt ./tls/
	mv ./server.rsa.key ./tls/