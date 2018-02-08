FROM golang

ENV GOPATH=/go
RUN go get -u github.com/golang/dep/cmd/dep

RUN mkdir -p /go/src/github.com/pclubiitk/puppy-love/service/signup
WORKDIR /go/src/github.com/pclubiitk/puppy-love/service/signup

COPY Gopkg.toml Gopkg.lock ./
# copies the Gopkg.toml and Gopkg.lock to WORKDIR

RUN dep ensure -v -vendor-only

COPY . .
RUN go build

EXPOSE 3001

ENTRYPOINT ["/go/src/github.com/pclubiitk/puppy-love/service/signup/signup"]
