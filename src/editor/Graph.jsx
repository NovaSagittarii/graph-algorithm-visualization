/* eslint-disable react/prop-types */
'use client';
import { Drag } from '@visx/drag';
import { LinePath } from '@visx/shape';
import { MarkerArrow } from '@visx/marker';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { curveCatmullRom } from '@visx/curve';

const Graph = ({
  width,
  height,
  directed,
  setData,
  data,
  editable,
  addEdge,
}) => {
  return (
    <div>
      <svg width={width} height={height} id='graphsvg'>
        {directed && <MarkerArrow id='marker-arrow' fill='black' size={4} />}
        <rect
          fill='#ffffff'
          width={width}
          height={height}
          rx={14}
          onMouseDown={() => {
            console.log(data);
            setData({
              ...data,
              selectedVertex: null,
              selectedEdge: null,
              addEdge: false,
            });
          }}
        />
        {Object.entries(data.edges).map(([from, destinations]) =>
          destinations.map((to, i) => {
            const x1 = data.vertices[from].x;
            const y1 = data.vertices[from].y;
            const x2 = data.vertices[to.to].x;
            const y2 = data.vertices[to.to].y;
            const length = Math.sqrt(
              (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2),
            );
            const dx = (x1 - x2) / length;
            const dy = (y1 - y2) / length;
            const fromX = x1 - dx * (20 + 2);
            const fromY = y1 - dy * (20 + 2);
            const toX = x2 + dx * (20 + 2);
            const toY = y2 + dy * (20 + 2);
            return (
              <>
                <LinePath
                  markerEnd={`url(#marker-arrow)`}
                  onMouseDown={(e) => {
                    setData({
                      ...data,
                      selectedEdge: { from: from, to: to },
                    });
                  }}
                  key={i}
                  curve={curveCatmullRom}
                  data={
                    data.edges[to.to]?.some((vertex) => vertex.to === from)
                      ? [
                          { x: fromX, y: fromY },
                          {
                            x: (x1 + x2) / 2 + (length / 25) * dy,
                            y: (y1 + y2) / 2 + -(length / 25) * dx,
                          },
                          { x: toX, y: toY },
                        ]
                      : [
                          { x: fromX, y: fromY },
                          { x: toX, y: toY },
                        ]
                  }
                  x={(d) => d.x}
                  y={(d) => d.y}
                  shapeRendering='geometricPrecision'
                  strokeWidth={
                    data.selectedEdge &&
                    data.selectedEdge.from === from &&
                    data.selectedEdge.to === to
                      ? 6
                      : 3
                  }
                  stroke='black'
                />
                <Text
                  onMouseDown={(e) => {
                    setData({
                      ...data,
                      selectedEdge: { from: from, to: to },
                    });
                  }}
                  x={(x1 + x2) / 2 + (length / 25) * dy}
                  y={(y1 + y2) / 2 + -(length / 25) * dx}
                  style={{
                    fontWeight: 600,
                    fontSize: '25px',
                    WebkitUserSelect: 'none',
                    msUserSelect: 'none',
                    userSelect: 'none',
                    textShadow:
                      '2px 0px 0px white,0px 2px 0px white,-2px 0px 0px white,0px -2px 0px white,-2px -2px 0px white,2px 2px 0px white',
                  }}
                  fill='black'
                  textAnchor='start'
                  verticalAnchor='middle'
                >
                  {to.weight}
                </Text>
              </>
            );
          }),
        )}
        {editable &&
          Object.entries(data.vertices).map(([id, d]) => (
            <Drag
              key={id}
              width={width}
              height={height}
              x={d.x}
              y={d.y}
              onDragStart={() => {
                setData({
                  ...data,
                  selectedVertex: data.selectedVertex === id ? null : id,
                });
                if (data.addEdge && data.selectedVertex) {
                  addEdge(data, setData, data.selectedVertex, id);
                }
              }}
              onDragMove={(e) => {
                setData({
                  ...data,
                  vertices: {
                    ...data.vertices,
                    [id]: {
                      ...data.vertices[id],
                      x: d.x + e.dx,
                      y: d.y + e.dy,
                    },
                  },
                });
              }}
            >
              {({ dragStart, dragEnd, dragMove, isDragging }) => (
                <Group
                  onMouseMove={dragMove}
                  onMouseUp={dragEnd}
                  onMouseDown={dragStart}
                >
                  <circle
                    cx={d.x}
                    cy={d.y}
                    key={`circle-${id}`}
                    r={20}
                    fill='white'
                    fillOpacity={0.8}
                    stroke='black'
                    strokeWidth={
                      isDragging || data.selectedVertex === id ? 4 : 2
                    }
                  />
                  <Text
                    key={`text-${id}`}
                    style={{
                      fontWeight: 600,
                      fontSize: '25px',
                      WebkitUserSelect: 'none',
                      msUserSelect: 'none',
                      userSelect: 'none',
                    }}
                    fill='black'
                    textAnchor='middle'
                    verticalAnchor='middle'
                    x={d.x}
                    y={d.y}
                  >
                    {d.value}
                  </Text>
                </Group>
              )}
            </Drag>
          ))}
      </svg>
    </div>
  );
};

export default Graph;
