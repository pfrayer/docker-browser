from flask import Flask
from flask import jsonify
from flask import render_template
import docker

client = docker.from_env()
app = Flask(__name__)


@app.route("/")
def hello():
    return render_template('index.html')


@app.route("/containers")
def containers():
    pretty_containers=named_containers(client.containers.list())
    return jsonify(result=pretty_containers)


@app.route("/containers/exited")
def exited_containers():
    pretty_containers=named_containers(client.containers.list(filters={'status': 'exited'}))
    return jsonify(result=pretty_containers)


@app.route("/images")
def images():
    pretty_images=named_images(client.images.list())
    return jsonify(result=pretty_images)


@app.route("/images/dangling")
def dangling_images():
    images = []
    for image in client.images.list(filters={'dangling': True}):
        images.append(image.attrs)
    return jsonify(result=images)


@app.route("/images/used_by/<container_id>")
def image_used_by(container_id):
    container = client.containers.get(container_id)
    if container.attrs["Image"]:
        return jsonify(result=container.attrs["Image"])


@app.route("/volumes")
def volumes():
    pretty_volumes=named_volumes(client.volumes.list())
    return jsonify(result=pretty_volumes)

@app.route("/volumes/dangling")
def dangling_volumes():
    pretty_volumes=named_volumes(client.volumes.list(filters={'dangling': True}))
    return jsonify(result=pretty_volumes)

@app.route("/volumes/used_by/<container_id>")
def volumes_used_by(container_id):
    container = client.containers.get(container_id)
    if container.attrs["Config"]["Volumes"]:
        return jsonify(result=container.attrs["Config"]["Volumes"])


@app.route("/networks")
def networks():
    networks = []
    for network in client.networks.list(greedy=True):
        if network.attrs["Containers"]:
            networks.append(network)
    pretty_networks=named_networks(networks)
    return jsonify(result=pretty_networks)

@app.route("/networks/dangling")
def dangling_networks():
    networks = []
    for network in client.networks.list(greedy=True):
        if not network.attrs["Containers"]:
            networks.append(network)
    pretty_volumes=named_volumes(networks)
    return jsonify(result=pretty_volumes)

@app.route("/networks/used_by/<container_id>")
def networks_used_by(container_id):
    container = client.containers.get(container_id)
    if container.attrs["NetworkSettings"]["Networks"]:
        return jsonify(result=container.attrs["NetworkSettings"]["Networks"])

# Make pretty maps from Docker API:


def named_containers(api_containers):
    containers = {}
    for container in api_containers:
        if container.attrs["Name"]:
            containers[container.attrs["Name"].strip('/')] = container.attrs
    return containers

def named_images(api_images):
    images = {}
    for image in api_images:
        if image.attrs["RepoTags"]:
            images[image.attrs["RepoTags"][0]] = image.attrs
    return images

def named_volumes(api_volumes):
    volumes = {}
    for volume in api_volumes:
        if volume.attrs["Name"]:
            volumes[volume.attrs["Name"]] = volume.attrs
    return volumes

def named_networks(api_networks):
    networks = {}
    for network in api_networks:
        if network.attrs["Name"]:
            networks[network.attrs["Name"]] = network.attrs
    return networks

#### Main
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
