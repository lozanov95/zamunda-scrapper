npm run build --prefix .\frontend
docker image build . -t lozanov95/maimunda
docker container rm -f c-maimunda
docker container run -dp 80:80 --name c-maimunda lozanov95/maimunda