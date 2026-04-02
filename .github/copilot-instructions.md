# Copilot Instructions

## Architecture

Docker Browser is a FastAPI + Vue.js 3 single-page application that visualizes Docker objects (containers, images, volumes, networks) and their relationships. It connects to the Docker daemon via docker-py, with all Docker calls wrapped in `asyncio.to_thread()` for async operation.

- **Backend**: `app/app.py` — FastAPI app with async route handlers. Uses a lifespan context manager for the Docker client lifecycle. Serves static files via `StaticFiles` and the SPA via `FileResponse`.
- **Frontend**: `app/static/js/docker-browser.js` — Vue 3 Composition API app loaded as an ES module from CDN (no build step). Uses native `fetch()` and `Promise.all` for parallel data loading.
- **Template**: `app/templates/index.html` — contains the Vue template inline with `v-for`, `@click`, `:class`, `:style` directives.
- **Containerized**: Runs on `python:3-alpine` with uvicorn, listens on port 5000. Requires `/var/run/docker.sock` mounted.

## API Conventions

All API endpoints return JSON wrapped in a `{"result": ...}` envelope. Unlike docker-py which returns arrays, this API returns **maps keyed by Docker object ID**. FastAPI auto-generates docs at `/docs` (Swagger) and `/redoc`.

Relationship endpoints follow the pattern `/resource/used_by/{container_id}` to find resources associated with a given container.

## Build, Test, and Lint

```sh
poetry install                    # install all deps (including dev)
poetry run pytest                 # run all tests with coverage
poetry run pytest tests/test_app.py::test_root_returns_html  # run a single test
poetry run ruff check .           # lint
poetry run ruff format .          # format
```

**Important**: After every code change, run `poetry run pytest` to verify tests pass and coverage stays at 100%. Do not present changes without confirming tests pass. The test suite enforces `--cov-fail-under=100`.

## Building the Docker Image

```sh
docker build -t docker-browser .
docker run -v /var/run/docker.sock:/var/run/docker.sock -p 5000:5000 docker-browser
```

## Frontend Notes

- Vue 3 via CDN (`unpkg.com/vue@3`), no npm or build step required
- Object colors are deterministically generated from IDs using a DJB2 hash → hex color function
- Clicking any Docker object highlights related objects (containers, images, volumes, networks)
- CSS uses flexbox layout with transitions for highlight effects
