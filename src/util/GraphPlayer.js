import CodeTracker from './CodeTracker';
import EventfulTable from './EventfulTable';
import Graph, { Edge, Vertex } from './Graph';

/**
 * Vertex with last read data
 * @template T
 * @extends Vertex<T>
 */
class VertexLR extends Vertex {
  /**
   * @param {number} x initialize x-position
   * @param {number} y initialize y-position
   * @param {T} aux auxiliary data
   */
  constructor(x, y, aux) {
    super(x, y, aux);
    this.lastRead = 0;
  }
}

/**
 * Edge with last read data
 * @template T
 * @extends Edge<T>
 */
class EdgeLR extends Edge {
  /**
   * @param {number} from start endpoint
   * @param {number} to end endpoint
   * @param {boolean} directed whether the edge is directed or not, undirected by default
   * @param {number} weight edge weight, 1 (uniform weight) by default
   * @param {T} aux auxiliary data
   */
  constructor(from, to, directed, weight, aux) {
    super(from, to, directed, weight, aux);
    this.lastRead = 0;
  }
}

/**
 * Takes a processed graph and lets you step through the events.
 * @template V,E
 */
class GraphPlayer {
  /**
   * @param {Graph<V,E>} graph graph with events
   */
  constructor(graph) {
    this.pc = 0;
    this.events = graph.events.slice(0);
    Object.freeze(this.events);

    this.tables = graph.tableInitialization.map(
      ([n, m, c, mapping]) => new EventfulTable(n, m, c, mapping),
    );
    this.code = new CodeTracker(graph.code);
    this.vertices = graph.vertices.map(
      (vertex) =>
        new VertexLR(
          vertex.position.x,
          vertex.position.y,
          graph.initialVertexAuxiliaryValue,
        ),
    );

    // simple last read table setup
    // TODO: setup same since last read thing for the table too?
    this.lastReadTable = -1;
    this.lastReadTableRow = -1;
    this.lastReadTableColumn = -1;

    /**
     * Whether the graph is directed or not
     */
    this.directed = graph.directed;

    /** @type {Array.<Edge<E>>} */
    this.edges = [];
    this.edgeLists = graph.edges.map((edgeList) =>
      edgeList.map(
        (edge) =>
          new EdgeLR(
            edge.from,
            edge.to,
            edge.directed,
            edge.weight,
            graph.initialEdgeAuxiliaryValue,
          ),
      ),
    );

    /**
     * adjacency matrix
     * @type {Array.<Array.<Edge<E> | null>>}
     */
    this.edgeMatrix = [...new Array(this.vertices.length)].map(() =>
      [...new Array(this.vertices.length)].map(() => null),
    );
    for (const edgeList of this.edgeLists) {
      for (const edge of edgeList) {
        this.edges.push(edge);
        this.edgeMatrix[edge.from][edge.to] = edge;
      }
    }
  }

  /**
   * Steps one event or subroutine.
   * @param {number} now time to update lastRead to during this step
   * @returns {void}
   */
  step(now) {
    if (this.pc >= this.events.length) return;
    let depth = 0;
    do {
      const event = this.events[this.pc++];
      //   console.log(event);
      try {
        const { type, data } = event;
        switch (type) {
          case 'read': {
            const { id, type } = data;
            if (type === 'vertex') {
              this.vertices[id].lastRead = now;
            } else {
              this.edgeMatrix[id[0]][id[1]].lastRead = now;
            }
            break;
          }
          case 'color': {
            const { id, type, color } = data;
            if (type === 'vertex') {
              this.vertices[id].setColor(color);
            } else {
              this.edgeMatrix[id[0]][id[1]].setColor(color);
            }
            break;
          }
          case 'highlightAdd': {
            const { id, type, color } = data;
            if (type === 'vertex') {
              this.vertices[id].addHighlight(color);
            } else {
              this.edgeMatrix[id[0]][id[1]].addHighlight(color);
            }
            break;
          }
          case 'highlightRemove': {
            const { id, type, color } = data;
            if (type === 'vertex') {
              this.vertices[id].removeHighlight(color);
            } else {
              this.edgeMatrix[id[0]][id[1]].removeHighlight(color);
            }
            break;
          }
          case 'highlightClear': {
            const { id, type } = data;
            if (type === 'vertex') {
              this.vertices[id].clearHighlight();
            } else {
              this.edgeMatrix[id[0]][id[1]].clearHighlight();
            }
            break;
          }
          case 'tableRead':
            break;
          case 'Code Write':
            this.code.setLine(data.currentLine);
            break;
          case 'tableWrite': {
            const { id, row, column } = data;
            this.lastReadTable = id;
            this.lastReadTableRow = row;
            this.lastReadTableColumn = column;
            if (type === 'tableWrite') {
              this.tables[id].set(row, column, data.newValue);
            }
            break;
          }
          case 'subroutineStart':
            ++depth;
            break;
          case 'subroutineEnd':
            --depth;
            break;
          default:
            console.warn(`Implementation for event <${type}> missing`);
        }
      } catch (error) {
        console.error('Failed to process instruction');
        console.error(event);
        throw error;
      }
    } while (depth && this.pc < this.events.length);
  }
}

export default GraphPlayer;
