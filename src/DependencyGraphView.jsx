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
import InputBase from '@mui/material/InputBase';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import SearchIcon from '@mui/icons-material/Search';

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
  const applyHighlightRef = React.useRef(null);
  const resetHighlightRef = React.useRef(null);
  const [searchTerm, setSearchTerm] = React.useState('');
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

    function applyHighlight(nodeId) {
      resetHighlight();
      if (nodeId === null) return;
      cy.getElementById(nodeId).style({
        'background-color': HIGHLIGHT_SELECTED,
        'border-color': HIGHLIGHT_SELECTED,
        'border-width': 2,
        color: '#ffffff',
      });
      const visited = new Set([nodeId]);
      let frontier = [nodeId];
      let depth = 0;
      while (frontier.length > 0) {
        depth++;
        const color = depth === 1 ? HIGHLIGHT_PARENT : '#f9a19a';
        const next = [];
        frontier.forEach((fid) => {
          (edgeMap.get(fid) ?? []).forEach((tid) => {
            if (visited.has(tid)) return;
            visited.add(tid);
            next.push(tid);
            cy.getElementById(tid).style({ 'background-color': color, 'border-color': color, 'border-width': 2, color: '#ffffff' });
            const edge = cy.getElementById(`${fid}->${tid}`);
            edge.style({ 'line-color': color, 'target-arrow-color': color });
            edge.data('highlight', 'parent');
          });
        });
        frontier = next;
      }
      const visitedP = new Set([nodeId]);
      let frontierP = [nodeId];
      let depthP = 0;
      while (frontierP.length > 0) {
        depthP++;
        const color = depthP === 1 ? HIGHLIGHT_CHILD : '#a5d6a7';
        const next = [];
        frontierP.forEach((fid) => {
          (reverseMap.get(fid) ?? []).forEach((pid) => {
            if (visitedP.has(pid)) return;
            visitedP.add(pid);
            next.push(pid);
            cy.getElementById(pid).style({ 'background-color': color, 'border-color': color, 'border-width': 2, color: '#ffffff' });
            const edge = cy.getElementById(`${pid}->${fid}`);
            edge.style({ 'line-color': color, 'target-arrow-color': color });
            edge.data('highlight', 'child');
          });
        });
        frontierP = next;
      }
    }

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

    applyHighlightRef.current = applyHighlight;
    resetHighlightRef.current = resetHighlight;

    cy.on('tap', 'node', (evt) => {
      applyHighlight(evt.target.id());
    });

    // Klick auf hervorgehobene Kante: referenzierten Knoten in die Mitte scrollen
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      const hl = edge.data('highlight');
      if (!hl) return;
      const nodeId = hl === 'parent' ? edge.data('target') : edge.data('source');
      const node = cy.getElementById(nodeId);
      const pos = node.renderedPosition();
      const center = { x: cy.width() / 2, y: cy.height() / 2 };
      const pan = cy.pan();
      cy.animate({ pan: { x: pan.x + center.x - pos.x, y: pan.y + center.y - pos.y } }, { duration: 300 });
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
      <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5 }}>
        <IconButton
          onClick={() => cyRef.current?.fit(undefined, 40)}
          sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
          title="Fit graph"
        >
          <FitScreenIcon />
        </IconButton>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            const cy = cyRef.current;
            if (!cy || !searchTerm.trim()) return;
            const term = searchTerm.trim().toLowerCase();
            const node = cy.nodes().find((n) => n.data('label').toLowerCase().includes(term));
            if (!node) return;
            applyHighlightRef.current?.(node.id());
            const neighborhood = node.closedNeighborhood();
            cy.animate({ fit: { eles: neighborhood, padding: 80 } }, { duration: 300 });
          }}
          sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', boxShadow: 1, borderRadius: 1, px: 1 }}
        >
          <InputBase
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ fontSize: 14 }}
          />
          <IconButton type="submit" size="small">
            <SearchIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

    </Box>
  );
}
