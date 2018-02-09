FROM golang:alpine as builder

RUN apk --no-cache add openssl wget git
ENV GOPATH=/go
RUN wget -O /usr/local/bin/dep https://github.com/golang/dep/releases/download/v0.4.1/dep-$(go env GOOS)-$(go env GOHOSTARCH) && chmod +x /usr/local/bin/dep

RUN mkdir -p /go/src/github.com/pclubiitk/puppy-love
WORKDIR /go/src/github.com/pclubiitk/puppy-love

COPY Gopkg.toml Gopkg.lock ./
# copies the Gopkg.toml and Gopkg.lock to WORKDIR

RUN dep ensure -v -vendor-only

COPY . .
RUN go build

FROM alpine
RUN mkdir -p /go/bin
COPY --from=builder /go/src/github.com/pclubiitk/puppy-love/puppy-love /go/bin

EXPOSE 3000
ENTRYPOINT ["/go/bin/puppy-love"]

