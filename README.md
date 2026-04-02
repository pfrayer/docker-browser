# Docker Browser

Visualize your Docker objects (containers, images, volumes, networks) and easily identify what uses what: which volumes and networks are used by which containers, which images are used by which containers, etc.

![Docker browser](/doc/demo.gif?raw=true)

## Usage

### Docker

```sh
docker run -d \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 5000:5000 \
  pfrayer/docker-browser
```

### Local development

```sh
poetry install
poetry run python -m app.app
```

Then open `http://localhost:5000` in your browser and click on a container to see its related objects highlighted.

## API

FastAPI auto-generates interactive API docs at `/docs` (Swagger UI) and `/redoc`.

See also the [API documentation](./doc/README.md).

## Development

```sh
poetry install               # install all deps (including dev)
poetry run pytest             # run tests
poetry run ruff check .       # lint
poetry run ruff format .      # format
pre-commit install            # install git hooks
```

## TODO

- API:
    - [ ] List layers
    - [ ] Group layers per image
- GUI:
    - [ ] Display layers
    - [ ] Display link between image & layers
