from flask import Flask
from flask import jsonify
import docker

client = docker.from_env()
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

#### Images
@app.route("/images")
def images():
    images = {}
    for image in client.images.list():
        if image.attrs["RepoTags"]:
            images[image.attrs["RepoTags"][0]] = image.attrs
    return jsonify(result=images)

@app.route("/images/all")
def all_images():
    images = []
    for image in client.images.list(all=True):
        images.append(image.attrs)
    return jsonify(result=images)

@app.route("/images/dangling")
def dangling_images():
    images = []
    for image in client.images.list(filters={'dangling': True}):
        images.append(image.attrs)
    return jsonify(result=images)

#### Volumes
@app.route("/volumes")
def volumes():
    volumes = []
    for config in client.volumes.list():
        volumes.append(config.attrs)
    return jsonify(result=volumes)

#### Containers
@app.route("/containers")
def containers():
    containers = []
    for container in client.containers.list():
        containers.append(container.attrs)
    return jsonify(result=containers)

#### Main
if __name__ == '__main__':
    app.run(debug=True)
