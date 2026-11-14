def test_live_running_status(client):
    res = client.get("/api/live-status/22436")
    assert res.status_code == 200
    status_data = res.json()
    assert status_data["train_number"] == "22436"
    assert "status" in status_data
    assert "current_speed_kmh" in status_data
    assert "distance_covered_km" in status_data
    assert "distance_remaining_km" in status_data
    assert "progress_percentage" in status_data
    assert "data_source_type" in status_data
    assert "is_live_verified" in status_data
    assert len(status_data["stops_timeline"]) > 0

def test_live_status_nonexistent_train(client):
    res = client.get("/api/live-status/99999")
    assert res.status_code == 404
