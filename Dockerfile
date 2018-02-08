FROM golang

ENV GOPATH=/go
RUN go get -u github.com/golang/dep/cmd/dep

RUN mkdir -p /go/src/github.com/pclubiitk/puppy-love
WORKDIR /go/src/github.com/pclubiitk/puppy-love

COPY Gopkg.toml Gopkg.lock ./
# copies the Gopkg.toml and Gopkg.lock to WORKDIR

RUN dep ensure -v -vendor-only

COPY . .
RUN go build

EXPOSE 3000

ENTRYPOINT ["/go/src/github.com/pclubiitk/puppy-love/puppy-love"]

