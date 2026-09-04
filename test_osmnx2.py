import osmnx as ox
import time

start = time.time()
print("Starting...")
G = ox.graph_from_point((25.5788, 91.8933), dist=1500, network_type='drive')
print(f"Nodes: {len(G.nodes)}")
print(f"Time: {time.time() - start:.2f} s")
