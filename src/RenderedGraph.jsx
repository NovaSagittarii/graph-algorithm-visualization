import * as React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import Graph from './util/Graph';
import BFS from './algorithm/BFS';
import GraphPlayer from './util/GraphPlayer';
import Vector2 from './util/Vector2';

const graphInput = Graph.generateRoughlyPlanarGraph(20);
const processedGraph = new BFS().run(graphInput);
const graph = new GraphPlayer(processedGraph);
console.log(graph);

const FADE_DURATION = 15;

/**
 * @param {import("@p5-wrapper/react").P5CanvasInstance} p5
 */
function sketch(p5) {
  p5.setup = () => {
    p5.createCanvas(600, 400, p5.P2D);
    p5.textAlign(p5.CENTER, p5.CENTER);
  };

  p5.mousePressed = () => {
    graph.step(p5.frameCount);
  };

  p5.draw = () => {
    if (p5.frameCount % 5 === 0) graph.step(p5.frameCount);
    p5.background(250);
    p5.push();
    // p5.ellipse(p5.mouseX, p5.mouseY, 10, 10);
    // p5.text(`${p5.mouseX}, ${p5.mouseY}`, 100, 100);
    p5.text(`${graph.pc} of ${graph.events.length}`, 100, 50);

    const { vertices, edges } = graph;
    p5.noFill();

    // --- Drawing vertex highlight background
    p5.push();
    for (let i = 0; i < vertices.length; ++i) {
      const { position, lastRead, highlights } = vertices[i];
      for (const color of highlights) {
        // prettier-ignore
        p5.fill(
          255 * (color % 2),
          255 * ((color>>1) % 2),
          255 * ((color>>2) % 2),
          20
        );
        p5.noStroke();
        p5.ellipse(position.x, position.y, 30, 30);
        p5.strokeWeight(30);
        // prettier-ignore
        p5.stroke(
          255 * (color % 2),
          255 * ((color>>1) % 2),
          255 * ((color>>2) % 2),
          10
        );
        for (const { to } of graph.edgeLists[i]) {
          if (vertices[to].highlights.has(color)) {
            const { x, y } = vertices[to].position;
            p5.line(position.x, position.y, x, y);
          }
        }
      }
    }
    p5.pop();

    // --- Drawing vertices
    p5.push();
    for (let i = 0; i < vertices.length; ++i) {
      const { position, lastRead, color } = vertices[i];
      // prettier-ignore
      p5.stroke(
        255 * (color % 2),
        255 * ((color>>1) % 2),
        255 * ((color>>2) % 2),
        100 + 155 * Math.max(0, (FADE_DURATION + lastRead - p5.frameCount) / FADE_DURATION),
      );
      // prettier-ignore
      p5.strokeWeight(1 + 1 * Math.max(0, (FADE_DURATION + lastRead - p5.frameCount) / FADE_DURATION));
      p5.fill(255);
      p5.ellipse(position.x, position.y, 15, 15);
      p5.fill(0);
      p5.noStroke();
      p5.text(i, position.x, position.y);
    }
    p5.pop();

    // --- Drawing edges
    p5.stroke(0);
    for (const edge of edges) {
      const { from, to, lastRead, color } = edge;
      const u = vertices[from].position;
      const v = vertices[to].position;
      // prettier-ignore
      p5.stroke(
        255 * (color % 2),
        255 * ((color>>1) % 2),
        255 * ((color>>2) % 2),
        100 + 155 * Math.max(0, (FADE_DURATION + lastRead - p5.frameCount) / FADE_DURATION),
      );
      p5.push();
      p5.translate(u.x, u.y);
      const diff = u.clone().multiply(-1).add(v.clone());
      p5.rotate(diff.angle());
      const RADIUS_OFFSET = 7;
      p5.line(RADIUS_OFFSET, 3, diff.magnitude() - RADIUS_OFFSET, 3);
      p5.translate(diff.magnitude() - RADIUS_OFFSET, 3);
      p5.line(0, 0, -3, 3);
      p5.pop();
    }
    p5.noStroke();

    const impulse = vertices.map((u) => new Vector2(0, 0));
    for (const edgeList of graph.edgeLists) {
      for (const { from, to } of edgeList) {
        if (from !== to) continue;
        vertices[from].position.repulse(
          vertices[to].position,
          10,
          5,
          impulse[from],
        );
      }
    }
    vertices.forEach((v, i) => v.position.add(impulse[i]));

    p5.pop();
  };
}

export default function RenderedGraph() {
  return <ReactP5Wrapper sketch={sketch} />;
}
