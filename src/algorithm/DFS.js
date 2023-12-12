import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class DFS extends BaseAlgorithm {
  dfs(graph, from, hops, arrivaldeparture) {
    const u = graph.getVertex(from);
    const visited = u.getAuxiliaryValue(0);

    if (visited) return;
    u.setAuxiliaryValue(0, true); // mark as visited
    u.setColor(1);
    u.addHighlight(hops + 1);

    console.log(this.plane);
    arrivaldeparture.set(0, from, [this.plane, null]);
    this.plane += 1;

    let neighbors;
    graph.subroutine('scan neighbors', () => {
      neighbors = graph.getNeighbors(from);
    });

    for (const { to } of neighbors) {
      // add to next frontier if not visited yet
      const v = graph.getVertex(to);
      if (v.getAuxiliaryValue(0)) continue;
      this.dfs(graph, to, hops + 1, arrivaldeparture);
    }

    console.log(this.plane);
    arrivaldeparture.set(0, from, [arrivaldeparture.get(0, from)[0], this.plane]);
    this.plane += 1;
  }

  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, [false], null);
    const arrivaldeparture = graph.createTable(1, graphInput.n, [null, null], (x) => x[0] + ',' + x[1]);
    this.plane = 0;
    graph.finalize();

    // --- process graph
    for (let from = 0; from < graphInput.n; ++from) {
      this.dfs(graph, from, 0, arrivaldeparture);
    }
    return graph;
  }
}
export default DFS;
