import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class TarjanSCC extends BaseAlgorithm {
  /**
   * @param {Graph} graph
   * @param {import('../util/Graph').GraphInput} graphInput
   */

  Tarjan(graph, lowLink, graphInput) {
    let n = graph.vertices.length;
    let index = 0; // Global variable to assign identifiers
    const stack = [];
    const ids = new Array(n).fill(-1);
    const onStack = new Array(n).fill(false);
  
    function dfs(node) {
      stack.push(node);
      onStack[node] = true;
      ids[node] = index;
      lowLink.set(0, node, index);
      index++;
  
      for (const { to } of graph.getNeighbors(node)){
        if (ids[to] === -1) {
          dfs(to);
        }
        if (onStack[to]) {
          lowLink.set(0, node, Math.min(lowLink.get(0, node), lowLink.get(0, to)));
        }
      }
  
      if (ids[node] === lowLink.get(0,node)) {
        let poppedNode = stack.pop();
        onStack[poppedNode] = false;
        lowLink.set(0, poppedNode, lowLink.get(0, node));
  
        while (poppedNode !== node) {
          poppedNode = stack.pop();
          onStack[poppedNode] = false;
          lowLink.set(0, poppedNode, lowLink.get(0, node));
        }
      }
    }
  
    for (let i = 0; i < n; i++) {
      if (ids[i] === -1) {
        dfs(i);
      }
    } 
    return graph;
  }
  

  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, null, null);
    const lengthcollabels = [...Array(graphInput.n + 1).keys()].map(
      (x) => `${x}`,
    );
    const result = graph.createTable({
      name: 'LowLink',
      rows: 1,
      cols: graphInput.n,
      initialValue: Infinity,
      rowheader: 'Vertices',
      colheader: 'LowLink',
      collabels: lengthcollabels,

    });
    graph.finalize();
    this.Tarjan(graph, result, graphInput);
    // --- process graph
    return graph;
  }
}
export default TarjanSCC;
