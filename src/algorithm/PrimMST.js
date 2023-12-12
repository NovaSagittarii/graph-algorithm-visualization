import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class PrimMST extends BaseAlgorithm {
  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, null, null);
    const lightEdge = graph.createTable({
      name: 'Light Edge',
      rows:1,
      cols: 2,
      initialValue: null,
    });
    graph.finalize();

    // --- process graph

    return graph;
  }
}
export default PrimMST;
