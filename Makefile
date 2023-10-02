KEY := $$HOME/.ssh/ghdeploykey
SERVERHOST=ubuntu@vloz.website
REMOTE_DIR=$(SERVERHOST):zamunda-scrapper/movies.json

prod:
	git pull
	make run-container

run-container:
	docker image build . -t maimunda
	docker container rm -f c-maimunda
	docker container run --restart always -dp 80:80 --name c-maimunda maimunda

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
	bash -c "rm movies.json"
	go run ./cmd -scrape

bench:
	go test ./cmd -bench=.

copy-movies:
	bash -c "scp -i $(KEY) ./movies.json $(REMOTE_DIR) && ssh -i $(KEY) $(SERVERHOST) \"cd zamunda-scrapper && make prod\""

update-movies:
	make scrape
	make copy-movies