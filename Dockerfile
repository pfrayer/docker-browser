FROM python:3-alpine

COPY pyproject.toml poetry.lock README.md /app/
WORKDIR /app
RUN pip install --no-cache-dir poetry && \
    poetry config virtualenvs.create false && \
    poetry install --only main --no-root --no-interaction

COPY app/ /app/app/
RUN poetry install --only main --no-interaction

EXPOSE 5000
CMD ["docker-browser"]
