docker container rm -f c-zamunda
docker image build . -t zamunda
docker container run -dp 80:80 --name c-zamunda zamunda  