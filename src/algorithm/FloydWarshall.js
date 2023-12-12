import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class FloydWarshall extends BaseAlgorithm {
  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, null, null);
    const collabels = [...Array(graphInput.n).keys()].map((x) => `${x}`);
    const rowlabels = [...Array(graphInput.n).keys()].map((x) => `${x}`);
    const weights = graph.createTable({
      name: 'Weights',
      rows: graphInput.n,
      cols: graphInput.n,
      rowheader: 'From',
      colheader: 'To',
      rowlabels: rowlabels,
      collabels: collabels,
      initialValue: Infinity,
      stringMapping: (x) => (x === Infinity ? '∞' : x),
    });
    const predecessors = graph.createTable({
      name: 'Predecessors',
      rows: graphInput.n,
      cols: graphInput.n,
      rowheader: 'From',
      colheader: 'To',
      rowlabels: rowlabels,
      collabels: collabels,
      initialValue: null,
      stringMapping: (x) => (x === null ? '∅' : x),
    });
    graph.finalize();

    // --- process graph
    graph.subroutine('initializ table', () => {
      for (let vertex = 0; vertex < graphInput.n; vertex++) {
        weights.set(vertex, vertex, 0);
        for (const { from, to, weight } of graph.edges[vertex]) {
          weights.set(from, to, weight);
          predecessors.set(from, to, from);
        }
      }
    });

    for (let vertex = 0; vertex < graphInput.n; vertex++) {
      const v = graph.getVertex(vertex);
      v.setColor(1);
      graph.subroutine('run iterations', () => {
        for (let from = 0; from < graphInput.n; from++) {
          for (let to = 0; to < graphInput.n; to++) {
            const newWeight =
              weights.get(from, vertex) + weights.get(vertex, to);
            if (newWeight < weights.get(from, to)) {
              weights.set(from, to, newWeight);
              predecessors.set(from, to, predecessors.get(vertex, 0));
            }
          }
        }
      });

      v.setColor(0);
    }

    return graph;
  }
}
export default FloydWarshall;
