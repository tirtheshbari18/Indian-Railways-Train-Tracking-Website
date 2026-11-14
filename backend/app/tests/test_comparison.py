def test_train_comparison(client):
    res = client.post("/api/comparison/compare", json={
        "train_numbers": ["22436", "12002"]
    })
    assert res.status_code == 200
    comp = res.json()
    assert len(comp["trains"]) == 2
    assert "fastest_train_number" in comp
    assert "least_stops_train_number" in comp
    assert "highest_punctuality_train_number" in comp
    assert comp["least_stops_train_number"] == "22436"

def test_train_comparison_invalid_count(client):
    res = client.post("/api/comparison/compare", json={
        "train_numbers": ["22436"]
    })
    assert res.status_code == 400
