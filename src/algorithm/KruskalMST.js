import { useId } from 'react';
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
    return (this.parent[v] = this.find_set(this.parent[v]));
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
    const sortedEdgesTable = graph.createTable({
      name: "Sorted Edges Table",
      rows: 1,
      cols: graphInput.edges.length,
      initialValue: null,
    });
    graph.finalize();

    // --- process edgelist
    // something something .from.sort.foreach to clean up this later
    let sortedEdgeIndexes = [];
    graph.subroutine('sort edges', () => {
      for (let m = 0; m < graphInput.edges.length; ++m) {
        sortedEdgeIndexes.push(m);
      }
      sortedEdgeIndexes.sort(function (edge1, edge2) {
        // Sort in ascending order by edge weight
        return graphInput.edges[edge1][2] - graphInput.edges[edge2][2];
      });
      for (let m = 0; m < graphInput.edges.length; ++m) {
        sortedEdgesTable.set(0, m, sortedEdgeIndexes[m]);
      }
    });

    // --- process graph
    let dsu = new DisjointSetUnion();
    let numEdges = 0;

    graph.subroutine('color initial disjoint trees', () => {
      for (let i = 0; i < graphInput.n; ++i) {
        dsu.make_set(i);
        const u = graph.getVertex(i);

        // Assign each vertex a color
        const ucolor = dsu.find_set(i) % 6;
        u.setColor(ucolor + 1);
        u.removeHighlight();
        u.addHighlight(ucolor + 1);
      }
    });

    let usedEdges = [];

    // Consider edges in order of ascending weight
    for (const edgeIndex of sortedEdgeIndexes) {
      // [from, to, weight]
      // Terminate once MST has been constructed
      const edge = graphInput.edges[edgeIndex];
      const from = edge[0];
      const to = edge[1];
      const weight = edge[2];

      if (from > to) continue; // don't double count edges

      const uv = graph.getEdge(from, to);

      const fromSet = dsu.find_set(from);
      const toSet = dsu.find_set(to);
      if (fromSet != toSet) {
        dsu.union_sets(fromSet, toSet);
        const queryParent = dsu.find_set(from);

        usedEdges.push(edgeIndex);
        uv.setColor((queryParent % 6) + 1);

        graph.subroutine('update tree colors', () => {
          for (let i = 0; i < graphInput.n; ++i) {
            if (dsu.find_set(i) == queryParent) {
              const treeNode = graph.getVertex(i);
              treeNode.setColor((queryParent % 6) + 1);
              treeNode.removeHighlight();
              treeNode.addHighlight((queryParent % 6) + 1);
            }
          }
        });

        numEdges += 1;
      } else {
        uv.setColor(0);
      }
    }

    graph.subroutine('final coloring', () => {
      for (const edge of graphInput.edges) {
        const uv = graph.getEdge(edge[0], edge[1]);
        uv.setColor(0);
      }
      for (let i = 0; i < graphInput.n; ++i) {
        const node = graph.getVertex(i);
        node.setColor(2);
        node.removeHighlight();
        node.addHighlight(2);
      }
      for (const edgeIndex of usedEdges) {
        const edge = graphInput.edges[edgeIndex];
        const uv = graph.getEdge(edge[0], edge[1]);
        uv.setColor(2);

        // const vu = graph.getEdge(edge[1], edge[0]);
        // vu.setColor(2);
      }
    });

    return graph;
  }
}
export default KruskalMST;
