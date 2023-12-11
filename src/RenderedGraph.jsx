import React, { useState, useEffect } from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import Vector2 from './util/Vector2';
import GraphPlayer from './util/GraphPlayer';
import Table from './Table';
import CodeTracker from './CodeTracker';

/**
 * Fading flash duration when a node/edge is accessed (in ms)
 */
const FADE_DURATION = 250;

/**
 *
 * @param {{graph: GraphPlayer|null}} props
 * @returns
 */
export default function RenderedGraph({ graph }) {
  /**
   * @param {import("@p5-wrapper/react").P5CanvasInstance} p5
   */
  function sketch(p5) {
    p5.setup = () => {
      p5.createCanvas(600, 400, p5.P2D);
      p5.textAlign(p5.CENTER, p5.CENTER);
    };

    p5.mousePressed = () => {
      // graph.step(Date.now());
    };

    p5.draw = () => {
      if (!graph) return;
      p5.background(250);
      p5.push();
      // p5.ellipse(p5.mouseX, p5.mouseY, 10, 10);
      // p5.text(`${p5.mouseX}, ${p5.mouseY}`, 100, 100);
      p5.text(p5.frameRate().toFixed(1), 100, 25);
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
          100 + 155 * Math.max(0, (FADE_DURATION + lastRead - Date.now()) / FADE_DURATION),
        );
        // prettier-ignore
        p5.strokeWeight(1 + 1 * Math.max(0, (FADE_DURATION + lastRead - Date.now()) / FADE_DURATION));
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
        const { from, to, lastRead, color, weight } = edge;
        const u = vertices[from].position;
        const v = vertices[to].position;
        if (!graph.directed && from < to) continue; // draw only one of them when UNDIRECTED
        // prettier-ignore
        p5.stroke(
          255 * (color % 2),
          255 * ((color>>1) % 2),
          255 * ((color>>2) % 2),
          100 + 155 * Math.max(0, (FADE_DURATION + lastRead - Date.now()) / FADE_DURATION),
        );
        p5.push();
        p5.translate(u.x, u.y);
        const diff = u.clone().multiply(-1).add(v.clone());
        p5.rotate(diff.angle());
        const RADIUS_OFFSET = 8;
        if (graph.directed) {
          const biconnected = graph.edgeMatrix[from][to] && graph.edgeMatrix[to][from];
          const minorAxisOffset = biconnected ? 3 : 0
          p5.line(RADIUS_OFFSET, minorAxisOffset, diff.magnitude() - RADIUS_OFFSET, minorAxisOffset);
          p5.push();
          p5.translate(diff.magnitude()/2, 5);
          p5.rotate(-diff.angle());
          p5.noStroke();
          p5.fill(0);
          p5.text(weight, 0, 0);
          p5.pop();
          p5.translate(diff.magnitude() - RADIUS_OFFSET, minorAxisOffset);
          p5.line(0, 0, -3, 3);
          if (!biconnected) {
            p5.line(0, 0, -3, -3);
          }
        } else {
          p5.line(RADIUS_OFFSET, 0, diff.magnitude() - RADIUS_OFFSET, 0);
          p5.push();
          p5.noStroke();
          p5.fill(0);
          p5.translate(diff.magnitude() / 2, 0);
          p5.rotate(-diff.angle());
          p5.text(weight, 0, 0);
          p5.pop();
        }
        p5.pop();
      }
      p5.noStroke();

      const impulse = vertices.map(() => new Vector2(0, 0));
      for (let u = 0; u < vertices.length; ++u) {
        for (let v = 0; v < vertices.length; ++v) {
          if (u === v) continue;
          const connected = graph.edgeMatrix[u][v] !== null;
          // prettier-ignore
          vertices[u].position.repulse(vertices[v].position, 150, 1, impulse[u]);
          // prettier-ignore
          if (connected) {
            vertices[u].position.repulse(vertices[v].position, 20, 3, impulse[u]);
          }
        }
      }
      vertices.forEach((v, i) => v.position.add(impulse[i].multiply(0.5)));

      p5.pop();
    };
  }
  return (
    <div>
      <div className='flex'>
        <ReactP5Wrapper sketch={sketch} />
        {graph?.code && <CodeTracker code={graph.code} />}
      </div>
      {graph?.tables.map((table, index) => (
        <div key={index}>
          <Table table={table} />
        </div>
      ))}
    </div>
  );
}
