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
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FitScreenIcon from '@mui/icons-material/FitScreen';
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
  const focusStackRef = React.useRef([]);
  const [canGoBack, setCanGoBack] = React.useState(false);
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

    // Build a map: nodeId -> [targetNodeId, ...]
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

    // Determine root nodes: not a target of any edge
    const targetIds = new Set();
    edgeMap.forEach((targets) => targets.forEach((t) => targetIds.add(t)));
    const rootIds = new Set(
      allComponents.map(({ component }) => component._id).filter((id) => !targetIds.has(id))
    );
    if (rootIds.size === 0) {
      allComponents.forEach(({ component }) => rootIds.add(component._id));
    }

    // --- Build cytoscape elements ---

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
      style: { display: rootIds.has(component._id) ? 'element' : 'none' },
    }));

    const edgeElements = [];
    edgeMap.forEach((targets, sourceId) => {
      targets.forEach((targetId) => {
        edgeElements.push({
          group: 'edges',
          data: { id: `${sourceId}->${targetId}`, source: sourceId, target: targetId },
          style: { display: 'none' },
        });
      });
    });

    // --- Initialize cytoscape ---

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

    // --- Helper functions ---

    // Recursively hide descendants that have no other visible incoming edge
    function collapseNode(sourceId) {
      const targets = edgeMap.get(sourceId);
      if (!targets) return;
      targets.forEach((tid) => {
        cy.getElementById(`${sourceId}->${tid}`).style('display', 'none');
        const hasOtherVisibleParent = (reverseMap.get(tid) ?? []).some(
          (pid) => pid !== sourceId &&
            cy.getElementById(`${pid}->${tid}`).style('display') !== 'none'
        );
        if (!hasOtherVisibleParent) {
          cy.getElementById(tid).style('display', 'none');
          collapseNode(tid);
        }
      });
      cy.getElementById(sourceId).data('expandable', 1);
    }

    // Snapshot current visibility state (set of visible element IDs)
    function snapshotVisibility() {
      const visible = new Set();
      cy.elements().forEach((el) => {
        if (el.style('display') !== 'none') visible.add(el.id());
      });
      return visible;
    }

    // Restore a visibility snapshot and recalculate expandable flags
    function restoreVisibility(snapshot) {
      cy.elements().forEach((el) => {
        el.style('display', snapshot.has(el.id()) ? 'element' : 'none');
      });
      cy.nodes().forEach((node) => {
        const targets = edgeMap.get(node.id());
        if (!targets) return;
        const anyHidden = targets.some(
          (tid) => cy.getElementById(tid).style('display') === 'none'
        );
        node.data('expandable', anyHidden ? 1 : 0);
      });
    }

    // Reset stack on graph rebuild and expose pop via ref for the back button
    const focusStack = focusStackRef.current;
    focusStack.length = 0;
    setCanGoBack(false);
    focusStackRef.popSnapshot = () => {
      if (focusStack.length === 0) return;
      restoreVisibility(focusStack.pop());
      setCanGoBack(focusStack.length > 0);
    };

    // --- Event handlers ---

    cy.on('tap', 'node', (evt) => {
      const sourceId = evt.target.id();
      const targets = edgeMap.get(sourceId);
      if (!targets) return;

      const hiddenTargets = targets.filter(
        (tid) => cy.getElementById(tid).style('display') === 'none'
      );

      if (hiddenTargets.length > 0) {
        // Expand: show hidden children
        hiddenTargets.forEach((tid) => {
          cy.getElementById(tid).style('display', 'element');
        });
        targets.forEach((tid) => {
          cy.getElementById(`${sourceId}->${tid}`).style('display', 'element');
        });
        const allVisible = targets.every(
          (tid) => cy.getElementById(tid).style('display') !== 'none'
        );
        if (allVisible) evt.target.data('expandable', 0);
        // Position new children in a circle around the parent
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
        // Collapse: hide all children recursively
        collapseNode(sourceId);
      }
    });

    // Right-click on node: focus on it and its visible descendants
    cy.on('cxttap', 'node', (evt) => {
      focusStack.push(snapshotVisibility());
      setCanGoBack(true);

      const focusId = evt.target.id();
      const keepVisible = new Set([focusId]);
      function collectVisible(nodeId) {
        (edgeMap.get(nodeId) ?? []).forEach((tid) => {
          if (cy.getElementById(tid).style('display') !== 'none') {
            keepVisible.add(tid);
            keepVisible.add(`${nodeId}->${tid}`);
            collectVisible(tid);
          }
        });
      }
      collectVisible(focusId);
      cy.elements().forEach((el) => {
        el.style('display', keepVisible.has(el.id()) ? 'element' : 'none');
      });
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
      {canGoBack && (
        <IconButton
          onClick={() => focusStackRef.popSnapshot?.()}
          sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'background.paper', boxShadow: 1 }}
          title="Go back"
        >
          <ArrowBackIcon />
        </IconButton>
      )}
      <IconButton
        onClick={() => cyRef.current?.fit(cyRef.current.nodes(':visible'), 40)}
        sx={{ position: 'absolute', top: 8, left: canGoBack ? 56 : 8, bgcolor: 'background.paper', boxShadow: 1 }}
        title="Fit graph"
      >
        <FitScreenIcon />
      </IconButton>
    </Box>
  );
}
