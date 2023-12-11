import EventfulTable from './util/EventfulTable';

/**
 * Returns an EventfulTable (auxiliary data structure for graph algorithm)
 * @param {{table: EventfulTable}} props
 */
export default function Table({ table }) {
  return (
    <div className='flex flex-col p-1 bg-slate-100 rounded-md'>
      {table.matrix.map((row, i) => (
        <div key={i} className='flex flex-row m-1'>
          {row.map((cell, j) => (
            <div
              key={j}
              className='bg-slate-300 rounded-md m-1 w-8 h-8 flex items-center justify-center'
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
