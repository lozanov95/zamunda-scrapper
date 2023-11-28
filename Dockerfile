FROM node:18 as fe
WORKDIR /fe
COPY frontend/package.json .
RUN npm install
COPY frontend ./
RUN npm run build

FROM golang:1.21.3 as be
WORKDIR /usr/src/app
COPY ./go.mod ./go.sum  ./
RUN go mod download && go mod verify
COPY ./cmd/ ./
RUN CGO_ENABLED=0 go build -v -o ./maimunda ./...

FROM scratch
WORKDIR /usr/src/app
COPY --from=be /usr/src/app/maimunda /go/bin/maimunda
COPY --from=fe /fe/dist/ ./ui/
COPY ./config.json ./movies.json ./

CMD ["/go/bin/maimunda","-serve",">>","/var/log/maimunda.log"]