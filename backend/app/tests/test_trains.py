def test_search_trains(client):
    # Search all trains
    res = client.get("/api/trains/search")
    assert res.status_code == 200
    trains = res.json()
    assert len(trains) > 0

    # Search by train number
    res_num = client.get("/api/trains/search?query=22436")
    assert res_num.status_code == 200
    matched = res_num.json()
    assert len(matched) == 1
    assert matched[0]["train_number"] == "22436"
    assert "Vande Bharat" in matched[0]["train_category"]

    # Search by category
    res_cat = client.get("/api/trains/search?category=Rajdhani")
    assert res_cat.status_code == 200
    for t in res_cat.json():
        assert t["train_category"] == "Rajdhani"

def test_get_train_details(client):
    res = client.get("/api/trains/22436")
    assert res.status_code == 200
    detail = res.json()
    assert detail["train_number"] == "22436"
    assert len(detail["routes"]) > 0
    assert detail["routes"][0]["total_stops"] == 4

def test_get_train_route(client):
    res = client.get("/api/routes/22436")
    assert res.status_code == 200
    route = res.json()
    assert route["train_number"] == "22436"
    assert len(route["stops"]) == 4
    assert len(route["coordinates"]) == 4
    assert route["stops"][0]["station_code"] == "NDLS"
    assert route["stops"][-1]["station_code"] == "BSB"
