FROM golang:1.19
WORKDIR /usr/src/app
COPY ./go.mod ./go.sum ./config.json ./movies.json ./cmd/ ./
COPY ./frontend/dist ./ui
RUN go mod download && go mod verify
RUN go build -v -o /usr/local/bin/zamunda ./...

CMD ["zamunda","-serve"]