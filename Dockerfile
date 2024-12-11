FROM golang:1.23 AS be
WORKDIR /usr/src/app
COPY ./go.mod ./go.sum  ./
RUN go mod download && go mod verify
COPY ./cmd/ ./
RUN CGO_ENABLED=0 go build -v -o ./maimunda ./...

FROM ubuntu:latest AS user
RUN useradd -u 1001 user
RUN mkdir /var/log/maimunda

FROM scratch
WORKDIR /usr/src/app
COPY --from=user /etc/passwd /etc/passwd
COPY --from=user --chown=user /var/log/maimunda /var/log/maimunda
COPY --from=be /usr/src/app/maimunda ./maimunda
USER user

CMD ["./maimunda","-serve"]