FROM golang:alpine as builder

RUN apk --no-cache add openssl wget git
ENV GOPATH=/go
RUN go get -u github.com/golang/dep/cmd/dep

# copies the Gopkg.toml and Gopkg.lock to WORKDIR
RUN mkdir -p /go/src/github.com/pclubiitk/puppy-love/service/results
WORKDIR /go/src/github.com/pclubiitk/puppy-love/service/results
COPY Gopkg.toml Gopkg.lock ./

RUN dep ensure -v -vendor-only

COPY . .
RUN go build

FROM alpine
RUN mkdir -p /go/bin
COPY --from=builder /go/src/github.com/pclubiitk/puppy-love/service/results/results /go/bin

RUN apk --no-cache add ca-certificates
EXPOSE 3001
ENTRYPOINT ["/go/bin/results"]
