FROM node as fe
WORKDIR /fe
COPY frontend/package.json .
RUN npm install
COPY frontend ./
RUN npm run build

FROM golang:1.20
WORKDIR /usr/src/app
COPY ./go.mod ./go.sum  ./
RUN go mod download && go mod verify
COPY ./cmd/ ./config.json ./movies.json ./
COPY --from=fe /fe/dist/ ./ui/
RUN go build -v -o /usr/local/bin/maimunda ./...

CMD ["maimunda","-serve"]