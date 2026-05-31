/**
 * Copyright (C) 2026  Frank Eberle
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.\
 */

import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import { useTheme } from '@mui/material/styles';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import GlobalStateContext from './GlobalStateContext';

cytoscape.use(dagre);

const HIGHLIGHT_SELECTED = '#2196f3';
const HIGHLIGHT_PARENT   = '#f44336';
const HIGHLIGHT_CHILD    = '#4caf50';
const META_COLOR         = '#f5a623';

function getNodeLabel(component) {
  if (component.version) return `${component.name}\n(${component.version})`;
  return component.name ?? '(unnamed)';
}

function bomKey(bom) {
  const components = (bom?._flattenedComponents ?? []).map(
    (c) => `${c._id}|${c.name}|${c.version}|${c._dependencies ?? ''}`
  );
  const meta = bom?.metadata?.component;
  const metaStr = meta
    ? `${meta._id}|${meta.name}|${meta.version}|${meta._dependencies ?? ''}`
    : '';
  return metaStr + '::' + components.join(';');
}

export default function DependencyGraphView({ show, bom }) {
  const containerRef = React.useRef(null);
  const cyRef = React.useRef(null);
  const theme = useTheme();
  const globalState = React.useContext(GlobalStateContext);
  const config = globalState.getObj('config');
  const key = bomKey(bom);

  function getDefaultColor(component) {
    try {
      return config['componentColorFunc']?.(component) ?? theme.palette.text.primary;
    } catch {
      return theme.palette.text.primary;
    }
  }

  React.useEffect(() => {
    if (!show || !containerRef.current) return;

    const primaryBg   = theme.palette.background.paper;
    const borderColor = theme.palette.divider;

    // Collect all components
    const allComponents = [];
    if (bom?.metadata?.component?.name) {
      allComponents.push({ component: bom.metadata.component, isMeta: true });
    }
    (bom?._flattenedComponents ?? []).forEach((c) =>
      allComponents.push({ component: c, isMeta: false })
    );

    // Build edge map: sourceId -> [targetId, ...]
    const edgeMap = new Map();
    allComponents.forEach(({ component }) => {
      if (!component._dependencies || component._dependencies === '') return;
      const targets = component._dependencies.split(',').filter(Boolean);
      if (targets.length > 0) edgeMap.set(component._id, targets);
    });

    // Build reverse map: targetId -> [sourceId, ...]
    const reverseMap = new Map();
    edgeMap.forEach((targets, sourceId) => {
      targets.forEach((tid) => {
        if (!reverseMap.has(tid)) reverseMap.set(tid, []);
        reverseMap.get(tid).push(sourceId);
      });
    });

    const nodeElements = allComponents.map(({ component, isMeta }) => ({
      group: 'nodes',
      data: {
        id: component._id,
        label: getNodeLabel(component),
        defaultColor: getDefaultColor(component),
        bg: isMeta ? META_COLOR : primaryBg,
        border: isMeta ? META_COLOR : borderColor,
        shape: isMeta ? 'ellipse' : 'roundrectangle',
        isMeta: isMeta ? 1 : 0,
      },
    }));

    const edgeElements = [];
    edgeMap.forEach((targets, sourceId) => {
      targets.forEach((targetId) => {
        edgeElements.push({
          group: 'edges',
          data: {
            id: `${sourceId}->${targetId}`,
            source: sourceId,
            target: targetId,
            color: borderColor,
          },
        });
      });
    });

    if (cyRef.current) cyRef.current.destroy();

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [...nodeElements, ...edgeElements],
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'background-color': 'data(bg)',
            'border-color': 'data(border)',
            'border-width': 1,
            color: 'data(defaultColor)',
            'font-size': 12,
            width: 'label',
            height: 'label',
            padding: 8,
            shape: 'data(shape)',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1,
            'line-color': 'data(color)',
            'target-arrow-color': 'data(color)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
      ],
      layout: {
        name: 'dagre',
        rankDir: 'TB',
        nodeSep: 40,
        rankSep: 60,
        padding: 40,
      },
    });

    const cy = cyRef.current;

    function resetHighlight() {
      cy.nodes().forEach((n) => {
        const isMeta = n.data('isMeta') === 1;
        n.style({
          'background-color': isMeta ? META_COLOR : primaryBg,
          'border-color': isMeta ? META_COLOR : borderColor,
          'border-width': 1,
          color: n.data('defaultColor'),
        });
      });
      cy.edges().forEach((e) => {
        e.style({ 'line-color': borderColor, 'target-arrow-color': borderColor });
        e.removeData('highlight');
      });
    }

    cy.on('tap', 'node', (evt) => {
      resetHighlight();

      const node = evt.target;
      const nodeId = node.id();

      node.style({
        'background-color': HIGHLIGHT_SELECTED,
        'border-color': HIGHLIGHT_SELECTED,
        'border-width': 2,
        color: '#ffffff',
      });

      // Abhängigkeiten des Knotens (outgoing) → rot
      const targets = edgeMap.get(nodeId) ?? [];
      targets.forEach((tid) => {
        cy.getElementById(tid).style({
          'background-color': HIGHLIGHT_PARENT,
          'border-color': HIGHLIGHT_PARENT,
          'border-width': 2,
          color: '#ffffff',
        });
        const edge = cy.getElementById(`${nodeId}->${tid}`);
        edge.style({ 'line-color': HIGHLIGHT_PARENT, 'target-arrow-color': HIGHLIGHT_PARENT });
        edge.data('highlight', 'parent');
      });

      // Knoten die von diesem abhängen (incoming) → grün
      const parents = reverseMap.get(nodeId) ?? [];
      parents.forEach((pid) => {
        cy.getElementById(pid).style({
          'background-color': HIGHLIGHT_CHILD,
          'border-color': HIGHLIGHT_CHILD,
          'border-width': 2,
          color: '#ffffff',
        });
        const edge = cy.getElementById(`${pid}->${nodeId}`);
        edge.style({ 'line-color': HIGHLIGHT_CHILD, 'target-arrow-color': HIGHLIGHT_CHILD });
        edge.data('highlight', 'child');
      });
    });

    // Klick auf hervorgehobene Kante: referenzierten Knoten in die Mitte scrollen
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      const hl = edge.data('highlight');
      if (!hl) return;
      // parent-Kante (rot): Zielknoten (Dependency) zentrieren
      // child-Kante (grün): Quellknoten (Abhängiger) zentrieren
      const nodeId = hl === 'parent' ? edge.data('target') : edge.data('source');
      const node = cy.getElementById(nodeId);
      const pos = node.renderedPosition();
      const center = { x: cy.width() / 2, y: cy.height() / 2 };
      const pan = cy.pan();
      cy.animate({
        pan: { x: pan.x + center.x - pos.x, y: pan.y + center.y - pos.y }
      }, { duration: 300 });
    });

    // Click on background resets highlight
    cy.on('tap', (evt) => {
      if (evt.target === cy) resetHighlight();
    });

    return () => {
      cyRef.current?.destroy();
      cyRef.current = null;
    };
  }, [show, key, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      sx={{
        display: show ? 'flex' : 'none',
        flexGrow: 1,
        minHeight: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
      <IconButton
        onClick={() => cyRef.current?.fit(undefined, 40)}
        sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'background.paper', boxShadow: 1 }}
        title="Fit graph"
      >
        <FitScreenIcon />
      </IconButton>
    </Box>
  );
}
