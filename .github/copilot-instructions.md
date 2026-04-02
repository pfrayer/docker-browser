# Copilot Instructions

## Architecture

Docker Browser is a Flask + jQuery single-page application that visualizes Docker objects (containers, images, volumes, networks) and their relationships. It connects to the Docker daemon via the `docker-py` SDK.

- **Backend**: `app/app.py` — Flask app exposing a REST API and serving one HTML page. Uses `docker.from_env()` to connect to the Docker socket.
- **Frontend**: `app/static/js/docker-browser.js` — jQuery-based SPA that fetches all Docker objects on page load and highlights related objects (image, volumes, networks) when a container is clicked.
- **Containerized**: Runs on `python:3-alpine`, listens on port 5000. Requires `/var/run/docker.sock` mounted into the container.

## API Conventions

All API endpoints return JSON wrapped in a `{"result": ...}` envelope. Unlike the `docker-py` SDK which returns arrays, this API returns **maps keyed by Docker object ID**. Helper functions (`named_containers`, `named_images`, `named_volumes`, `named_networks`) convert SDK objects to these ID-keyed dicts.

Relationship endpoints follow the pattern `/resource/used_by/<container_id>` to find resources associated with a given container.

## Running Locally

```sh
cd app
pip install -r requirements.txt
python app.py
```

The Flask dev server starts on `0.0.0.0:5000` with debug mode enabled. A running Docker daemon is required.

## Building the Docker Image

```sh
docker build -t docker-browser .
docker run -v /var/run/docker.sock:/var/run/docker.sock -p 5000:5000 docker-browser
```

## Frontend Notes

- Uses jQuery 3.3.1 (vendored, not from a CDN)
- Jinja2 templates in `app/templates/`; only `index.html` exists
- Object colors are deterministically generated from IDs using a DJB2 hash → hex color function (`hashStringToColor`)
- Clicking a container highlights its associated image, volumes, and networks via the `used_by` API endpoints
