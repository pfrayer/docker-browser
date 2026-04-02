"""Tests for app lifespan, root route, and entrypoint."""

from unittest.mock import MagicMock, patch

from httpx import AsyncClient

import app.app as app_module


async def test_root_returns_html(client: AsyncClient) -> None:
    resp = await client.get("/")
    assert resp.status_code == 200
    assert "text/html" in resp.headers["content-type"]
    assert "Docker Browser" in resp.text


async def test_lifespan_creates_and_closes_client() -> None:
    mock_client = MagicMock()
    with patch.object(app_module.docker, "from_env", return_value=mock_client):
        async with app_module.lifespan(app_module.app):
            assert app_module.client is mock_client
        mock_client.close.assert_called_once()


def test_main_calls_uvicorn_run() -> None:
    with patch.object(app_module.uvicorn, "run") as mock_run:
        app_module.main()
        mock_run.assert_called_once_with("app.app:app", host="0.0.0.0", port=5000)
