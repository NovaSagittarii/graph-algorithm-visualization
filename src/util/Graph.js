import EventfulTable from './EventfulTable';
import Vector2 from './Vector2';

/**
 * Base class that both edges and vertices inherit from
 *
 * Has the following events
 * - `color` change changed
 *   - `{color: number}`
 * - `highlightAdd` highlight color added
 *   - `{color: number}`
 * - `highlightRemove` highlight color removed
 *   - `{color: number}`
 * - `highlightClear` highlights cleared
 * - `read` when accessor is called
 *
 * @template [T=null] auxiliary data
 */
class ColoredElement extends EventTarget {
  /**
   * @param {T} aux auxiliary data
   */
  constructor(aux) {
    super();

    /**
     * @protected @type {number} colorId of the element
     */
    this.color = 0;

    /**
     * @protected @type {Set.<number>} highlightIds that are applied to the element. Can also be used to highlight subgraphs.
     */
    this.highlights = new Set();

    /**
     * @type {number} highlight color that was just used
     */
    this.highlight = 0;

    /**
     * @protected @type {(Array.<*> & T) | null} auxiliary values (for rendering)
     */
    this.auxiliary = aux && aux.slice(0); // make a COPY here since it's initialized many times
  }

  /**
   * Updates element color
   * @param {number} color new color to update to
   * @return {ColoredElement<T>} itself
   */
  setColor(color) {
    this.color = color;
    this.dispatchEvent(new Event('color')); // read color from event
    return this;
  }

  /**
   * Adds a highlight color to the highlight set of this element
   * @param {number} color
   * @return {ColoredElement<T>} itself
   */
  addHighlight(color) {
    this.highlight = color;
    this.dispatchEvent(new Event('highlightAdd'));
    this.highlights.add(color);
    return this;
  }

  /**
   * Removes a highlight color from the highlight set of this element
   * @param {number} color
   * @return {ColoredElement<T>} itself
   */
  removeHighlight(color) {
    this.highlight = color;
    this.dispatchEvent(new Event('highlightRemove'));
    this.highlights.delete(color);
    return this;
  }

  /**
   * Clears the highlight set of this element
   * @param {number} color
   * @return {ColoredElement<T>} itself
   */
  clearHighlight() {
    this.dispatchEvent(new Event('highlightClear'));
    this.highlights.clear();
    return this;
  }

  /**
   * Propagates an accessor event then returns itself
   * @return {ColoredElement<T>} itself
   */
  get() {
    this.dispatchEvent(new Event('read'));
    return this;
  }

  /**
   * Fetches the auxiliary array and returns a copy of it (don't modify it)
   */
  getAuxiliary() {
    if (!this.auxiliary) throw new Error('Auxiliary value is not initialized.');
    return this.auxiliary.slice(0);
  }

  /**
   * Fetches a value from the auxiliary array.
   * @param {number} index
   * @return {T}
   */
  getAuxiliaryValue(index) {
    if (!this.auxiliary) throw new Error('Auxiliary value is not initialized.');
    return this.auxiliary[index];
  }

  /**
   * Sets a value in the auxiliary array.
   * @param {number} index
   * @param {T} value
   * @return {ColoredElement<T>} itself
   */
  setAuxiliaryValue(index, value) {
    if (!this.auxiliary) throw new Error('Auxiliary value is not initialized.');
    this.auxiliary[index] = value;
    return this;
  }
}

/**
 * Internal vertex representation (has position data for rendering)
 * @template [T=null] auxiliary data
 * @extends ColoredElement<T>
 */
class Vertex extends ColoredElement {
  /**
   * @param {number} x initialize x-position
   * @param {number} y initialize y-position
   * @param {T} aux auxiliary data
   */
  constructor(x, y, aux = null) {
    super(aux);
    this.position = new Vector2(x, y);
    this.nextPosition = new Vector2();
  }

  /**
   * Set position of the node (being dragged?)
   * @param {number} x
   * @param {number} y
   */
  setPosition(x, y) {
    this.position.set(new Vector2(x, y));
  }
}

/**
 * Internal edge representation
 * @template [T=null] auxiliary data
 * @extends ColoredElement<T>
 */
