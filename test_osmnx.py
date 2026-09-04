import osmnx as ox
import networkx as nx
import time

start = time.time()
G = ox.graph_from_point((25.5788, 91.8933), dist=5000, network_type='drive')
end = time.time()
print(f"Nodes: {len(G.nodes)}")
print(f"Time: {end - start:.2f} s")
