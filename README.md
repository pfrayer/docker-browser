# Docker browser

Display your Docker objects (containers, images, layers, volumes etc.)

## Usage

```
docker build -t docker-browser .
docker run -d -p 5000:5000 -v /var/run/docker.sock:/var/run/docker.sock docker-browser:latest
```

## API

#### Images

List images metadata per image:

```
GET /images
```

List all images:

```
GET /images/all
```

List dangling images:

```
GET /images/dangling
```

#### Containers

List all containerss

```
GET /containers
```

#### Volumes

List all volumes:

```
/volumes
```

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
    - [ ] Dockerize
