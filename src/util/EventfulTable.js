/**
 * @template T
 * Table with event listeners for "read" (when get is called) and "write" (when set is called)
 * 
 * TODO: any idea to set type annotations for eventListeners?
 */
class EventfulTable extends EventTarget {
  /**
   * @typedef {{name:string, rows:number, columns:number, initialValue:T, rowheader:string, rowlabels:string[], colheader:string, collabels:string[], stringMapping:T=>string}} TableConfig<T>
   * @param {TableConfig<T>} tableConfig
   */
  constructor(tableConfig) {
    super();
    /**
     * @type {Array.<Array.<T>>}
     */
    this.matrix = [...new Array(tableConfig.rows)].map(() =>
      [...new Array(tableConfig.cols)].map(() => tableConfig.initialValue),
    );

    // surely this doesn't lead to race condition?
    this.lastRow = -1;
    this.lastColumn = -1;
    this.lastWrite = -1;
    this.name = tableConfig.name;
    this.rowlabels = tableConfig.rowlabels;
    this.collabels = tableConfig.collabels;
    this.rowheader = tableConfig.rowheader;
    this.colheader = tableConfig.colheader;

    /** @type {T => string} */
    this.cellstringMapping = tableConfig.stringMapping;
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
