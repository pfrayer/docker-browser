"""Shared test fixtures."""

from collections.abc import AsyncGenerator
from unittest.mock import MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from app.app import app


def make_mock_container(
    container_id: str = "abc123def456",
    name: str = "/test-container",
    image: str = "sha256:img111222333",
    mounts: list | None = None,
    networks: dict | None = None,
) -> MagicMock:
    """Create a mock Docker container object."""
    container = MagicMock()
    container.id = container_id
    container.attrs = {
        "Id": container_id,
        "Name": name,
        "Image": image,
        "Mounts": mounts or [],
        "NetworkSettings": {
            "Networks": networks
            or {
                "bridge": {
                    "NetworkID": "net111222333",
                    "Gateway": "172.17.0.1",
                }
            },
        },
    }
    return container


def make_mock_image(
    image_id: str = "sha256:img111222333",
    repo_tags: list[str] | None = None,
) -> MagicMock:
    """Create a mock Docker image object."""
    image = MagicMock()
    image.id = image_id
    image.attrs = {
        "Id": image_id,
        "RepoTags": repo_tags or ["myapp:latest"],
    }
    return image


def make_mock_volume(
    volume_id: str = "vol111222333",
    driver: str = "local",
) -> MagicMock:
    """Create a mock Docker volume object."""
    volume = MagicMock()
    volume.id = volume_id
    volume.attrs = {
        "Name": volume_id,
        "Driver": driver,
    }
    return volume


def make_mock_network(
    network_id: str = "net111222333",
    name: str = "bridge",
    containers: dict | None = None,
) -> MagicMock:
    """Create a mock Docker network object."""
    network = MagicMock()
    network.id = network_id
    network.attrs = {
        "Id": network_id,
        "Name": name,
        "Containers": containers or {"abc123def456": {"Name": "test-container"}},
    }
    return network


@pytest.fixture
def mock_docker_client() -> MagicMock:
    """Create a fully mocked Docker client."""
    client = MagicMock()
    client.containers.list.return_value = [make_mock_container()]
    client.containers.get.return_value = make_mock_container()
    client.images.list.return_value = [make_mock_image()]
    client.volumes.list.return_value = [make_mock_volume()]
    client.networks.list.return_value = [
        make_mock_network(containers={"abc123def456": {"Name": "test-container"}}),
    ]
    client.df.return_value = {
        "BuildCache": [
            {
                "ID": "bc111222333",
                "Type": "regular",
                "Description": "mount / from exec ...",
                "InUse": False,
                "Shared": False,
                "Size": 1048576,
            }
        ]
    }
    return client


@pytest.fixture
async def client(mock_docker_client: MagicMock) -> AsyncGenerator[AsyncClient]:
    """Create an async test client with mocked Docker."""
    import app.app as app_module

    app_module.client = mock_docker_client
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
