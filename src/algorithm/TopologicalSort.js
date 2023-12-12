import Graph, { Vertex } from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class ToplogicalSort extends BaseAlgorithm {
  /**
   * @param {Graph} graph
   * @param {import('../util/Graph').GraphInput} graphInput
   */
  topo(graph, result, table, graphInput) {
    let n = graph.vertices.length;
    let counter = 0; // index for result array
    const numbers = Array.from({ length: n }, (_, index) => index);
    // precalculating all incoming edges count
    let incoming = Array.from({ length: n }, () => []);
    graph.subroutine('precompute incoming edges', () => {
        // keep track of all incoming edges by pushing them to an array of array of edges
      for (const [from, to] of graphInput.edges) {
        incoming[to].push(graph.getEdge(from, to));
      }
    });
    for(let i = 0 ; i < n; i++){
        let u = graph.getVertex(i);
        u.setColor(2);
        for(const edge of incoming[i]){
            edge.setColor(1);
        }
        graph.getVertex(i).setAuxiliaryValue(0, incoming[i].length);
        table.set(0, i, graph.getVertex(i).getAuxiliaryValue(0));

        graph.subroutine('deallocate colors' , () => {
            for(const edge of incoming[i]){
                edge.setColor(0);
            }
            u.setColor(0);
        });
    }
    // old way of precomputing, changing for animation
    // for (let i = 0; i < n; i++) {
    //   let u = graph.getVertex(i);
    //   let neigh = graph.getNeighbors(i);
    //   // incrementing value when edge is found
    //   for (const { to } of neigh) {
    //     graph
    //       .getVertex(to)
    //       .setAuxiliaryValue(0, graph.getVertex(to).getAuxiliaryValue(0) + 1);
    //   }
    // }
    // for (let i = 0; i < n; i++) {
    //   table.set(0, i, graph.getVertex(i).getAuxiliaryValue(0)); // setting in table for visuals
    // }
    const vals = numbers.map((number) => [
      number,
      graph.getVertex(number).getAuxiliaryValue(0),
    ]);
    let filteredTuples = vals.filter((tuple) => tuple[1] === 0);

    while (filteredTuples.length > 0) {
      // while there are verticies with 0 incoming edges
      for (const [v] of filteredTuples) {
        let u = graph.getVertex(v);
        u.setColor(1);
        result.set(0, counter, v); // adding to our topo sort (greedy)
        counter++;
        for (const { to } of graph.getNeighbors(v)) {
            graph.getEdge(v, to).setColor(1);
          // decrementing counts by incrementing
          vals[to][1] -= 1;
          table.set(0, to, vals[to][1]);
        }
        graph.subroutine('deallocate colors', () => {
            for (const { to } of graph.getNeighbors(v)) {
                graph.getEdge(v, to).setColor(0);
            }
        });
        u.setColor(2);
        vals[v][1] = -1; // to avoid recounting.
      }
      filteredTuples = vals.filter((tuple) => tuple[1] === 0);
    }

    return graph;
  }

  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    console.log(graphInput);
    const graph = new Graph(graphInput, [0], null);
    const result = graph.createTable({
      name: 'Result',
      rows: 1,
      cols: graphInput.n,
      initialValue: null,
    });
    const table = graph.createTable({
      name: 'Table',
      rows: 1,
      cols: graphInput.n,
      initialValue: 0,
    });
    graph.finalize();

    // --- process graph
    this.topo(graph, result, table, graphInput);
    return graph;
  }
}
export default ToplogicalSort;
