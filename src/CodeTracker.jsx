import { useEffect, useState } from 'react';

/**
 * Returns an CodeTracker (auxiliary data structure for graph algorithm)
 * @param {{code: CodeTracker}} props
 */
export default function Code({ code }) {
  const [refreshCode, setRefreshCode] = useState(false);
  useEffect(() => {
    const int = setInterval(() => {
      setRefreshCode((x) => !x);
    }, 100);
    return () => {
      clearInterval(int);
    };
  }, [code]);

  return (
    <div className='flex flex-col p-1 bg-slate-100 rounded-md w-fit m-1'>
      {code.codeList.map((line, i) => (
        <div
          key={i}
          className={
            'text-left text-black text-sm px-2 ' +
            (i === code.currentLine ? 'bg-slate-300 ' : '')
          }
        >
          {line}
        </div>
      ))}
    </div>
  );
}
