prod:
	git pull
	make run-container

run-container:
	docker image build . -t maimunda
	docker container rm -f c-maimunda
	docker container run -dp 80:80 --name c-maimunda maimunda

install:
	echo {"username": "","password": "","workers": 1,"pageSize": 10} > config.json
	cd frontend && npm install 
	go get ./cmd

dev-fe:
	npm run --prefix frontend dev

dev-be:
	go run ./cmd -serve

dev:
	make -j 2 dev-fe dev-be