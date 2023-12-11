import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class BFS extends BaseAlgorithm {
  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, [false], null);
    const visits = graph.createTable(1, graphInput.n, 0);
    graph.finalize();

    // --- process graph
    let frontier = [0];
    for (let hops = 0; frontier.length; ++hops) {
      let nextFrontier = [];
      for (const from of frontier) {
        const u = graph.getVertex(from);
        const visited = u.getAuxiliaryValue(0);

        visits.set(0, from, visits.get(0, from) + 1); // increment a table element

        if (visited) continue;
        u.setAuxiliaryValue(0, true); // mark as visited
        u.setColor(1);
        u.addHighlight(hops + 1);

        let neighbors;
        graph.subroutine('scan neighbors', () => {
          neighbors = graph.getNeighbors(from);
        });

        for (const { to } of neighbors) {
          // add to next frontier if not visited yet
          const v = graph.getVertex(to);
          if (v.getAuxiliaryValue(0)) continue;
          nextFrontier.push(to);
          // v.addHighlight(hops+1);
        }
      }
      frontier = nextFrontier;
    }

    return graph;
  }
}
export default BFS;
