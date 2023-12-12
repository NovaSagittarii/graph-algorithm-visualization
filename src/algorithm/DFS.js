import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class DFS extends BaseAlgorithm {
  dfs(graph, from, hops, arrivaldeparture, plane) {
    const u = graph.getVertex(from);
    const visited = u.getAuxiliaryValue(0);

    arrivaldeparture.set(0, from, [plane, null]);
    let arr = plane;
    plane += 1;

    if (visited) return;
    u.setAuxiliaryValue(0, true); // mark as visited
    u.setColor(1);
    u.addHighlight(hops + 1);

    let neighbors;
    graph.subroutine('scan neighbors', () => {
      neighbors = graph.getNeighbors(from);
    });

    for (const { to } of neighbors) {
      // add to next frontier if not visited yet
      const v = graph.getVertex(to);
      if (v.getAuxiliaryValue(0)) continue;
      plane = this.dfs(graph, to, hops + 1, arrivaldeparture, plane);
    }
    arrivaldeparture.set(0, from, [arr, plane]);
    plane += 1;
    return plane;
  }

  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, [false], null);
    const arrivaldeparture = graph.createTable(1, graphInput.n, [null, null], (x) => x[0] + ',' + x[1]);
    let plane = 0;
    graph.finalize();

    // --- process graph
    this.dfs(graph, 0, 0, arrivaldeparture, plane);
    return graph;
  }
}
export default DFS;
