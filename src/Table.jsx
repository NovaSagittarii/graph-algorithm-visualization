import { useState, useEffect } from 'react';
import EventfulTable from './util/EventfulTable';
import { Tooltip } from 'react-tooltip';

/**
 * Returns an EventfulTable (auxiliary data structure for graph algorithm)
 * @param {{table: EventfulTable}} props
 */
export default function Table({ table }) {
  const [refreshTable, setRefreshTable] = useState(false);
  useEffect(() => {
    const int = setInterval(() => {
      setRefreshTable((x) => !x);
    }, 100);
    return () => {
      clearInterval(int);
    };
  }, [table]);

  return (
    <div className='flex flex-col p-1 bg-slate-100 rounded-md w-fit m-1'>
      <Tooltip id='my-tooltip' />
      <h1 className='text-center text-xl font-bold text-slate-900'>
        {table.name}
      </h1>
      <div className='flex flex-row m-1'>
        <p className='w-8 text-center text-slate-900 -rotate-90 transform self-center text-2xl'>
          {table.rowheader}
        </p>
        <div className='flex flex-col'>
          {table.matrix.map((row, i) => (
            <div key={i} className='flex flex-row m-1'>
              <p
                className={
                  'w-8 text-center text-slate-900 self-center' +
                  (i === table.lastRow ? ' border-4 border-green-100' : '')
                }
              >
                {table.rowlabels ? table.rowlabels[i] ?? '' : ''}
              </p>
              {row.map((cell, j) => (
                <div
                  key={j}
                  data-tooltip-id={'my-tooltip'}
                  data-tooltip-content={
                    (table.rowheader
                      ? table.rowheader +
                      ' ' +
                      (table.rowlabels ? table.rowlabels[i] ?? '' : '')
                      : '') +
                    ', ' +
                    (table.colheader
                      ? table.colheader +
                      ' ' +
                      (table.collabels ? table.collabels[j] ?? '' : '')
                      : '')
                  }
                  className={
                    'text-xs rounded-md m-1 w-8 h-8 flex items-center justify-center transition-all ' +
                    (i === table.lastRow && j === table.lastColumn
                      ? 'border-2 border-red-500 bg-red-500 '
                      : '') +
                    (i === table.lastRow && j !== table.lastColumn
                      ? 'bg-green-300 '
                      : '') +
                    (i !== table.lastRow && j === table.lastColumn
                      ? 'bg-blue-300 '
                      : '') +
                    (i !== table.lastRow && j !== table.lastColumn
                      ? 'bg-slate-300 '
                      : ' ')
                  }
                >
                  {table.cellstringMapping
                    ? table.cellstringMapping(cell)
                    : cell}
                </div>
              ))}
            </div>
          ))}
          <div className='flex flex-row m-1'>
            <h1 className='w-8 text-center text-slate-900'> </h1>
            {table.collabels?.map((label, i) => (
              <p
                key={i}
                className={
                  'm-1 w-8 h-8 flex items-center justify-center text-center self-center text-slate-900' +
                  (i === table.lastColumn ? ' border-4 border-blue-100' : '')
                }
              >
                {label}
              </p>
            ))}
          </div>
          <div className='flex flex-col m-1'>
            <p className='w-8 text-center text-slate-900 ransform self-center text-2xl'>
              {table.colheader ?? ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
