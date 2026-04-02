"""Tests for network endpoints."""

from unittest.mock import MagicMock

from httpx import AsyncClient

from tests.conftest import make_mock_container, make_mock_network


async def test_list_networks(client: AsyncClient) -> None:
    resp = await client.get("/networks")
    assert resp.status_code == 200
    data = resp.json()
    assert "result" in data
    assert "net111222333" in data["result"]
    assert data["result"]["net111222333"]["Name"] == "bridge"


async def test_list_dangling_networks(client: AsyncClient, mock_docker_client: MagicMock) -> None:
    dangling = make_mock_network(network_id="net_unused", name="unused-net", containers=None)
    dangling.attrs["Containers"] = None
    mock_docker_client.networks.list.return_value = [dangling]
    resp = await client.get("/networks/dangling")
    assert resp.status_code == 200


async def test_networks_used_by_container(client: AsyncClient) -> None:
    resp = await client.get("/networks/used_by/abc123def456")
    assert resp.status_code == 200
    result = resp.json()["result"]
    assert "bridge" in result
    assert result["bridge"]["NetworkID"] == "net111222333"


async def test_networks_used_by_no_networks(
    client: AsyncClient, mock_docker_client: MagicMock
) -> None:
    container = make_mock_container()
    container.attrs["NetworkSettings"]["Networks"] = None
    mock_docker_client.containers.get.return_value = container
    resp = await client.get("/networks/used_by/abc123def456")
    assert resp.status_code == 200
    assert resp.json()["result"] == {}
