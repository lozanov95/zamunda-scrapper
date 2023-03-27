prod:
	docker image build . -t maimunda
	docker container rm -f c-maimunda
	docker container run -dp 80:80 --name c-maimunda maimunda

install:
	cd frontend && npm install 

dev-fe:
	npm run --prefix frontend dev

dev-be:
	go run ./cmd -serve

dev:
	make -j 2 dev-fe dev-be