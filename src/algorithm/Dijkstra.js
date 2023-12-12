import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';
import { MinQueue } from 'heapify';

class Dijkstra extends BaseAlgorithm {
  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, [false], null);
    const distance = graph.createTable({ name: "Distance", rows: 1, cols: graphInput.n, initialValue: Infinity });
    const parent = graph.createTable({ name: "Parent", rows: 1, cols: graphInput.n, initialValue: null });
    graph.finalize();

    // --- process graph
    const pq = new MinQueue();
    pq.push(0, 0);
    distance.set(0, 0, 0);
    while (pq.size) {
      const from = pq.pop();
      const u = graph.getVertex(from);
      const visited = u.getAuxiliaryValue(0);

      if (visited) continue;
      u.setAuxiliaryValue(0, true); // mark as visited
      u.setColor(1);
      // u.addHighlight(parent.get(0, from));

      let neighbors;
      graph.subroutine('scan neighbors', () => {
        neighbors = graph.getNeighbors(from);
      });

      for (const { to, weight } of neighbors) {
        // add to next frontier if not visited yet
        const v = graph.getVertex(to);
        if (v.getAuxiliaryValue(0)) continue;
        const newDistance = distance.get(0, from) + weight;
        if (newDistance < distance.get(0, to)) {
          const edge = graph.getEdge(from, to);
          edge.setColor(1);
          const oldedge = graph.getEdge(parent.get(0, to), to);
          if (oldedge) oldedge.setColor(0);
          distance.set(0, to, newDistance);
          parent.set(0, to, from);
          pq.push(to, newDistance);
        }
      }
    }
    return graph;
  }
}
export default Dijkstra;