class Edge extends ColoredElement {
  /**
   * Creates an
   * @param {number} from start endpoint
   * @param {number} to end endpoint
   * @param {boolean} directed whether the edge is directed or not, undirected by default
   * @param {number} weight edge weight, 1 (uniform weight) by default
   * @param {T} aux auxiliary data
   */
  constructor(from, to, directed = false, weight = 1, aux = null) {
    super(aux);
    this.from = from;
    this.to = to;
    this.directed = directed;
    this.weight = 1;
  }
}

/**
 * @typedef {Object} GraphInput graph representation in edge list form (very serializable)
 * @property {number} n how many nodes (nodes labeled 0 to n-1)
 * @property {Array.<import('./Vector2').Vector2Like>?} nodePositions node positions (for rendering)
 * @property {Array.<[number, number, number]>} edges a list of edges, each edge with [from, to, weight], from/to reference the nodes labeled 0 to n-1
 * @property {boolean} directed is the graph directed?
 */

/**
 * Graph utility class for setting up animation keyframes
 * @template [V=null] vertex auxiliary data
 * @template [E=null] edge auxiliary data
 */
class Graph {
  /**
   * generates a roughly planar (it'll look decent when rendered) graph with n vertices
   * @param {number} n how many vertices
   * @param {number} c maximum weight (weights will be set to [1, c] uniformly random)
   * @return {GraphInput}
   */
  static generateRoughlyPlanarGraph(n, c = 1) {
    const nodes = [...new Array(n)].map(() =>
      Vector2.random().multiply(100).add({ x: 150, y: 150 }),
    );

    /**
     * @type {Array.<[number, number, number]>}
     */
    const edges = [];

    const adjacencyMatrix = [...new Array(n)].map(() =>
      [...new Array(n)].map(() => false),
    );

    // Generate edges based on nearby neighbors
    nodes.forEach((u, i) => {
      const nearest = nodes
        .map((v, j) => [Vector2.dist(u, v), j])
        .filter(([_d, idx]) => idx !== i)
        .sort((a, b) => a[0] - b[0])
        .slice(0, 4); // take at most 4
      for (const [d, j] of nearest) {
        if (d > nearest[0][0] * 2) continue;
        adjacencyMatrix[i][j] = true;
        adjacencyMatrix[j][i] = true;
      }
    });

    // only use unique edges
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < n; ++j) {
        if (adjacencyMatrix[i][j]) {
          edges.push([i, j, Math.ceil(Math.random() * c)]);
        }
      }
    }

    // Space out vertices
    for (let t = 0; t < 50; ++t) {
      const impulse = nodes.map((u) => new Vector2(0, 0));
      nodes.forEach((u, i) => {
        for (const v of nodes) {
          if (u === v) continue;
          u.repulse(v, 100, 10, impulse[i]);
        }
      });
      for (let i = 0; i < n; ++i) {
        nodes[i].add(impulse[i].multiply(1));
      }
    }

    return {
      n: n,
      nodePositions: nodes,
      edges: edges,
      directed: false,
    };
  }

  /**
   *
   * @param {GraphInput} graphInput input graph
   * @param {V} initialVertexAuxiliaryValue what to initialize the auxiliary array on each vertex to
   * @param {E} initialEdgeAuxiliaryValue what to initialize the auxiliary array on each edge to
   */
  constructor(
    graphInput,
    initialVertexAuxiliaryValue = null,
    initialEdgeAuxiliaryValue = null,
  ) {
    /** @readonly */
    this.initialVertexAuxiliaryValue = initialVertexAuxiliaryValue;

    /** @readonly */
    this.initialEdgeAuxiliaryValue = initialEdgeAuxiliaryValue;

    /**
     * Events that can happen for a graph
     * @typedef {'color'|'highlightAdd'|'highlightRemove'|'highlightClear'|'read'|'tableRead'|'tableWrite'|'subroutineStart'|'subroutineEnd'} GraphEventType
     */

    /**
     * a list of events that can be processed in order to step through an algorithm visualization
     * @type {Array.<{type: GraphEventType, data: *}>}
     */
    this.events = [];

    /**
     * a list of table dimensions that are associated with the animation [rows, columns] pairs
     * @type {Array.<[number, number]>}
     */
    this.tableDimensions = [];

    /**
     * whether parameter initialization has finished (creating tables)
     * @private
     */
    this.finalized = false;

    const { n, nodePositions, edges, directed } = graphInput;

    /**
     * vertex list
     * @private
     * @type {Array.<Vertex<V>>}
     */
    this.vertices = nodePositions.map(
      ({ x, y }) => new Vertex(x, y, initialVertexAuxiliaryValue),
    );

    /**
     * adjacency list with edge data
     * @private
     * @type {Array.<Array.<Edge<E>>>}
     */
    this.edges = [...new Array(n)].map(() => []);
    for (const [u, v, c] of edges) {
      this.edges[u].push(
        new Edge(u, v, directed, c, initialEdgeAuxiliaryValue),
      );
      // if (!directed) {
      //   this.edges[v].push(
      //     new Edge(v, u, directed, c, initialEdgeAuxiliaryValue),
      //   );
      // }
    }

    // Initialize listeners
    /**
     * Adds the listeners to a ColoredElement
     * @param {ColoredElement} e
     * @param {number|[number, number]} id key of the element (node label, or endpoints)
     * @param {'vertex'|'edge'} type what is the ColoredElement?
     */
    const addListeners = (e, id, type) => {
      e.addEventListener('color', ({ target }) => {
        const { color } = target; // get the color that was just set
        this.events.push({ type: 'color', data: { id, color, type } });
      });
      e.addEventListener('highlightAdd', ({ target }) => {
        const color = target.highlight;
        this.events.push({ type: 'highlightAdd', data: { id, color, type } });
      });
      e.addEventListener('highlightRemove', ({ target }) => {
        const color = target.highlight;
        this.events.push({
          type: 'highlightRemove',
          data: { id, color, type },
        });
      });
      e.addEventListener('highlightClear', () =>
        this.events.push({ type: 'highlightClear', data: { id, type } }),
      );
      e.addEventListener('read', () =>
        this.events.push({ type: 'read', data: { id, type } }),
      );
    };
    this.vertices.forEach((v, i) => addListeners(v, i, 'vertex'));
    for (const edgeList of this.edges) {
      for (const edge of edgeList) {
        addListeners(edge, [edge.from, edge.to], 'edge');
      }
    }
  }

  /**
   * (pre-finalization) creates a table (to track something in memory)
   * @template [T=number]
   * @param {number} rows
   * @param {number} columns
   * @param {T} initialValue
   * @return {EventfulTable<T>}
   */
  createTable(rows, columns, initialValue = 0) {
    if (this.finalized) {
      throw new Error('cannot create a table after graph has been finalized');
    }
    /**
     * table ID (used to reference itself in the events list)
     */
    const id = this.tableDimensions.length;
    this.tableDimensions.push([rows, columns]);

    const table = new EventfulTable(rows, columns, initialValue);
    table.addEventListener('read', () => {
      this.events.push({
        type: 'tableRead',
        data: {
          id,
          row: table.lastRow,
          column: table.lastColumn,
        },
      });
    });
    table.addEventListener('write', () => {
      this.events.push({
        type: 'tableWrite',
        data: {
          id,
          row: table.lastRow,
          column: table.lastColumn,
          newValue: table.lastWrite,
        },
      });
    });
    return table;
  }

  /**
   * (pre-finalization) finalizes the graph, marking the end of the initialization step
   */
  finalize() {
    if (this.finalized) {
      throw new Error('already finalized');
    }
    this.finalized = true;
  }

  /**
   * (post-finalization) get a vertex by index (0 to n-1).
   *
   * The vertex returned by this method only gives you access to
   * color, highlight, and auxiliary data information. To get neighbors, use `getNeighbors()` instead.
   * @param {number} index
   * @return {Vertex<V>}
   */
  getVertex(index) {
    if (!this.finalized) {
      throw new Error(
        'Graph needs to be finalized before you can start making graph queries.',
      );
    }
    return this.vertices[index].get();
  }

  /**
   * (post-finalization) get the neighbors of a vertex, vertex selected by index (0 to n-1)
   * @param {number} index
   * @return {Array.<Edge<E>>}
   */
  getNeighbors(index) {
    if (!this.finalized) {
      throw new Error(
        'Graph needs to be finalized before you can start making graph queries.',
      );
    }
    return this.edges[index].map((edge) => edge.get());
  }

  /**
   * Utility function for wrapping a subroutine (can be stepped into)
   * @param name string
   * @param {()=>{}} callback
   */
  subroutine(name, callback) {
    this.events.push({ type: 'subroutineStart', data: { name } });
    callback();
    this.events.push({ type: 'subroutineEnd' });
  }
}

export default Graph;
export { Vertex, Edge };
