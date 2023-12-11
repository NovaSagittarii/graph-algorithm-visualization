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
import TarjanSSC from './algorithm/TarjanSSC';
import ReachabilityQuery from './algorithm/ReachabilityQuery';

function App() {
  const [graphInput, setGraphInput] = useState(
    Graph.generateRoughlyPlanarGraph(20),
  );
  const [alg, setAlg] = useState(new BFS());
  const [graph, setGraph] = useState(null);
  /**
   * @type {Array.<{label:string, callback:()=>{}}>}
   */
  const utilities = [
    {
      label: 'Randomize',
      callback: () => {
        setGraphInput(Graph.generateRoughlyPlanarGraph(20));
      },
    },
    {
      label: 'DFS',
      callback: () => {
        setAlg(new DFS());
      },
    },
    {
      label: 'BFS',
      callback: () => {
        setAlg(new BFS());
      },
    },
    {
      label: 'Dijkstra',
      callback: () => {
        setAlg(new Dijkstra());
      },
    },
    {
      label: 'Bellman-Ford',
      callback: () => {
        setAlg(new BellmanFord());
      },
    },
    {
      label: 'FloydWarshall',
      callback: () => {
        setAlg(new FloydWarshall());
      },
    },
    {
      label: 'Kruskal',
      callback: () => {
        setAlg(new KMST());
      },
    },
    {
      label: 'Prim',
      callback: () => {
        setAlg(new PMST());
      },
    },
    {
      label: 'RQ',
      callback: () => {
        setAlg(new ReachabilityQuery());
      },
    },
    {
      label: 'Tarjan SSC',
      callback: () => {
        setAlg(new TarjanSSC());
      },
    },
  ];
  useEffect(() => {
    if (graphInput) {
      const processedGraph = alg.run(graphInput);
      const graph = new GraphPlayer(processedGraph);
      setGraph(graph);
    }
  }, [graphInput, alg]);

  return (
    <div>
      {utilities.map(({ label, callback }, index) => (
        <button onClick={callback} key={index}>
          {label}
        </button>
      ))}
      <RenderedGraph graph={graph} />
    </div>
  );
}

export default App;
