# Docker Browser

Visualize your Docker objects (containers, images, volumes, networks) and easily identify what uses what: which volumes and networks are used by which containers, which images are used by which containers, etc.

![Docker browser](/doc/demo.gif?raw=true)

## Stack

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) + [docker-py](https://docker-py.readthedocs.io/) (async via `asyncio.to_thread`)
- **Frontend**: [Vue.js 3](https://vuejs.org/) (CDN, no build step) + vanilla CSS

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
cd app
pip install -r requirements.txt
python app.py
```

Then open `http://localhost:5000` in your browser and click on a container to see its related objects highlighted.

## API

FastAPI auto-generates interactive API docs at `/docs` (Swagger UI) and `/redoc`.

See also the [API documentation](./doc/README.md).

## TODO

- API:
    - [ ] List layers
    - [ ] Group layers per image
- GUI:
    - [ ] Display layers
    - [ ] Display link between image & layers
