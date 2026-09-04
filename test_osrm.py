import requests

start_lat, start_lng = 25.9000, 91.8800
end_lat, end_lng = 25.9200, 91.8700

url = f"http://router.project-osrm.org/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}?overview=full&geometries=geojson"
res = requests.get(url, timeout=5).json()
coords = res['routes'][0]['geometry']['coordinates']
print(f"Distance: {res['routes'][0]['distance']}m")
print(f"Number of points: {len(coords)}")
