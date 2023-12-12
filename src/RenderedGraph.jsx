import React, { useState, useEffect } from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import Vector2 from './util/Vector2';
import GraphPlayer from './util/GraphPlayer';
import Table from './Table';
import CodeTracker from './CodeTracker';
import Voronoi from 'Voronoi';

/**
 * Fading flash duration when a node/edge is accessed (in ms)
 */
const FADE_DURATION = 250;

let dragged = null;

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
      // for (let i = 0; i < vertices.length; ++i) {
      //   const { position, lastRead, highlights } = vertices[i];
      //   for (const color of highlights) {
      //     // prettier-ignore
      //     p5.fill(
      //       255 * (color % 2),
      //       255 * ((color >> 1) % 2),
      //       255 * ((color >> 2) % 2),
      //       20
      //     );
      //     p5.noStroke();
      //     p5.ellipse(position.x, position.y, 30, 30);
      //     p5.strokeWeight(30);
      //     // prettier-ignore
      //     p5.stroke(
      //       255 * (color % 2),
      //       255 * ((color >> 1) % 2),
      //       255 * ((color >> 2) % 2),
      //       10
      //     );
      //     for (const { to } of graph.edgeLists[i]) {
      //       if (vertices[to].highlights.has(color)) {
      //         const { x, y } = vertices[to].position;
      //         p5.line(position.x, position.y, x, y);
      //       }
      //     }
      //   }
      // }
      // Use Voronoi on the highlight colors to draw the background, do not draw voronoi edge, color should be the same color as the highlight of the vertext it contains
      const voronoi = new Voronoi();
      const bbox = { xl: 0, xr: p5.width, yt: 0, yb: p5.height };
      const sites = [];
      for (const vertex of vertices) {
        if (vertex.highlights.size === 0) {
          sites.push({
            x: vertex.position.x,
            y: vertex.position.y,
            color: 0,
          });
        }
        for (const color of vertex.highlights) {
          sites.push({
            x: vertex.position.x,
            y: vertex.position.y,
            color,
          });
        }
      }
      const diagram = voronoi.compute(sites, bbox);

      // find shared edges between cells
      const sharedEdges = new Map();
      for (const cell of diagram.cells) {
        for (const halfedge of cell.halfedges) {
          const { x: xstart, y: ystart } = halfedge.getStartpoint();
          const { x: xend, y: yend } = halfedge.getEndpoint();
          const key = `${Math.min(xstart, xend)} ${Math.min(ystart, yend)} ${Math.max(xstart, xend)} ${Math.max(ystart, yend)}`;
          if (sharedEdges.has(key)) {
            sharedEdges.get(key).push(cell);
          } else {
            sharedEdges.set(key, [cell]);
          }
        }
      }

      for (const cell of diagram.cells) {
        p5.fill(
          255 * (cell.site.color % 2),
          255 * ((cell.site.color >> 1) % 2),
          255 * ((cell.site.color >> 2) % 2),
          25,
        );
        p5.strokeWeight(0);
        p5.beginShape();
        // draw shape with rounded corners by stopping each edge a bit early and using curveVertex() to connect them
        for (let i = 0; i < cell.halfedges.length; i++) {
          let { x: xstart, y: ystart } = cell.halfedges[i % cell.halfedges.length].getStartpoint();
          let { x: xend, y: yend } = cell.halfedges[i % cell.halfedges.length].getEndpoint();
          let { x: xnextstart, y: ynextstart } = cell.halfedges[(i + 1) % cell.halfedges.length].getStartpoint();
          let { x: xnextend, y: ynextend } = cell.halfedges[(i + 1) % cell.halfedges.length].getEndpoint();

          // stop a bit early to curve the corner
          let xsub = (xend - xstart) * 0.2;
          let ysub = (yend - ystart) * 0.2;
          let xmid = xend - xsub;
          let ymid = yend - ysub;
          let xnextsub = (xnextend - xnextstart) * 0.2;
          let ynextsub = (ynextend - ynextstart) * 0.2;
          let xmidnext = xnextstart + xnextsub;
          let ymidnext = ynextstart + ynextsub;

          // p5.vertex(xmid, ymid);
          // p5.curveVertex(xmidnext, ymidnext);
          p5.vertex(xstart, ystart);
        }
        p5.endShape(p5.CLOSE);
      }
      p5.pop();

      // --- Drawing vertices
      p5.push();
      for (let i = 0; i < vertices.length; ++i) {
        const { position, lastRead, color } = vertices[i];
        // prettier-ignore
        p5.stroke(
          255 * (color % 2),
          255 * ((color >> 1) % 2),
          255 * ((color >> 2) % 2),
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
          255 * ((color >> 1) % 2),
          255 * ((color >> 2) % 2),
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

      // Make nodes draggable
      if (p5.mousePressed) {
        if (dragged === null) {
          for (let i = 0; i < vertices.length; ++i) {
            const { position } = vertices[i];
            const { x, y } = p5.createVector(p5.mouseX, p5.mouseY);
            if (x > position.x - 15 && x < position.x + 15 && y > position.y - 15 && y < position.y + 15) {
              dragged = i;
            }
          }
        }
      }
      if (p5.mouseIsPressed && dragged !== null) {
        const { position } = vertices[dragged];
        position.x = p5.mouseX;
        position.y = p5.mouseY;
      } else {
        dragged = null;
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
