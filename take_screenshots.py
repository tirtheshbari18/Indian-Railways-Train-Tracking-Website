import os
import time
from playwright.sync_api import sync_playwright

PAGES = [
    ("01_home_dashboard.png", "http://localhost:5173/"),
    ("02_train_search.png", "http://localhost:5173/train-search"),
    ("03_live_status.png", "http://localhost:5173/live-status/22436"),
    ("04_train_route.png", "http://localhost:5173/train-route?train=12951"),
    ("05_station_search.png", "http://localhost:5173/stations"),
    ("06_station_details_live_board.png", "http://localhost:5173/stations/NDLS"),
    ("07_train_timetable.png", "http://localhost:5173/timetable"),
    ("08_train_comparison.png", "http://localhost:5173/comparison"),
    ("09_railway_map.png", "http://localhost:5173/railway-map"),
    ("10_login_portal.png", "http://localhost:5173/login"),
    ("11_admin_dashboard.png", "http://localhost:5173/admin"),
    ("12_system_status.png", "http://localhost:5173/system-status")
]

def main():
    screenshots_dir = os.path.join(os.path.dirname(__file__), "screenshots")
    os.makedirs(screenshots_dir, exist_ok=True)

    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    chrome_path = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    exec_path = edge_path if os.path.exists(edge_path) else chrome_path

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=exec_path,
            headless=True
        )
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        for filename, url in PAGES:
            print(f"Capturing {filename} from {url}...")
            try:
                page.goto(url, wait_until="networkidle", timeout=20000)
                time.sleep(1.2)
                save_path = os.path.join(screenshots_dir, filename)
                page.screenshot(path=save_path, full_page=False)
                print(f"  -> Saved {save_path}")
            except Exception as e:
                print(f"  -> Failed {filename}: {e}")

        browser.close()
    print("All screenshots successfully captured.")

if __name__ == "__main__":
    main()
