import React, { useEffect, useState, useRef } from "react";
import "./Editor.css";
import { EACCES } from "constants";

interface INode {
  left: number;
  top: number;
  id: number;
}

interface IEdge {
  a: INode;
  b: INode;
}

interface IDragged {
  node: INode;
  pointX: number;
  pointY: number;
}

enum Mode {
  nodeEdit = "nodeEdit",
  edgeEdit = "edgeEdit",
}

// https://developers.google.com/web/updates/2011/08/Saving-generated-files-on-the-client-side
function Editor() {
  const [nodes, setNodes] = useState<INode[]>([]);
  const [edges, setEdges] = useState<IEdge[]>([]);
  const [mode, setMode] = useState<Mode>(Mode.nodeEdit);
  const [dragged, setDragged] = useState<IDragged>();
  const ref = useRef(null);
  useEffect(() => {
    const newNodes = [
      { left: 40, top: 20, id: 0 },
      { left: 80, top: 20, id: 1 },
      { left: 120, top: 20, id: 2 },
    ];
    setNodes(newNodes);
    setEdges([
      {
        a: newNodes[0],
        b: newNodes[1],
      },
      {
        a: newNodes[2],
        b: newNodes[1],
      },
      {
        a: newNodes[0],
        b: newNodes[2],
      },
    ]);
  }, []);
  return (
    <div>
      <div
        className="editor_nodeArea"
        ref={ref}
        onMouseMove={(e) => {
          if (dragged && ref.current) {
            // @ts-ignore
            const editAreaRect = ref.current.getBoundingClientRect();
            const x = e.clientX - editAreaRect.left - dragged.pointX;
            const y = e.clientY - editAreaRect.top - dragged.pointY;
            const newNodes = [...nodes];
            const idx = newNodes.indexOf(dragged.node);
            newNodes[idx].left = x;
            newNodes[idx].top = y;
            setNodes(newNodes);
          }
        }}
      >
        {nodes.map((el) => {
          return (
            <div
              key={el.id}
              className="editor_node"
              onMouseDown={(e) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setDragged({
                  node: el,
                  pointX: e.clientX - rect.left,
                  pointY: e.clientY - rect.top,
                });
              }}
              onMouseUp={() => {
                setDragged(undefined);
              }}
              style={{ left: el.left, top: el.top }}
            >
              {el.id}
            </div>
          );
        })}
        {edges.map((el, key) => {
          const length = Math.sqrt(
            Math.pow(el.b.left - el.a.left, 2) +
              Math.pow(el.b.top - el.a.top, 2)
          );
          return (
            <div
              key={key}
              className="editor_edge"
              style={{
                width: `${length}px`,
                left: el.a.left + 15,
                top: el.a.top + 15,
                transform: `rotate(${Math.atan2((el.b.top - el.a.top), (el.b.left - el.a.left)) / Math.PI * 180}deg)`,
                transformOrigin: 'top left'
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
}

export default Editor;
