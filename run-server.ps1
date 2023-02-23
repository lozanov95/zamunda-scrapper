npm run build --prefix .\frontend
docker image build . -t zamunda
docker container rm -f c-zamunda
docker container run -dp 80:80 --name c-zamunda zamunda  