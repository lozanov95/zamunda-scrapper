FROM node:23 AS fe
WORKDIR /fe
COPY frontend/package.json .
RUN npm install
COPY frontend ./
RUN npm run build

FROM golang:1.23.4 AS be
WORKDIR /usr/src/app
COPY ./go.mod ./go.sum  ./
RUN go mod download && go mod verify
COPY ./cmd/ ./
RUN CGO_ENABLED=0 go build -v -o ./maimunda ./...

FROM ubuntu:latest AS user
RUN useradd -u 10001 user

FROM scratch
WORKDIR /usr/src/app
COPY --from=user /etc/passwd /etc/passwd
COPY --from=be /usr/src/app/maimunda /go/bin/maimunda
COPY --from=fe /fe/dist/ ./ui/
COPY ./config.json ./movies.json ./
USER user

CMD ["/go/bin/maimunda","-serve"]