import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class KruskalMST extends BaseAlgorithm {
  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, null, null);
    graph.finalize();

    // --- process graph
    return graph;
  }
}
export default KruskalMST;