import React from "react";
import "./styles.scss";
import { AccordionGroup, AccordionItem } from "@/shared/ui/accordion-swift";

import { useEffect, useState } from "react";

import {
  computed,
  Computed,
  effect,
  Effect,
  ReadonlySignal,
  signal,
  Signal,
  SIGNAL_SYMBOL,
} from "@/lib/core/public/signals";

interface SignalNodeProps {
  node: any;
  type: "signal" | "computed" | "effect";
  depth?: number;
}

const SignalNode = ({ node, type, depth = 0 }: SignalNodeProps) => {
  const [expanded, setExpanded] = useState(false);
  const flags = node._flags
    ? [
        ...(node._flags & 1 ? ["RUNNING"] : []),
        ...(node._flags & 2 ? ["NOTIFIED"] : []),
        ...(node._flags & 4 ? ["OUTDATED"] : []),
        ...(node._flags & 8 ? ["DISPOSED"] : []),
        ...(node._flags & 16 ? ["HAS_ERROR"] : []),
        ...(node._flags & 32 ? ["TRACKING"] : []),
      ].join(" | ")
    : "";

  return (
    <div className="signal-node" style={{ marginLeft: depth * 20 }}>
      <div className="node-header" onClick={() => setExpanded(!expanded)}>
        <div className="node-type">{type.toUpperCase()}</div>
        <div className="toggle">{expanded ? "▼" : "▶"}</div>
      </div>

      {expanded && (
        <div className="node-properties">
          <div className="property">
            <strong>Value:</strong> {JSON.stringify(node._value)}
          </div>
          <div className="property">
            <strong>Version:</strong> {node._version}
          </div>
          {flags && (
            <div className="property">
              <strong>Flags:</strong> {flags}
            </div>
          )}

          {node._targets && (
            <div className="dependencies">
              <h4>Targets</h4>
              <div className="linked-list">
                {getLinkedNodes(node._targets, "target", depth + 1)}
              </div>
            </div>
          )}

          {node._sources && (
            <div className="dependencies">
              <h4>Sources</h4>
              <div className="linked-list">
                {getLinkedNodes(node._sources, "source", depth + 1)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const getLinkedNodes = (
  startNode: any,
  direction: "source" | "target",
  depth: number,
) => {
  const nodes = [];
  let currentNode = startNode;
  let hasItems = false;

  while (currentNode) {
    const targetNode =
      currentNode[direction === "source" ? "_source" : "_target"];
    if (targetNode) {
      hasItems = true;
      nodes.push(
        <React.Fragment key={targetNode._version}>
          <div className="connection-arrow">→</div>
          <SignalNode
            node={targetNode}
            type={getNodeType(targetNode)}
            depth={depth}
          />
        </React.Fragment>,
      );
    }
    currentNode = currentNode[`_next${direction}`];
  }

  return hasItems ? nodes : null;
};

const getNodeType = (node: any): "signal" | "computed" | "effect" => {
  if (node?.brand === SIGNAL_SYMBOL) return "signal";
  if (node instanceof Computed) return "computed";
  if (node instanceof Effect) return "effect";
  return "signal";
};

interface SignalVisualizerProps {
  signal: Signal | ReadonlySignal | Effect;
}

export const SignalVisualizer = ({ signal }: SignalVisualizerProps) => {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const forceUpdate = () => setUpdateTrigger((prev) => prev + 1);
    const unsubscribe = signal.subscribe(forceUpdate);
    return () => unsubscribe();
  }, [signal]);

  return (
    <div className="signal-visualizer">
      <div className="controls">
        <button onClick={() => setUpdateTrigger((prev) => prev + 1)}>
          Force Update
        </button>
      </div>

      <div className="nodes-container">
        <SignalNode node={signal} type={getNodeType(signal)} />
      </div>
    </div>
  );
};

const TestPage: React.FC = () => {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);

  effect(() => {
    console.log("Count:", count.value);
  });

  return (
    <div className="overflow-auto h-screen">
      <button onClick={() => count.value++}>Increment: {count.value}</button>

      <SignalVisualizer signal={count} />
      <SignalVisualizer signal={doubled} />
    </div>
  );
};

export default TestPage;
