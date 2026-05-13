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
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import cytoscape from 'cytoscape';
import GlobalStateContext from './GlobalStateContext';

function getNodeLabel(component) {
  if (component.version) {
    return `${component.name}\n(${component.version})`;
  }
  return component.name ?? '(unnamed)';
}

function bomKey(bom) {
  const components = (bom?._flattenedComponents ?? []).map((c) =>
    `${c._id}|${c.name}|${c.version}|${c._dependencies ?? ''}|${c._color ?? ''}`
  );
  const meta = bom?.metadata?.component;
  const metaStr = meta ? `${meta._id}|${meta.name}|${meta.version}|${meta._dependencies ?? ''}` : '';
  return metaStr + '::' + components.join(';');
}

export default function DependencyGraphView({ show, bom }) {
  const containerRef = React.useRef(null);
  const cyRef = React.useRef(null);
  const theme = useTheme();
  const globalState = React.useContext(GlobalStateContext);
  const config = globalState.getObj('config');
  const key = bomKey(bom);

  function getColor(component) {
    try {
      const color = config['componentColorFunc']?.(component);
      return color ?? theme.palette.text.primary;
    } catch {
      return theme.palette.text.primary;
    }
  }

  React.useEffect(() => {
    if (!show || !containerRef.current) return;

    const primaryBg = theme.palette.background.paper;
    const borderColor = theme.palette.divider;
    const edgeColor = theme.palette.divider;

    // --- Build data structures ---

    // Collect all components: metadata.component + flattened components
    const allComponents = [];
    if (bom?.metadata?.component?.name) {
      allComponents.push({ component: bom.metadata.component, isMeta: true });
    }
    (bom?._flattenedComponents ?? []).forEach((c) => {
      allComponents.push({ component: c, isMeta: false });
    });

    // Build a map: nodeId -> list of target nodeIds (from _dependencies)
    const edgeMap = new Map(); // source _id -> [target _id, ...]
    allComponents.forEach(({ component }) => {
      if (!component._dependencies || component._dependencies === '') return;
      const targets = component._dependencies.split(',').filter(Boolean);
      if (targets.length > 0) {
        edgeMap.set(component._id, targets);
      }
    });

    // Determine which node IDs appear as targets
    const targetIds = new Set();
    edgeMap.forEach((targets) => targets.forEach((t) => targetIds.add(t)));

    // Root nodes: nodes that are not a target of any edge
    const rootIds = new Set(
      allComponents
        .map(({ component }) => component._id)
        .filter((id) => !targetIds.has(id))
    );
    // Fallback: if all nodes are targets (circular deps), treat all as roots
    if (rootIds.size === 0) {
      allComponents.forEach(({ component }) => rootIds.add(component._id));
    }

    // --- Build cytoscape elements (only root nodes initially) ---

    const nodeElements = allComponents.map(({ component, isMeta }) => ({
      group: 'nodes',
      data: {
        id: component._id,
        label: getNodeLabel(component),
        color: getColor(component),
        bg: primaryBg,
        border: borderColor,
        shape: isMeta ? 'ellipse' : 'roundrectangle',
        expandable: edgeMap.has(component._id) ? 1 : 0,
      },
      style: {
        display: rootIds.has(component._id) ? 'element' : 'none',
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
          },
          style: { display: 'none' },
        });
      });
    });

    // --- Initialize cytoscape ---

    if (cyRef.current) {
      cyRef.current.destroy();
    }

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
            color: 'data(color)',
            'font-size': 12,
            width: 'label',
            height: 'label',
            padding: 8,
            shape: 'data(shape)',
          },
        },
        {
          selector: 'node[expandable = 1]',
          style: {
            'border-width': 2,
            'border-style': 'dashed',
            'border-color': theme.palette.primary.main,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1,
            'line-color': edgeColor,
            'target-arrow-color': edgeColor,
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
      ],
      layout: { name: 'preset' },
    });

    const cy = cyRef.current;

    // Run initial layout on root nodes
    cy.nodes(':visible').layout({
      name: 'breadthfirst',
      directed: true,
      padding: 20,
      spacingFactor: 1.2,
    }).run();

    // Build reverse map: targetId -> [sourceId, ...] for collapse traversal
    const reverseMap = new Map();
    edgeMap.forEach((targets, sourceId) => {
      targets.forEach((tid) => {
        if (!reverseMap.has(tid)) reverseMap.set(tid, []);
        reverseMap.get(tid).push(sourceId);
      });
    });

    // Recursively hide a node and its descendants if they have no other visible incoming edge
    function collapseNode(sourceId) {
      const targets = edgeMap.get(sourceId);
      if (!targets) return;
      targets.forEach((tid) => {
        // Hide the edge from source to this target
        cy.getElementById(`${sourceId}->${tid}`).style('display', 'none');
        // Only hide the target node if no other visible incoming edge exists
        const hasOtherVisibleParent = (reverseMap.get(tid) ?? []).some(
          (pid) => pid !== sourceId &&
            cy.getElementById(`${pid}->${tid}`).style('display') !== 'none'
        );
        if (!hasOtherVisibleParent) {
          cy.getElementById(tid).style('display', 'none');
          collapseNode(tid);
        }
      });
      // Mark source as expandable again
      cy.getElementById(sourceId).data('expandable', 1);
    }

    // On click: expand hidden children, or collapse visible children
    cy.on('tap', 'node', (evt) => {
      const sourceId = evt.target.id();
      const targets = edgeMap.get(sourceId);
      if (!targets) return;

      const hiddenTargets = targets.filter(
        (tid) => cy.getElementById(tid).style('display') === 'none'
      );

      if (hiddenTargets.length > 0) {
        // --- Expand ---
        // Show hidden target nodes
        hiddenTargets.forEach((tid) => {
          cy.getElementById(tid).style('display', 'element');
        });
        // Show edges to now-visible targets
        targets.forEach((tid) => {
          cy.getElementById(`${sourceId}->${tid}`).style('display', 'element');
        });
        // If all children are now visible, mark node as no longer expandable
        const allVisible = targets.every(
          (tid) => cy.getElementById(tid).style('display') !== 'none'
        );
        if (allVisible) {
          evt.target.data('expandable', 0);
        }
        // Position newly revealed children in a circle around the parent node
        const parentPos = evt.target.position();
        const radius = 150 + hiddenTargets.length * 20;
        hiddenTargets.forEach((tid, i) => {
          const angle = (2 * Math.PI * i) / hiddenTargets.length;
          cy.getElementById(tid).position({
            x: parentPos.x + radius * Math.cos(angle),
            y: parentPos.y + radius * Math.sin(angle),
          });
        });
      } else {
        // --- Collapse ---
        collapseNode(sourceId);
      }
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
      }}
    >
      <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
    </Box>
  );
}
