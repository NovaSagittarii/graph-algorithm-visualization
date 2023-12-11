import React, { useState, useEffect } from 'react';
import RenderedGraph from './RenderedGraph';
import './App.css';
import Graph from './util/Graph';
import GraphPlayer from './util/GraphPlayer';
import BFS from './algorithm/BFS';

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
      label: 'BFS',
      callback: () => {
        setAlg(new BFS());
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
