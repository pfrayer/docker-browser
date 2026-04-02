"""Tests for volume endpoints."""

from unittest.mock import MagicMock

from httpx import AsyncClient

from tests.conftest import make_mock_container, make_mock_volume


async def test_list_volumes(client: AsyncClient) -> None:
    resp = await client.get("/volumes")
    assert resp.status_code == 200
    data = resp.json()
    assert "result" in data
    assert "vol111222333" in data["result"]
    assert data["result"]["vol111222333"]["Driver"] == "local"


async def test_list_dangling_volumes(client: AsyncClient, mock_docker_client: MagicMock) -> None:
    dangling = make_mock_volume(volume_id="vol_dangling")
    mock_docker_client.volumes.list.return_value = [dangling]
    resp = await client.get("/volumes/dangling")
    assert resp.status_code == 200


async def test_volumes_used_by_container(
    client: AsyncClient, mock_docker_client: MagicMock
) -> None:
    container = make_mock_container(
        mounts=[
            {"Type": "volume", "Name": "my-data", "Destination": "/data"},
            {"Type": "bind", "Source": "/host/path", "Destination": "/bind"},
        ]
    )
    mock_docker_client.containers.get.return_value = container
    resp = await client.get("/volumes/used_by/abc123def456")
    assert resp.status_code == 200
    result = resp.json()["result"]
    assert "my-data" in result
    assert len(result) == 1  # bind mount should be excluded


async def test_volumes_used_by_no_mounts(
    client: AsyncClient, mock_docker_client: MagicMock
) -> None:
    container = make_mock_container(mounts=[])
    mock_docker_client.containers.get.return_value = container
    resp = await client.get("/volumes/used_by/abc123def456")
    assert resp.status_code == 200
    assert resp.json()["result"] == {}
