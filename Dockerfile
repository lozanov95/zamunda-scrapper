FROM golang:1.19
WORKDIR /usr/src/app
COPY ./go.mod ./go.sum ./
RUN go mod download && go mod verify
COPY ./config.json ./movies.json ./
COPY ./cmd/ ./cmd/
RUN go build -v -o /usr/local/bin/zamunda ./...

CMD ["zamunda","-serve"]