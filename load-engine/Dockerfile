# Aegis OS Go Load Engine Worker
FROM golang:1.22-alpine AS builder

WORKDIR /app
# We use k6 as the foundation, but extend it with xk6 for Kafka/Redis streaming
RUN go install go.k6.io/xk6/cmd/xk6@latest
RUN xk6 build --with github.com/grafana/xk6-output-kafka --output /k6

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=builder /k6 /usr/bin/k6

# Entrypoint is overridden by docker-compose to run specific scripts
ENTRYPOINT ["k6"]
