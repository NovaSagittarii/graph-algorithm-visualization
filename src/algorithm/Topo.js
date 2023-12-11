import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class Topo extends BaseAlgorithm {
    topo(graph, table) {
        let n = graph.verticies.length;
        let round =1;
        let curr = []
        // precalculating all incoming edges count
        for(let i = 0; i < n; i++) {
            for(const { from } of graph.getNeighbors(i)) { // incrementing value when edge is found
                graph.getVertex(from).setAuxiliaryValue(0, graph.getVertex(from).getAuxiliaryValue(0)+1); 
            }
            table.set(0,i, graph.getVertex(i).getAuxiliaryValue(0)); // setting in table for visuals
        }

    }

  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, 0, null);
    const result= graph.createTable(1, graphInput.n, 0);
    const table = graph.createTable(graphInput.n, graphInput.n, 0);
    graph.finalize();

    // --- process graph
    this.topo(graph, 0, 0, table);
    return graph;
  }
}
export default DFS;

