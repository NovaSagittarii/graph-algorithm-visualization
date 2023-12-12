/**
 * @template T
 * @typedef {Object} TableConfiguration
 * @property {string} name Table display title
 * @property {number} rows number of rows (height)
 * @property {number} cols number of columns (width)
 * @property {T} initialValue Initial cell value
 * @property {Array.<string>} rowlabels
 * @property {Array.<string>} collabels
 * @property {(cell: T) => string} stringMapping cell to string mapping (for display)
 */

/**
 * @template T
 * Table with event listeners for "read" (when get is called) and "write" (when set is called)
 *
 * TODO: any idea to set type annotations for eventListeners?
 */
class EventfulTable extends EventTarget {
  /**
   * @param {TableConfiguration<T>} tableConfiguration
   */
  constructor(tableConfiguration) {
    super();
    /**
     * @type {Array.<Array.<T>>}
     */
    this.matrix = [...new Array(tableConfiguration.rows)].map(() =>
      [...new Array(tableConfiguration.cols)].map(() => tableConfiguration.initialValue),
    );

    // surely this doesn't lead to race condition?
    this.lastRow = -1;
    this.lastColumn = -1;
    this.lastWrite = -1;
    this.name = tableConfiguration.name;
    this.rowlabels = tableConfiguration.rowlabels;
    this.collabels = tableConfiguration.collabels;
    this.rowheader = tableConfiguration.rowheader;
    this.colheader = tableConfiguration.colheader;

    /** @type {T => string} */
    this.cellstringMapping = tableConfiguration.stringMapping;
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
