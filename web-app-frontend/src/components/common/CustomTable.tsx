import React, { useState } from 'react';
import { Table, Form } from 'react-bootstrap';

export interface TableColumn {
  key: string;
  label: string;
}

export interface StyleProps {
  centerHeaders: boolean,
  textCenterValues: boolean,
}

export type CellValue = string | number | boolean | null;

export type Cell = ReactCell | CellValue;

export interface ExpandableRowBehavior {
  expandableContent: (row: CustomTableRow) => React.ReactNode;
}

export interface HandleClickBehavior {
  handler: (row: CustomTableRow) => void;
}

export type RowBehavior = ExpandableRowBehavior | HandleClickBehavior;

export type CustomTableRow = { [key: string]: Cell };

export type CellClickHandler = (row: CustomTableRow, cell: Cell) => void;

export interface ReactCell {
  /**
   * Data UI representation
   */
  representation: React.ReactNode;
  /**
   * Click handler
   * @param row clicked row
   * @param cell clicked cell
   */
  onClick?: CellClickHandler;
  /**
   * Data text representation for filtering and sorting
   */
  value?: CellValue;
  /**
   * Cell TD class name
   */
  className?: string | null;
}

export interface CustomTableProps {
  className?: string;
  thead?: {
    className?: string;
  };
  columns: TableColumn[];
  data: Array<CustomTableRow>;
  sortableColumns?: string[];
  filterableColumns?: string[];
  styleProps?: StyleProps;
  /**
   * Row behavior
   */
  rowBehavior?: RowBehavior;
}

