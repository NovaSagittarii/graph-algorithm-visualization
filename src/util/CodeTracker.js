/**
 * @template T
 * Code with event listeners for "read" (when get is called) and "write" (when set is called)
 *
 * TODO: any idea to set type annotations for eventListeners?
 */
class CodeTracker extends EventTarget {
  /**
   * @param {T} codeList
   */
  constructor(codeList) {
    super();
    /**
     * @type {Array.<Array.<T>>}
     */
    this.codeList = codeList;
    this.currentLine = 0;
  }

  setLine(newLine) {
    this.currentLine = newLine;
    this.dispatchEvent(new Event('write'));
    return this;
  }
}

export default CodeTracker;
