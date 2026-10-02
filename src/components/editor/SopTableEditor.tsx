import React from 'react';
import type { TableBlock } from '../../model/sopDocument';

interface Props {
  block: TableBlock;
  onChange: (block: TableBlock) => void;
}

const inputClass = 'w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100';

export const SopTableEditor: React.FC<Props> = ({ block, onChange }) => {
  const columnCount = Math.max(
    block.headers?.length ?? 0,
    ...block.rows.map(row => row.length),
    1
  );

  const setCell = (rowIndex: number, columnIndex: number, value: string) => {
    const rows = block.rows.map(row => {
      const next = [...row];
      while (next.length < columnCount) next.push('');
      return next;
    });
    rows[rowIndex][columnIndex] = value;
    onChange({ ...block, rows });
  };

  const setHeader = (columnIndex: number, value: string) => {
    const headers = [...(block.headers ?? Array.from({ length: columnCount }, () => ''))];
    headers[columnIndex] = value;
    onChange({ ...block, headers });
  };

  const addRow = () => {
    onChange({
      ...block,
      rows: [...block.rows, Array.from({ length: columnCount }, () => '')]
    });
  };

  const deleteRow = (rowIndex: number) => {
    onChange({
      ...block,
      rows: block.rows.filter((_, index) => index !== rowIndex)
    });
  };

  const addColumn = () => {
    const nextCount = columnCount + 1;
    onChange({
      ...block,
      headers: block.headers ? [...block.headers, ''] : undefined,
      rows: block.rows.length > 0
        ? block.rows.map(row => [...row, ''])
        : [Array.from({ length: nextCount }, () => '')]
    });
  };

  const deleteColumn = (columnIndex: number) => {
    if (columnCount <= 1) return;
    onChange({
      ...block,
      headers: block.headers?.filter((_, index) => index !== columnIndex),
      rows: block.rows.map(row => row.filter((_, index) => index !== columnIndex))
    });
  };

  const toggleHeaders = () => {
    if (block.headers) {
      onChange({ ...block, headers: undefined });
      return;
    }
    onChange({
      ...block,
      headers: Array.from({ length: columnCount }, () => ''),
      rows: block.rows.map(row => {
        const next = [...row];
        while (next.length < columnCount) next.push('');
        return next.slice(0, columnCount);
      })
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={toggleHeaders} className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold hover:bg-slate-50">
          {block.headers ? 'Remove header row' : 'Add header row'}
        </button>
        <button type="button" onClick={addRow} className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold hover:bg-slate-50">+ Row</button>
        <button type="button" onClick={addColumn} className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold hover:bg-slate-50">+ Column</button>
        <span className="text-[11px] text-slate-500">Rectangular table · {columnCount} columns</span>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full border-collapse text-left">
          {block.headers && (
            <thead>
              <tr className="bg-slate-50">
                {block.headers.map((header, index) => (
                  <th key={index} className="border-b border-slate-200 p-2 align-top">
                    <label className="sr-only" htmlFor={'table-header-' + index}>Header column {index + 1}</label>
                    <input
                      id={'table-header-' + index}
                      value={header}
                      onChange={event => setHeader(index, event.target.value)}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => deleteColumn(index)}
                      className="mt-1 text-[10px] text-slate-500 hover:text-rose-600 disabled:opacity-30"
                      disabled={columnCount <= 1}
                    >
                      Delete column
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {block.rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="p-4 text-center text-xs text-slate-500">
                  No body rows. Add a row to begin.
                </td>
              </tr>
            ) : (
              block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: columnCount }, (_, columnIndex) => (
                    <td key={columnIndex} className="border-t border-slate-200 p-2 align-top">
                      <label
                        className="sr-only"
                        htmlFor={'table-' + rowIndex + '-' + columnIndex}
                      >
                        Row {rowIndex + 1}, column {columnIndex + 1}
                      </label>
                      <input
                        id={'table-' + rowIndex + '-' + columnIndex}
                        value={row[columnIndex] ?? ''}
                        onChange={event => setCell(rowIndex, columnIndex, event.target.value)}
                        className={inputClass}
                      />
                    </td>
                  ))}
                  <td className="border-t border-slate-200 p-2 align-top">
                    <button
                      type="button"
                      onClick={() => deleteRow(rowIndex)}
                      className="text-[10px] text-slate-500 hover:text-rose-600"
                    >
                      Delete row
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
