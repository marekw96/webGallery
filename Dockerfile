FROM alpine:latest

MAINTAINER marekw96

RUN apk add --no-cache bash git python3 py3-pip zlib-dev libjpeg python3-dev jpeg-dev gcc && \
    apk add --no-cache --virtual .build-deps build-base linux-headers && \
    pip3 install virtualenv && \
    git clone https://github.com/marekw96/webGallery && \
    cd webGallery &&\
    python3 -m venv venv && \
    source venv/bin/activate && \
    pip3 install -r requirements.txt && \
    apk del gcc linux-headers build-base .build-deps

CMD cd webGallery && \
    source venv/bin/activate && \
    python3 Index.py -D FOREGROUND