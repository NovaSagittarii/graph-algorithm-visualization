import Graph from '../util/Graph';

class BaseAlgorithm {
  /**
   * Runs algorithm on the graph, returns graph after processing.
   * @abstract
   * @param {import("../util/Graph").GraphInput} graphInput input to process
   * @param {*} configuration
   * @return {Graph}
   */
  run(graphInput, configuration) {
    const graph = new Graph(graphInput);
    configuration;
    throw new Error('This is an abstract method that should be implemented');
  }
}

export default BaseAlgorithm;
