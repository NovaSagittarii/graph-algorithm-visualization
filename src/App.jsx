import React, { useState, useEffect } from 'react';
import RenderedGraph from './RenderedGraph';
import './App.css';
import Graph from './util/Graph';
import GraphPlayer from './util/GraphPlayer';
import BFS from './algorithm/BFS';
import DFS from './algorithm/DFS';
import BellmanFord from './algorithm/BellmanFord';
import Dijkstra from './algorithm/Dijkstra';
import FloydWarshall from './algorithm/FloydWarshall';
import KMST from './algorithm/KruskalMST';
import PMST from './algorithm/PrimMST';
import TarjanSCC from './algorithm/TarjanSCC';
import ReachabilityQuery from './algorithm/ReachabilityQuery';
import Editor from './editor/Editor';

function App() {
  const [vertexCount, setVertexCount] = useState(20);
  const [edit, setEdit] = useState(false);
  const [tps, setTps] = useState(10);
  const [edgeWeightRange, setEdgeWeightRange] = useState([1, 1]);
  const [allowCycles, setAllowCycles] = useState(true);
  const [directedGraph, setDirectedGraph] = useState(true);
  const [graphInput, setGraphInput] = useState(
    Graph.generateRoughlyPlanarGraph(vertexCount),
  );
  const [alg, setAlg] = useState(new BFS());
  const [graph, setGraph] = useState(null);
  const [editData, setEditData] = useState({
    vertices: {},
    edges: {},
    directed: true,
    selectedVertex: null,
    selectedEdge: null,
    selectedColor: null,
    value: '',
    addEdge: false,
  });

  /**
   * @type {Array.<{label:string, callback:()=>{}}>}
   */
  const utilities = [
    {
      label: 'Editor',
      callback: () => {
        setEdit(true);
      },
    },
    {
      label: 'Randomize',
      callback: () => {
        setEdgeWeightRange([1, 1]);
        setEdit(false);
      },
    },
    {
      label: 'Negative Randomize',
      callback: () => {
        setEdgeWeightRange([-5, 9]);
        setEdit(false);
      },
    },
    {
      label: 'DFS',
      callback: () => {
        setAlg(new DFS());
        setEdit(false);
        if (edit) generateGraphInput();
      },
    },
    {
      label: 'BFS',
      callback: () => {
        setAlg(new BFS());
        setEdit(false);
        generateGraphInput();
      },
    },
    {
      label: 'Dijkstra',
      callback: () => {
        setAlg(new Dijkstra());
        setEdit(false);
        generateGraphInput();
      },
    },
    {
      label: 'Bellman-Ford',
      callback: () => {
        setAlg(new BellmanFord());
        setEdit(false);
        generateGraphInput();
      },
    },
    {
      label: 'FloydWarshall',
      callback: () => {
        setAlg(new FloydWarshall());
        setEdit(false);
        generateGraphInput();
      },
    },
    {
      label: 'Kruskal',
      callback: () => {
        setAlg(new KMST());
        setEdit(false);
        generateGraphInput();
      },
    },
    {
      label: 'Prim',
      callback: () => {
        setAlg(new PMST());
        setEdit(false);
        generateGraphInput();
      },
    },
    {
      label: 'RQ',
      callback: () => {
        setAlg(new ReachabilityQuery());
        setEdit(false);
        generateGraphInput();
      },
    },
    {
      label: 'Tarjan SCC',
      callback: () => {
        setAlg(new TarjanSCC());
        setEdit(false);
        generateGraphInput();
      },
    },
  ];

  useEffect(() => {
    setGraphInput(
      Graph.generateRoughlyPlanarGraph(
        vertexCount,
        edgeWeightRange[0],
        edgeWeightRange[1],
        directedGraph,
        allowCycles,
      ),
    );
  }, [vertexCount, edgeWeightRange, directedGraph, allowCycles]);
  useEffect(() => {
    if (graphInput) {
      const processedGraph = alg.run(graphInput);
      const graph = new GraphPlayer(processedGraph);
      setGraph(graph);
    }
  }, [graphInput, alg]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (graph) {
        graph.step(Date.now());
      }
    }, 1000 / tps);
    return () => {
      clearInterval(interval);
    };
  }, [tps, graph]);
  const generateGraphInput = () => {
    const n = Object.keys(editData.vertices).length;
    const ids = {};
    const nodePositions = Object.entries(editData.vertices).map(
      ([id, vertex], i) => {
        ids[id] = i;
        return {
          x: vertex.x,
          y: vertex.y,
          label: vertex.value,
        };
      },
    );
    const edges = [];
    Object.entries(editData.edges).forEach(([from, edge]) => {
      edge.forEach((to) => {
        console.log(from);
        edges.push([ids[from], to.to, to.weight || 1]);
      });
    });
    setGraphInput({
      n: n,
      nodePositions: nodePositions,
      edges: edges,
      directed: editData.directed,
    });
  };
  return (
    <div>
      {utilities.map(({ label, callback }, index) => (
        <button onClick={callback} key={index}>
          {label}
        </button>
      ))}
      <div>
        <div>
          <label> directed? </label>
          <input
            type='checkbox'
            name='directedness'
            defaultChecked={directedGraph}
            onChange={({ target }) => setDirectedGraph(target.checked)}
          />
        </div>
        {directedGraph && (
          <div>
            <label> allow cycles? </label>
            <input
              type='checkbox'
              name='cyclic'
              defaultChecked={allowCycles}
              onChange={({ target }) => setAllowCycles(target.checked)}
            />
          </div>
        )}
        <div>
          <label> vertex count: {vertexCount} </label>
          <input
            type='range'
            name='vertex-n'
            min={5}
            max={30}
            step={5}
            defaultValue={vertexCount}
            onMouseUp={({ target }) => setVertexCount(+target.value)}
          />
        </div>
        <div>
          <label> tick / second: {tps} </label>
          {[1, 2, 5, 10, 20, 50, 100].map((x, index) => (
            <button
              key={index}
              onClick={() => setTps(x)}
              className={
                'bg-slate-100 hover:border transition-all ' +
                (x === tps ? 'border-red-500' : '')
              }
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      {edit ? (
        <Editor data={editData} setData={setEditData} />
      ) : (
        <RenderedGraph graph={graph} />
      )}
    </div>
  );
}

export default App;
