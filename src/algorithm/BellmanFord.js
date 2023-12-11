import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class BellmanFord extends BaseAlgorithm {
  initializeColumn(ltable, ptable, column) {
    for (let i = 0; i < ltable.length; ++i) {
      ltable[i][column] = ltable[i][column - 1];
      ptable[i][column] = ptable[i][column - 1];
    }
  }
  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, null, null);
    const length = graph.createTable(graphInput.n, graphInput.n + 1, Infinity);
    const parent = graph.createTable(graphInput.n, graphInput.n + 1, null);

    graph.finalize();

    // --- process graph
    let modified = [0];
    length.set(0, 0, 0);
    parent.set(0, 0, 0);
    for (let iteration = 1; iteration < graphInput.n + 1; ++iteration) {
      this.initializeColumn(length, parent, iteration);
      let nextModified = [];
      for (const from of modified) {
        const u = graph.getVertex(from);
        const neighbors = graph.getNeighbors(from);
        for (const { to, weight } of neighbors) {
          const v = graph.getVertex(to);
          const newLength = length.get(from, iteration - 1) + weight;
          if (newLength < length.get(to, iteration)) {
            const edge = graph.getEdge(from, to);
            edge.setColor(1);
            const oldedge = graph.getEdge(from, parent.get(to, iteration));
            if (oldedge) oldedge.setColor(0);
            length.set(to, iteration, newLength);
            parent.set(to, iteration, from);
            nextModified.push(to);
          }
        }
      }
      modified = nextModified;
    }
    // Check if negative cycle exists
    for (let from = 0; from < graphInput.n; ++from) {
      const last = length.get(from, graphInput.n - 1);
      const extra = length.get(from, graphInput.n);
      if (last !== extra) {
        console.log(`Negative cycle detected at ${from}`);
        break;
      }
    }
    return graph;
  }
}
export default BellmanFord;
