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
    return jsonify( result=named_containers(client.containers.list()) )

@app.route("/containers/exited")
def exited_containers():
    return jsonify( result=named_containers(client.containers.list(filters={'status': 'exited'})) )



@app.route("/images")
def images():
    return jsonify( result=named_images(client.images.list()) )

@app.route("/images/dangling")
def dangling_images():
    return jsonify( result=named_images(client.images.list(filters={'dangling': True})) )

@app.route("/images/used_by/<container_id>")
def image_used_by(container_id):
    container = client.containers.get(container_id)
    return jsonify( result=container.attrs["Image"] )


@app.route("/volumes")
def volumes():
    return jsonify( result=named_volumes(client.volumes.list()) )

@app.route("/volumes/dangling")
def dangling_volumes():
    return jsonify( result=named_volumes(client.volumes.list(filters={'dangling': True})) )

@app.route("/volumes/used_by/<container_id>")
def volumes_used_by(container_id):
    volumes = {}
    container = client.containers.get(container_id)
    if container.attrs["Mounts"]:
        for mount in container.attrs["Mounts"]:
            if mount["Type"] == "volume":
                volumes[mount["Name"]] = mount
    return jsonify( result=volumes )


@app.route("/networks")
def networks():
    networks = []
    for network in client.networks.list(greedy=True):
        if network.attrs["Containers"]:
            networks.append(network)
    return jsonify( result=named_networks(networks) )

@app.route("/networks/dangling")
def dangling_networks():
    networks = []
    for network in client.networks.list(greedy=True):
        if not network.attrs["Containers"]:
            networks.append(network)
    return jsonify( result=named_volumes(networks) )

@app.route("/networks/used_by/<container_id>")
def networks_used_by(container_id):
    container = client.containers.get(container_id)
    if container.attrs["NetworkSettings"]["Networks"]:
        return jsonify( result=container.attrs["NetworkSettings"]["Networks"] )
    else:
        return jsonify( result={} )

# Make pretty maps from Docker API:
def named_containers(api_containers):
    containers = {}
    for container in api_containers:
        containers[container.id] = container.attrs
    return containers

def named_images(api_images):
    images = {}
    for image in api_images:
        images[image.id] = image.attrs
    return images

def named_volumes(api_volumes):
    volumes = {}
    for volume in api_volumes:
        volumes[volume.id] = volume.attrs
    return volumes

def named_networks(api_networks):
    networks = {}
    for network in api_networks:
        networks[network.id] = network.attrs
    return networks

# Main
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
