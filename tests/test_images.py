"""Tests for image endpoints."""

from unittest.mock import MagicMock

from httpx import AsyncClient

from tests.conftest import make_mock_image


async def test_list_images(client: AsyncClient) -> None:
    resp = await client.get("/images")
    assert resp.status_code == 200
    data = resp.json()
    assert "result" in data
    assert "sha256:img111222333" in data["result"]
    assert data["result"]["sha256:img111222333"]["RepoTags"] == ["myapp:latest"]


async def test_list_dangling_images(client: AsyncClient, mock_docker_client: MagicMock) -> None:
    dangling = make_mock_image(image_id="sha256:dangling999", repo_tags=[])
    mock_docker_client.images.list.return_value = [dangling]
    resp = await client.get("/images/dangling")
    assert resp.status_code == 200
    assert "result" in data if (data := resp.json()) else False


async def test_image_used_by_container(client: AsyncClient) -> None:
    resp = await client.get("/images/used_by/abc123def456")
    assert resp.status_code == 200
    assert resp.json()["result"] == "sha256:img111222333"
