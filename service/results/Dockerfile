FROM golang:1.7

# File Author / Maintainer
MAINTAINER Saksham Sharma

RUN curl https://glide.sh/get | sh

ENV GOPATH /go
ENV PUPPYPATH /go/src/github.com/pclubiitk/puppy-love
ENV SERVPATH /go/src/github.com/pclubiitk/puppy-love/service/results

RUN mkdir -p $SERVPATH
WORKDIR $SERVPATH

COPY glide.yaml $SERVPATH
COPY glide.lock $SERVPATH
RUN glide install

COPY . $SERVPATH
RUN cd $SERVPATH && go build

EXPOSE 3001

ENTRYPOINT ["/go/src/github.com/pclubiitk/puppy-love/service/results/results"]
