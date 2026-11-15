# MinIO Community passou a ser distribuído somente como código-fonte.
# Versão fixa publicada pelo projeto; consulte a situação de manutenção no guia.
FROM golang:1-alpine AS builder
ARG MINIO_REF=RELEASE.2025-10-15T17-29-55Z
RUN apk add --no-cache git ca-certificates
ENV CGO_ENABLED=0
RUN go install github.com/minio/minio@${MINIO_REF}

FROM alpine:3
RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -g 10001 minio \
    && adduser -D -H -u 10001 -G minio minio \
    && mkdir /data \
    && chown minio:minio /data
COPY --from=builder /go/bin/minio /usr/local/bin/minio
ENV TZ=America/Sao_Paulo
USER minio
EXPOSE 9000 9001
VOLUME ["/data"]
ENTRYPOINT ["minio"]
CMD ["server", "/data", "--address", ":9000", "--console-address", ":9001"]
