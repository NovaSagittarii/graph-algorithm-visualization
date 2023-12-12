/**
 * @template T
 * Table with event listeners for "read" (when get is called) and "write" (when set is called)
 *
 * TODO: any idea to set type annotations for eventListeners?
 */
class EventfulTable extends EventTarget {
  /**
   * @param {number} rows 
   * @param {number} columns 
   * @param {T} initialValue 
   * @param {T => string} toString mapping function for display
   */
  constructor(rows, columns, initialValue = 0, toString = x => (x+"")) {
    super();
    /**
     * @type {Array.<Array.<T>>}
     */
    this.matrix = [...new Array(rows)].map(() =>
      [...new Array(columns)].map(() => initialValue),
    );

    // surely this doesn't lead to race condition?
    this.lastRow = -1;
    this.lastColumn = -1;
    this.lastWrite = -1;

    /** @type {T => string} */
    this.cellToString = toString;
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
