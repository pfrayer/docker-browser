import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import docker
import uvicorn
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent
client: docker.DockerClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    client = docker.from_env()
    yield
    client.close()


app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


# --- Routes ---

@app.get("/")
async def root() -> FileResponse:
    return FileResponse(BASE_DIR / "templates" / "index.html")


@app.get("/containers")
async def containers() -> dict[str, Any]:
    items = await asyncio.to_thread(client.containers.list)
    return {"result": named_containers(items)}


@app.get("/containers/exited")
async def exited_containers() -> dict[str, Any]:
    items = await asyncio.to_thread(client.containers.list, filters={"status": "exited"})
    return {"result": named_containers(items)}


@app.get("/images")
async def images() -> dict[str, Any]:
    items = await asyncio.to_thread(client.images.list)
    return {"result": named_images(items)}


@app.get("/images/dangling")
async def dangling_images() -> dict[str, Any]:
    items = await asyncio.to_thread(client.images.list, filters={"dangling": True})
    return {"result": named_images(items)}


@app.get("/images/used_by/{container_id}")
async def image_used_by(container_id: str) -> dict[str, Any]:
    container = await asyncio.to_thread(client.containers.get, container_id)
    return {"result": container.attrs["Image"]}


@app.get("/volumes")
async def volumes() -> dict[str, Any]:
    items = await asyncio.to_thread(client.volumes.list)
    return {"result": named_volumes(items)}


@app.get("/volumes/dangling")
async def dangling_volumes() -> dict[str, Any]:
    items = await asyncio.to_thread(client.volumes.list, filters={"dangling": True})
    return {"result": named_volumes(items)}


@app.get("/volumes/used_by/{container_id}")
async def volumes_used_by(container_id: str) -> dict[str, Any]:
    container = await asyncio.to_thread(client.containers.get, container_id)
    result: dict[str, Any] = {}
    if container.attrs["Mounts"]:
        for mount in container.attrs["Mounts"]:
            if mount["Type"] == "volume":
                result[mount["Name"]] = mount
    return {"result": result}


@app.get("/networks")
async def networks() -> dict[str, Any]:
    all_networks = await asyncio.to_thread(client.networks.list, greedy=True)
    active = [n for n in all_networks if n.attrs["Containers"]]
    return {"result": named_networks(active)}


@app.get("/networks/dangling")
async def dangling_networks() -> dict[str, Any]:
    all_networks = await asyncio.to_thread(client.networks.list, greedy=True)
    dangling = [n for n in all_networks if not n.attrs["Containers"]]
    return {"result": named_networks(dangling)}


@app.get("/networks/used_by/{container_id}")
async def networks_used_by(container_id: str) -> dict[str, Any]:
    container = await asyncio.to_thread(client.containers.get, container_id)
    return {"result": container.attrs["NetworkSettings"]["Networks"] or {}}


# --- Helpers ---

def named_containers(api_containers: list) -> dict[str, Any]:
    return {c.id: c.attrs for c in api_containers}


def named_images(api_images: list) -> dict[str, Any]:
    return {i.id: i.attrs for i in api_images}


def named_volumes(api_volumes: list) -> dict[str, Any]:
    return {v.id: v.attrs for v in api_volumes}


def named_networks(api_networks: list) -> dict[str, Any]:
    return {n.id: n.attrs for n in api_networks}


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
