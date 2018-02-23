FROM python:3-alpine
MAINTAINER Pierre FRAYER "pfrayer@gmail.com"

COPY app/ /app
WORKDIR /app

RUN pip install -r /app/requirements.txt
ENTRYPOINT ["python"]
CMD ["app.py"]
