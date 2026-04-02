"""Tests for container endpoints."""

from unittest.mock import MagicMock

from httpx import AsyncClient

from tests.conftest import make_mock_container


async def test_list_containers(client: AsyncClient) -> None:
    resp = await client.get("/containers")
    assert resp.status_code == 200
    data = resp.json()
    assert "result" in data
    assert "abc123def456" in data["result"]
    assert data["result"]["abc123def456"]["Name"] == "/test-container"


async def test_list_exited_containers(client: AsyncClient, mock_docker_client: MagicMock) -> None:
    exited = make_mock_container(container_id="exited999", name="/stopped")
    mock_docker_client.containers.list.return_value = [exited]
    resp = await client.get("/containers/exited")
    assert resp.status_code == 200
    data = resp.json()
    assert "result" in data


async def test_list_containers_empty(client: AsyncClient, mock_docker_client: MagicMock) -> None:
    mock_docker_client.containers.list.return_value = []
    resp = await client.get("/containers")
    assert resp.status_code == 200
    assert resp.json()["result"] == {}
