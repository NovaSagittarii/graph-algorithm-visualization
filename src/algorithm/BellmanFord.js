import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class BellmanFord extends BaseAlgorithm {
  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, null, null);
    const lengthrowlabels = [...Array(graphInput.n).keys()].map((x) => `${x}`);
    const lengthcollabels = [...Array(graphInput.n + 1).keys()].map((x) => `${x}`);
    const length = graph.createTable({ name: "Path Length", rows: graphInput.n, cols: graphInput.n + 1, initialValue: Infinity, rowheader: "Node", colheader: "Iteration", rowlabels: lengthrowlabels, collabels: lengthcollabels, stringMapping: (x) => x === Infinity ? '∞' : x });
    const parent = graph.createTable({ name: "Parent", rows: graphInput.n, cols: graphInput.n + 1, initialValue: null, rowheader: "Node", colheader: "Iteration", rowlabels: lengthrowlabels, collabels: lengthcollabels, stringMapping: (x) => x === null ? '∅' : x });

    graph.finalize();

    // --- process graph
    let modified = [0];
    length.set(0, 0, 0);
    parent.set(0, 0, 0);
    for (let iteration = 1; iteration < graphInput.n + 1; ++iteration) {
      graph.subroutine(`Initializing for iteration ${iteration}`, () => {
        for (let from = 0; from < graphInput.n; ++from) {
          length.set(from, iteration, length.get(from, iteration - 1));
          parent.set(from, iteration, parent.get(from, iteration - 1));
        }
      });
      let nextModified = [];
      for (const from of modified) {
        const u = graph.getVertex(from);
        const neighbors = graph.getNeighbors(from);
        for (const { to, weight } of neighbors) {
          const v = graph.getVertex(to);
          const newLength = length.get(from, iteration - 1) + weight;
          if (newLength < length.get(to, iteration)) {
            const edge = graph.getEdge(from, to);
            edge.setColor(2);
            const oldedge = graph.getEdge(parent.get(to, iteration), to);
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
    let cycles = [];
    for (let from = 0; from < graphInput.n; ++from) {
      const last = length.get(from, graphInput.n - 1);
      const extra = length.get(from, graphInput.n);
      if (last !== extra) {
        console.log(`Negative cycle detected at ${from}`);
        cycles.push(from);
      }
    }
    for (const from of cycles) {
      let v = from;
      let iteration = graphInput.n;
      let incycle = false;
      while (iteration > 0) {
        const to = parent.get(v, iteration);
        if (to === null) break;
        const edge = graph.getEdge(to, v);
        if (incycle) {
          edge.setColor(1);
          const vertex = graph.getVertex(v);
          vertex.addHighlight(1);
        }
        v = to;
        if (v === from && incycle) {
          break;
        }
        if (v === from && !incycle) {
          incycle = true;
          iteration = graphInput.n;
        }
        --iteration;
      }
    }
    return graph;
  }
}
export default BellmanFord;
