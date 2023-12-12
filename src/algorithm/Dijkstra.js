import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';
import { MinQueue } from 'heapify';

const codeList = [
  'function Dijkstra(graph, start):', // 0
  '// Initialization', // 1
  'create empty set S', // 2
  'create array dist[] with size equal to the number of vertices in the graph', // 3
  'for each vertex v in the graph:', // 4
  '\xa0\xa0\xa0\xa0dist[v] = INFINITY', // 5
  'dist[start] = 0', // 6
  '// Main loop', // 7
  'while S does not include all vertices:', // 8
  '\xa0\xa0\xa0\xa0u = vertex in the graph with the minimum distance value in dist[] not yet added to S', // 9
  '\xa0\xa0\xa0\xa0add u to S', // 10
  '\xa0\xa0\xa0\xa0// Update distances', // 11
  '\xa0\xa0\xa0\xa0for each neighbor v of u:', // 12
  '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0if dist[u] + weight(u, v) < dist[v]:', // 13
  '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0dist[v] = dist[u] + weight(u, v)', // 14
  '// Result', // 15
  'return dist', // 16
];

class Dijkstra extends BaseAlgorithm {
  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, [false], null);
    const distance = graph.createTable({
      name: 'Distance',
      rows: 1,
      cols: graphInput.n,
      initialValue: Infinity,
    });
    const parent = graph.createTable({
      name: 'Parent',
      rows: 1,
      cols: graphInput.n,
      initialValue: null,
    });
    const code = graph.addCode(codeList);
    graph.finalize();

    // --- process graph
    const pq = new MinQueue();
    pq.push(0, 0);
    distance.set(0, 0, 0);
    while (pq.size) {
      code.setLine(8);
      const from = pq.pop();
      code.setLine(9);
      const u = graph.getVertex(from);
      const visited = u.getAuxiliaryValue(0);

      if (visited) continue;
      u.setAuxiliaryValue(0, true); // mark as visited
      u.setColor(1);
      u.addHighlight(2);

      code.setLine(12);
      let neighbors;
      graph.subroutine('scan neighbors', () => {
        neighbors = graph.getNeighbors(from);
      });

      for (const { to, weight } of neighbors) {
        // add to next frontier if not visited yet
        const v = graph.getVertex(to);
        if (v.getAuxiliaryValue(0)) continue;
        const newDistance = distance.get(0, from) + weight;
        code.setLine(13);
        if (newDistance < distance.get(0, to)) {
          code.setLine(14);
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
