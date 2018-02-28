## API

These APIs are calling the Docker daemon through the [docker-py](https://docker-py.readthedocs.io/en/stable/) module.

The main difference is that `docker-py` API always return **arrays**, where here we return **maps** where the keys are docker object's ID.


#### Containers

List all running containers:

```
GET /containers
```


Response: a **map** of [containers object](https://docker-py.readthedocs.io/en/stable/containers.html#container-objects). The key for each container is the container ID.

```
{
  "result":
  {
    "3c2cefa1e5413abd8a7ab24adf0b9eb91e5759e0361badc31120fda54771c163":
    {
      "AppArmorProfile": "docker-default",
      "Args": [],
      "Config":
      ...
    },
    "85c2500838c11ddfebde7eef8a735b2703f93792e0bf64ac26fb0581f3c53e81":
    {
      "AppArmorProfile": "docker-default",
      "Args": [
        "postgres"
      ],
      "Config":
       ...
    }
  }
}
```

List all exited containers:

```
GET /containers/exited
```

Response: a **map** of [containers object](https://docker-py.readthedocs.io/en/stable/containers.html#container-objects). The key for each container is the container ID.

```
{
  "result":
  {
    "022730505f3dc04777d9400fc3f667ee7187bd226d3fc07db3de1adc369a0002":
    {
      "AppArmorProfile": "docker-default",
      "Args": [
        "--",
        "/usr/local/bin/jenkins.sh"
      ],
      "Config":
      ...
    },
    "85c2500838c11ddfebde7eef8a735b2703f93792e0bf64ac26fb0581f3c53e81":
    {
      "AppArmorProfile": "docker-default",
      "Args": [
        "postgres"
      ],
      "Config":
       ...
    }
  }
}
```

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

#### Volumes

List all volumes:

```
/volumes
```
