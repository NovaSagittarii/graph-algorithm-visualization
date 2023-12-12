/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import Graph from './Graph';
const addVertex = (data, setData) => {
  event.preventDefault();
  const vertices = Object.keys(data.vertices);
  const id =
    vertices.length > 0 ? parseInt(vertices[vertices.length - 1]) + 1 : 0;
  setData({
    ...data,
    value: '',
    vertices: {
      ...data.vertices,
      [id]: {
        value: data.value,
        x: Math.random() * 300 + 25,
        y: Math.random() * 300 + 25,
      },
    },
  });
};

const deleteVertex = (data, setData, id) => {
  if (!id) return;
  const newVertices = { ...data.vertices };
  delete newVertices[id];
  const newEdges = {};
  Object.entries(data.edges).forEach(([edge, d]) => {
    if (edge !== data.selectedVertex) {
      newEdges[edge] = d.filter((e) => e.to != data.selectedVertex);
    }
  });
  setData({
    ...data,
    vertices: newVertices,
    edges: newEdges,
    selectedVertex: null,
  });
};

const addEdge = (data, setData, from, to) => {
  if (data.edges[from]?.some((e) => e.to === to)) return;
  setData({
    ...data,
    selectedVertex: to,
    edges: {
      ...data.edges,
      [from]: data.edges[from]
        ? [...data.edges[from], { to: to }]
        : [{ to: to }],
    },
  });
  return;
};

const clear = (data, setData) => {
  setData({ ...data, vertices: {}, edges: {} });
};

const deleteEdge = (data, setData, from, to) => {
  setData({
    ...data,
    edges: {
      ...data.edges,
      [from]: data.edges[from].filter((e) => e !== to),
    },
  });
};

const importJSON = async (e, data, setData) => {
  const fileReader = new FileReader();
  fileReader.readAsText(e.target.files[0], 'UTF-8');
  fileReader.onload = (e) => {
    setData({
      ...data,
      vertices: JSON.parse(e.target.result).vertices,
      edges: JSON.parse(e.target.result).edges,
    });
  };
};

const downLoadJSON = (data) => {
  const json = JSON.stringify({ vertices: data.vertices, edges: data.edges });
  const blob = new Blob([json], { type: 'application/json' });
  const element = document.createElement('a');
  element.download = 'data.json';
  element.href = window.URL.createObjectURL(blob);
  element.click();
  element.remove();
};

const Editor = ({ data, setData }) => {
  const handleUserKeyPress = (e) => {
    //   console.log(data.vertices[data.selectedEdge.from].value);
    //   console.log(data.vertices[data.selectedEdge.to.to].value);
    if (e.code.startsWith('Digit') && data.selectedEdge) {
      setData({
        ...data,
        edges: {
          ...data.edges,
          [data.selectedEdge.from]: data.edges[data.selectedEdge.from].map(
            (to) => {
              if (to.to === data.selectedEdge.to.to) {
                return { ...to, weight: parseInt(e.key) };
              }
              return to;
            },
          ),
        },
      });
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [data]);
  return (
    <div className='flex w-full justify-evenly h-full'>
      <form onSubmit={() => addVertex(data, setData)}>
        <input
          placeholder='ex. A'
          value={data.value}
          onChange={(e) => {
            setData({ ...data, value: e.target.value });
          }}
        />
      </form>
      <div className='flex flex-col gap-2'>
        <div className='w-full flex justify-between'>
          <div className='flex gap-2 text-xl ml-2'>
            <button
              onClick={() => {
                deleteVertex(data, setData, data.selectedVertex);
                console.log(data);
                if (data.selectedEdge) {
                  deleteEdge(
                    data,
                    setData,
                    data.selectedEdge.from,
                    data.selectedEdge.to,
                  );
                }
              }}
            >
              Delete Selected Item
            </button>
            <button
              className={`${data.addEdge && 'bg-red-300'}`}
              onClick={() => setData({ ...data, addEdge: !data.addEdge })}
            >
              Add Edges
            </button>
          </div>
          <button
            onClick={() => clear(data, setData)}
            className='text-rtools-blue-100 hover:text-white cursor-pointer'
          >
            clear
          </button>
          <label>directed</label>
          <input
            type='checkbox'
            onChange={(e) => {
              setData({ ...data, directed: e.target.checked });
            }}
          />
        </div>
        <Graph
          width={500}
          height={500}
          directed={data.directed}
          weighted={true}
          setData={setData}
          data={data}
          editable={true}
          addEdge={addEdge}
        />
      </div>
      <div className='flex flex-col gap-3 h-full w-1/5'>
        <button onClick={() => downLoadJSON(data)}>download</button>
        <button onClick={() => downLoadJSON(data)}>copy</button>
        <input type='file' onChange={(e) => importJSON(e, data, setData)} />
      </div>
    </div>
  );
};

export default Editor;
