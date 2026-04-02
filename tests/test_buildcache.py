"""Tests for build cache endpoint."""

from unittest.mock import MagicMock

from httpx import AsyncClient


async def test_list_buildcache(client: AsyncClient) -> None:
    resp = await client.get("/buildcache")
    assert resp.status_code == 200
    data = resp.json()
    assert "result" in data
    assert "bc111222333" in data["result"]
    assert data["result"]["bc111222333"]["Type"] == "regular"
    assert data["result"]["bc111222333"]["Size"] == 1048576


async def test_list_buildcache_empty(client: AsyncClient, mock_docker_client: MagicMock) -> None:
    mock_docker_client.df.return_value = {"BuildCache": []}
    resp = await client.get("/buildcache")
    assert resp.status_code == 200
    assert resp.json()["result"] == {}


async def test_list_buildcache_none(client: AsyncClient, mock_docker_client: MagicMock) -> None:
    mock_docker_client.df.return_value = {}
    resp = await client.get("/buildcache")
    assert resp.status_code == 200
    assert resp.json()["result"] == {}
