npm run build --prefix .\frontend
docker image build . -t maimunda
docker container rm -f c-maimunda
docker container run -dp 80:80 -v $PWD/frontend/dist/:/usr/src/app/ui --name c-maimunda maimunda