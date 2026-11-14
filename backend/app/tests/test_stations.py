def test_search_and_autocomplete_stations(client):
    # Autocomplete
    res = client.get("/api/stations/autocomplete?term=ND")
    assert res.status_code == 200
    stations = res.json()
    assert any(s["code"] == "NDLS" for s in stations)

    # Station Details
    res_detail = client.get("/api/stations/NDLS")
    assert res_detail.status_code == 200
    st_data = res_detail.json()
    assert st_data["code"] == "NDLS"
    assert st_data["name"] == "New Delhi"
    assert len(st_data["platforms"]) > 0

    # Station Timetable
    res_tt = client.get("/api/stations/NDLS/timetable")
    assert res_tt.status_code == 200
    tt = res_tt.json()
    assert isinstance(tt, list)
    assert len(tt) > 0
