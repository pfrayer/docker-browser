FROM python:3-alpine
MAINTAINER Pierre FRAYER "pfrayer@gmail.com"

COPY ./app.py /app/app.py
COPY ./requirements.txt /app/requirements.txt
WORKDIR /app

RUN pip install -r requirements.txt
ENTRYPOINT ["python"]
CMD ["app.py"]