const CustomTable: React.FC<CustomTableProps> = ({
                                                   className = null,
                                                   thead = null,
                                                   columns,
                                                   data,
                                                   sortableColumns = [],
                                                   filterableColumns = [],
                                                   styleProps = {
                                                     centerHeaders: true,
                                                     textCenterValues: false,
                                                   },
                                                   rowBehavior
                                                 }) => {
  const [filter, setFilter] = useState<{ [key: string]: string }>({});
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, columnKey: string) => {
    setFilter({ ...filter, [columnKey]: event.target.value });
  };

  const handleSort = (columnKey: string) => {
    if (!sortableColumns.includes(columnKey)) return;
    const direction = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnKey);
    setSortDirection(direction);
  };

  const getCellValue = (cell: Cell): string | number => {
    if (!cell) {
      return '';
    }
    if (typeof cell == 'string' || typeof cell === 'number') {
      return cell;
    }
    if (typeof cell === 'boolean') {
      return `${cell}`;
    }
    if (typeof cell.value === 'string' || typeof cell.value === 'number') {
      return cell.value;
    }
    return cell.value ? `${cell.value}` : '';
  };

  const getCellRepresentation = (cell: Cell): React.ReactNode => {
    if (!cell) {
      return '';
    }
    if (typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean') {
      return cell;
    }
    return cell.representation;
  };

  const getCellClassName = (cell: Cell): React.ReactNode => {
    if (!cell || typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean') {
      return '';
    }
    return cell.className;
  };

  const getCellOnClick = (row: CustomTableRow, cell: Cell): undefined | (() => void) => {
    if (!cell) {
      return undefined;
    }
    if (typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean') {
      return undefined;
    }
    const onClick = cell.onClick;
    if (!onClick) {
      return undefined;
    }
    return () => onClick(row, cell);
  };

  const filterCell = (item: CustomTableRow, key: string, value: string): boolean => {
    if (!value) return true;
    const cell = item[key];
    let cellValue = getCellValue(cell);
    if (typeof cellValue === 'number') {
      if (value.startsWith('>=')) {
        const numberValue = +value.substring(2);
        return cellValue >= numberValue;
      }
      if (value.startsWith('>')) {
        const numberValue = +value.substring(1);
        return cellValue > numberValue;
      }
      if (value.startsWith('<=')) {
        const numberValue = +value.substring(2);
        return cellValue <= numberValue;
      }
      if (value.startsWith('<')) {
        const numberValue = +value.substring(1);
        return cellValue < numberValue;
      }
      if (value.startsWith('==')) {
        const numberValue = +value.substring(2);
        return cellValue === numberValue;
      }
      cellValue = `${cellValue}`;
    }
    return cellValue.toLowerCase().includes(value.toLowerCase());
  };

  const rowComparator = (a: CustomTableRow, b: CustomTableRow) => {
    if (!sortColumn) return 0;
    let aValue = getCellValue(a[sortColumn]);
    let bValue = getCellValue(b[sortColumn]);
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (aValue === bValue) {
        return 0;
      }
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue > bValue ? -1 : 1;
    }
    if (typeof aValue !== 'string') {
      aValue = `${aValue}`;
    }
    if (typeof bValue !== 'string') {
      bValue = `${bValue}`;
    }

    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  };

  const preparedData = data
    .filter((item) => {
      return Object.entries(filter).every(([key, value]) => {
        if (!value) return true;
        return filterCell(item, key, value);
      });
    })
    .sort(rowComparator);

  const toggleRowExpand = (index: number) => {
    setExpandedRows((prevExpandedRows) => {
      const newExpandedRows = new Set(prevExpandedRows);
      if (newExpandedRows.has(index)) {
        newExpandedRows.delete(index);
      } else {
        newExpandedRows.add(index);
      }
      return newExpandedRows;
    });
  };

  return (
    <Table className={className ?? ''}>
      <thead className={`table-dark ${thead?.className ?? ''}`}>
      <tr className={`${styleProps.centerHeaders ? 'text-center' : ''}`}>
        {columns.map((column) => (
          <th
            key={column.key}
            onClick={() => handleSort(column.key)}
            style={{ cursor: sortableColumns.includes(column.key) ? 'pointer' : 'default' }}
          >
            {column.label}
            {sortableColumns.includes(column.key) && sortColumn === column.key && (
              sortDirection === 'asc' ? ' ▲' : ' ▼'
            )}
          </th>
        ))}
      </tr>
      <tr>
        {columns.map((column) => (
          <th key={`filter-${column.key}`}>
            {filterableColumns.includes(column.key) && (
              <Form.Control
                type={'text'}
                placeholder={`Filter ${column.label}`}
                value={filter[column.key] || ''}
                onChange={(e) => handleFilterChange(e, column.key)}
              />
            )}
          </th>
        ))}
      </tr>
      </thead>
      <tbody>
      {preparedData.map((row, index) => {
          if (!rowBehavior) {
            return (
              <tr>
                {columns.map((column) => {
                  const cellOnClick = getCellOnClick(row, row[column.key]);
                  return (
                    <td
                      className={`${styleProps.textCenterValues ? 'text-center' : ''} ${getCellClassName(row[column.key])}`.trim()}
                      onClick={cellOnClick}
                      role={cellOnClick ? 'button' : undefined}
                      key={column.key}>{getCellRepresentation(row[column.key])}</td>
                  );
                })}
              </tr>
            );
          }
          if ('handler' in rowBehavior) {
            return (
              <tr
                onClick={() => rowBehavior.handler(row)}
                role={'button'}
              >
                {columns.map((column) => {
                  const cellOnClick = getCellOnClick(row, row[column.key]);
                  return (
                    <td
                      className={`${styleProps.textCenterValues ? 'text-center' : ''} ${getCellClassName(row[column.key])}`.trim()}
                      onClick={cellOnClick}
                      role={cellOnClick ? 'button' : undefined}
                      key={column.key}>{getCellRepresentation(row[column.key])}</td>
                  );
                })}
              </tr>
            );
          }
          if ('expandableContent' in rowBehavior) {
            return (
              <React.Fragment key={index}>
                <tr
                  onClick={() => toggleRowExpand(index)}
                  role={'button'}
                >
                  {columns.map((column) => {
                    const cellOnClick = getCellOnClick(row, row[column.key]);
                    return (
                      <td
                        className={`${styleProps.textCenterValues ? 'text-center' : ''} ${getCellClassName(row[column.key])}`.trim()}
                        onClick={cellOnClick}
                        role={cellOnClick ? 'button' : undefined}
                        key={column.key}>{getCellRepresentation(row[column.key])}</td>
                    );
                  })}
                </tr>
                {expandedRows.has(index) && (
                  <tr key={`details-${index}`} className="expandable-row">
                    <td colSpan={columns.length}>
                      {rowBehavior.expandableContent(row)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          }
          return (
            <tr>
              {columns.map((column) => {
                const cellOnClick = getCellOnClick(row, row[column.key]);
                return (
                  <td
                    className={`${styleProps.textCenterValues ? 'text-center' : ''} ${getCellClassName(row[column.key])}`.trim()}
                    onClick={cellOnClick}
                    role={cellOnClick ? 'button' : undefined}
                    key={column.key}>{getCellRepresentation(row[column.key])}</td>
                );
              })}
            </tr>
          );
        }
      )
      }
      </tbody>
    </Table>
  );
};

export default CustomTable;
