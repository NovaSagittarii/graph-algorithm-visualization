import Graph from '../util/Graph';
import BaseAlgorithm from './BaseAlgorithm';

class DisjointSetUnion {
  constructor() {
    this.parent = [];
    this.size = [];
  }

  make_set(v) {
    this.parent[v] = v;
    this.size[v] = 1;
  }

  find_set(v) {
    if (v == this.parent[v]) {
      return v;
    }
    return this.parent[v] = this.find_set(this.parent[v]);
  }

  union_sets(a, b) {
    a = this.find_set(a);
    b = this.find_set(b);

    if (a != b) {
      if (this.size[a] < this.size[b]) {
        [a, b] = [b, a]; // swap(a, b)
      }
      this.parent[b] = a;
      this.size[a] += this.size[b];
    }
  }
}

class KruskalMST extends BaseAlgorithm {
  /** @override */
  run(graphInput) {
    // --- set up auxiliary values then finalize
    const graph = new Graph(graphInput, null, null);
    const sortedEdgesTable = graph.createTable(1, graphInput.edges.length);
    graph.finalize();

    // --- process edgelist
    // something something .from.sort.foreach to clean up this later
    let sortedEdgeIndexes = [];
    for (let m = 0; m < graphInput.edges.length; ++m) {
      sortedEdgeIndexes.push(m);
    }
    sortedEdgeIndexes.sort(function (edge1, edge2){ // Sort in ascending order by edge weight
      return graphInput.edges[edge1][2] - graphInput.edges[edge2][2];
    });
    for (let m = 0; m < graphInput.edges.length; ++m) {
      sortedEdgesTable.set(0, m, sortedEdgeIndexes[m]);
    }

    // --- process graph
    let dsu = new DisjointSetUnion();
    let numEdges = 0;

    for (let i = 0; i < graphInput.n; ++i) {
      dsu.make_set(i);
      const u = graph.getVertex(i);
    }

    // Consider edges in order of ascending weight
    for (const edgeIndex of sortedEdgeIndexes) { // [from, to, weight]
      // Terminate once MST has been constructed
      if (numEdges >= graphInput.n - 1) {
        break;
      }

      const edge = graphInput.edges[edgeIndex];
      const from = edge[0];
      const to = edge[1];
      const weight = edge[2];

      const fromSet = dsu.find_set(from);
      const toSet = dsu.find_set(to);
      if (fromSet != toSet) {
        dsu.union_sets(fromSet, toSet);
        numEdges += 1;
      }
    }

    return graph;
  }
}
export default KruskalMST;
