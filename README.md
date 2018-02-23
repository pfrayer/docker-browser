# Docker browser (WIP)

Display your Docker objects (containers, images, layers, volumes etc.) and easily identify which volumes are used by which containers; which layers are used by which images etc.

## Usage

```
docker build -t docker-browser .
docker run -d -p 5000:5000 -v /var/run/docker.sock:/var/run/docker.sock docker-browser:latest
```

## API

See the [API documentation](./doc/README.md).

## TODO

- API:
    - [ ] List layers
    - [ ] Group layers per image
- GUI:
    - [ ] Display images
    - [ ] Display layers
    - [ ] Dislayb link between image & layers
- Project:
    - [ ] Scaffold Vue.js part
