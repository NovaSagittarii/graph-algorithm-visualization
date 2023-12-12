import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class ToplogicalSort extends BaseAlgorithm {
  topo(graph, result, table) {
    let n = graph.vertices.length;
    let counter = 0; // index for result array
    const numbers = Array.from({ length: n }, (_, index) => index);
    // precalculating all incoming edges count
    for (let i = 0; i < n; i++) {
      let neigh = graph.getNeighbors(i);
      // incrementing value when edge is found
      for (const { to } of neigh) {
        graph
          .getVertex(to)
          .setAuxiliaryValue(0, graph.getVertex(to).getAuxiliaryValue(0) + 1);
      }
    }
    for (let i = 0; i < n; i++) {
      table.set(0, i, graph.getVertex(i).getAuxiliaryValue(0)); // setting in table for visuals
    }
    const vals = numbers.map((number) => [
      number,
      graph.getVertex(number).getAuxiliaryValue(0),
    ]);
    let filteredTuples = vals.filter((tuple) => tuple[1] === 0);

    while (filteredTuples.length > 0) {
      // while there are verticies with 0 incoming edges
      for (const [v] of filteredTuples) {
        result.set(0, counter, v); // adding to our topo sort (greedy)
        counter++;
        for (const { to } of graph.getNeighbors(v)) {
          // decrementing counts by incrementing
          vals[to][1] -= 1;
          table.set(0, to, vals[to][1]);
        }
        vals[v][1] = -1; // to avoid recounting.
      }
      filteredTuples = vals.filter((tuple) => tuple[1] === 0);
    }

    return graph;
  }

  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, [0], null);
    const result = graph.createTable(1, graphInput.n, -1);
    const table = graph.createTable(1, graphInput.n, 0);
    graph.finalize();

    // --- process graph
    this.topo(graph, result, table);
    return graph;
  }
}
export default ToplogicalSort;
