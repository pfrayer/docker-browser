FROM python:3-alpine
LABEL MAINTAINER "Pierre FRAYER" 
LABEL MAINTAINER_EMAIL "pfrayer@gmail.com"

COPY app/ /app
WORKDIR /app

EXPOSE 5000

RUN pip install -r /app/requirements.txt
ENTRYPOINT ["python"]
CMD ["app.py"]
