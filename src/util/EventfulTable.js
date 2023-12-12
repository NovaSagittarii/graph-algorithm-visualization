/**
 * @template T
 * Table with event listeners for "read" (when get is called) and "write" (when set is called)
 * 
 * TODO: any idea to set type annotations for eventListeners?
 */
class EventfulTable extends EventTarget {
  /**
   * @typedef {{name:string, rows:number, columns:number, initialValue:T, rowheader:string, rowlabels:string[], colheader:string, collabels:string[], stringMapping:T=>string}} TableField<T>
   * @param {TableField<T>} tablefield
   */
  constructor(tablefield) {
    super();
    /**
     * @type {Array.<Array.<T>>}
     */
    this.matrix = [...new Array(tablefield.rows)].map(() =>
      [...new Array(tablefield.cols)].map(() => tablefield.initialValue),
    );

    // surely this doesn't lead to race condition?
    this.lastRow = -1;
    this.lastColumn = -1;
    this.lastWrite = -1;
    this.name = tablefield.name;
    this.rowlabels = tablefield.rowlabels;
    this.collabels = tablefield.collabels;
    this.rowheader = tablefield.rowheader;
    this.colheader = tablefield.colheader;

    /** @type {T => string} */
    this.cellstringMapping = tablefield.stringMapping;
  }

  /**
   * Reads from the table
   * @param {number} row
   * @param {number} column
   * @return {T}
   */
  get(row, column) {
    this.lastRow = row;
    this.lastColumn = column;
    this.dispatchEvent(new Event('read'));
    return this.matrix[row][column];
  }

  /**
   * Writes to the table
   * @param {number} row
   * @param {number} column
   * @param {T} newValue
   * @return {EventfulTable} itself
   */
  set(row, column, newValue) {
    this.lastRow = row;
    this.lastColumn = column;
    this.lastWrite = newValue;
    this.dispatchEvent(new Event('write'));
    this.matrix[row][column] = newValue;
    return this;
  }
}

export default EventfulTable;
