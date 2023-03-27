FROM node as fe
WORKDIR /fe
COPY frontend ./
RUN npm install
RUN npm run build

FROM golang:1.19
WORKDIR /usr/src/app
COPY ./go.mod ./go.sum ./config.json ./movies.json ./cmd/ ./
COPY --from=fe /fe/dist/ ./ui/
RUN go mod download && go mod verify
RUN go build -v -o /usr/local/bin/maimunda ./...

CMD ["maimunda","-serve"]