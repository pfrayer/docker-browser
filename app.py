from flask import Flask
from flask import jsonify
import docker

client = docker.from_env()
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/images")
def images():
	images = []
	for image in client.images.list():
		images.append(image.attrs)
	return jsonify(result=images)

@app.route("/containers")
def containers():
	containers = []
	for container in client.containers.list():
		containers.append(container.attrs)
	return jsonify(result=containers)

if __name__ == '__main__':
    app.run(debug=True)
