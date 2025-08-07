FROM golang:1.21-alpine

WORKDIR /app

COPY . .

RUN go mod tidy && go build -o auth-service main.go

EXPOSE 8000

CMD ["./auth-service"]