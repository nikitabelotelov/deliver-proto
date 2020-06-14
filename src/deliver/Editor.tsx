import React, { useEffect, useState, useRef } from "react";
import "./Editor.css";
import { EACCES } from "constants";
import { start } from "repl";

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
  move = "move",
  addNodes = "adding nodes",
  addEdges = "adding edges",
  removeNodes = "remove nodes",
  removeEdges = "remove edges",
}

// https://developers.google.com/web/updates/2011/08/Saving-generated-files-on-the-client-side
function Editor() {
  const [nodes, setNodes] = useState<INode[]>([]);
  const [edges, setEdges] = useState<IEdge[]>([]);
  const [mode, setMode] = useState<Mode>(Mode.move);
  const [dragged, setDragged] = useState<IDragged>();
  const [startNode, setStartNode] = useState<INode>()
  const ref = useRef(null);
  useEffect(() => {
    const newNodes = [
      { left: 40, top: 40, id: 0 },
      { left: 80, top: 80, id: 1 },
      { left: 120, top: 40, id: 2 },
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
  function removeNode(node: INode) {
    setNodes(nodes.filter(el => el !== node))
    setEdges(edges.filter((el) => {
      return el.a !== node && el.b !== node
    }))
  }
  return (
    <div className="root">
      <div className="editor_controlPanel">
        <div onClick={() => {
          setMode(Mode.move)
        }} className="editor_controlPanel_item">move</div>
        <div onClick={() => {
          setMode(Mode.addNodes)
        }} className="editor_controlPanel_item">+node</div>
        <div onClick={() => {
          setMode(Mode.removeNodes)
        }} className="editor_controlPanel_item">-node</div>
        <div onClick={() => {
          setMode(Mode.addEdges)
        }} className="editor_controlPanel_item">+edge</div>
        <div onClick={() => {
          setMode(Mode.removeEdges)
        }} className="editor_controlPanel_item">-edge</div>
      </div>
      <div
        className="editor_nodeArea"
        ref={ref}
        onClick={(e) => {
          if (ref.current) {
            if (e.target === ref.current) {
              if (mode === Mode.addNodes) {
                // @ts-ignore
                const editAreaRect = ref.current.getBoundingClientRect();
                setNodes([...nodes, {
                  left: e.clientX - editAreaRect.left - 15,
                  top: e.clientY - editAreaRect.top - 15,
                  id: nodes.length
                }])
              }
            }
          }
        }}
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
        <div className="editor_mode">Mode: {mode}</div>
        {nodes.map((el) => {
          return (
            <div
              key={el.id}
              className={"editor_node" + (startNode === el ? " editor_startNode" : "")}
              onClick={() => {
                if (mode === Mode.removeNodes) {
                  removeNode(el)
                } else if (mode === Mode.addEdges) {
                  if (!startNode) {
                    setStartNode(el)
                  } else if (startNode) {
                    setEdges([...edges, { a: startNode, b: el }])
                    setStartNode(undefined)
                  } else if (startNode === el) {
                    setStartNode(undefined)
                  }
                }
              }}
              onMouseDown={(e) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect()
                if (mode !== Mode.addEdges && mode !== Mode.removeNodes) {
                  setDragged({
                    node: el,
                    pointX: e.clientX - rect.left,
                    pointY: e.clientY - rect.top,
                  });
                }
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
              className={"editor_edge" + (mode === Mode.removeEdges ? " editor_edge-remove" : '')} 
              onClick={() => {
                if(mode === Mode.removeEdges) {
                  setEdges(edges.filter(edge => el !== edge))
                }
              }}
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
