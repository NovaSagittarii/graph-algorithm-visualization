import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class DFS extends BaseAlgorithm {
  dfs(graph, from, hops, visits) {
    const u = graph.getVertex(from);
    const visited = u.getAuxiliaryValue(0);

    visits.set(0, from, visits.get(0, from) + 1); // increment a table element

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
      this.dfs(graph, to, hops + 1, visits);
    }
  }

  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, [false], null);
    const visits = graph.createTable("Table", 1, graphInput.n, 0);
    graph.finalize();

    // --- process graph
    this.dfs(graph, 0, 0, visits);
    return graph;
  }
}
export default DFS;
