import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class DFS extends BaseAlgorithm {
  dfs(graph, parent, from, hops, arrivaldeparture) {
    const u = graph.getVertex(from);
    if (parent === null && arrivaldeparture.get(0, from)[0] !== null) {
      return;
    }
    if (arrivaldeparture.get(0, from)[1] !== null) {
      if (arrivaldeparture.get(0, from)[1] < this.plane) { // Forward edge
        const edge = graph.getEdge(parent, from);
        edge.setColor(2);
        return;
      }
      else { // Cross edge
        const edge = graph.getEdge(parent, from);
        edge.setColor(3);
        return;
      }
    }
    if (arrivaldeparture.get(0, from)[0] !== null) {
      if (arrivaldeparture.get(0, from)[0] < this.plane) { // Back edge
        const edge = graph.getEdge(parent, from);
        edge.setColor(3);
        return;
      }
    }
    u.setColor(1);
    u.addHighlight(hops + 1);
    if (parent !== null) {
      const edge = graph.getEdge(parent, from);
      edge.setColor(1);
    }

    // console.log(this.plane);
    arrivaldeparture.set(0, from, [this.plane, null]);
    this.plane += 1;

    let neighbors;
    graph.subroutine('scan neighbors', () => {
      neighbors = graph.getNeighbors(from);
    });

    for (const { to } of neighbors) {
      // add to next frontier if not visited yet
      const v = graph.getVertex(to);
      this.dfs(graph, from, to, hops + 1, arrivaldeparture);
    }

    console.log(this.plane);
    arrivaldeparture.set(0, from, [arrivaldeparture.get(0, from)[0], this.plane]);
    this.plane += 1;
  }

  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, [false], null);
    const arrivaldeparture = graph.createTable({
      name: "Arrival and Departure",
      rows: 1,
      cols: graphInput.n,
      initialValue: [null, null],
      stringMapping: (cell) => cell.map(x => x === null ? "-" : x).join('/'),
    });
    this.plane = 0;
    graph.finalize();

    // --- process graph
    for (let from = 0; from < graphInput.n; ++from) {
      this.dfs(graph, null, from, 0, arrivaldeparture);
    }
    return graph;
  }
}
export default DFS;
