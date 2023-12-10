/**
 * @template [T=number]
 * Table with event listeners for "read" (when get is called) and "write" (when set is called)
 *
 * TODO: any idea to set type annotations for eventListeners?
 */
class EventfulTable extends EventTarget {
  constructor(rows, columns, initialValue = 0) {
    super();
    /**
     * @type {Array.<Array.<T>>}
     */
    this.matrix = [...new Array(rows)].map(() =>
      [...new Array(columns)].map(() => initialValue),
    );
  }

  /**
   * Reads from the table
   * @param {number} row
   * @param {number} column
   * @return {T}
   */
  get(row, column) {
    this.dispatchEvent(new Event('read', { row, column }));
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
    this.dispatchEvent(
      new Event('write', {
        row,
        column,
        oldValue: this.matrix[row][column],
        newValue,
      }),
    );
    this.matrix[row][column] = newValue;
    return this;
  }
}

export default EventfulTable;
