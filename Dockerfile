FROM golang:1.7

# File Author / Maintainer
MAINTAINER Saksham Sharma

RUN curl https://glide.sh/get | sh

ENV GOPATH /go
ENV PUPPYPATH /go/src/github.com/pclubiitk/puppy-love

RUN mkdir -p $PUPPYPATH
WORKDIR $PUPPYPATH

COPY glide.yaml $PUPPYPATH
COPY glide.lock $PUPPYPATH
RUN cd $PUPPYPATH && glide install

COPY . $PUPPYPATH
RUN cd $PUPPYPATH && go build

EXPOSE 3000

ENTRYPOINT ["/go/src/github.com/pclubiitk/puppy-love/puppy-love"]
