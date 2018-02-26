# Docker browser

Visualize your Docker objects (containers, images, volumes...) and easily identify what uses what: which volumes and networks are used by which containers; which layers are used by which images etc.

![Docker browser](/doc/demo.gif?raw=true)

## Usage

```
docker run -d \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 5000:5000 \
  pfrayer/docker-browser
```

## API

See the [API documentation](./doc/README.md).

## TODO

- API:
    - [ ] List layers
    - [ ] Group layers per image
- GUI:
    - [ ] Display layers
    - [ ] Dislay link between image & layers
