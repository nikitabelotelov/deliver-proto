import React, { useEffect, useState, useRef } from "react";
import "./Editor.css";
import Game from "./Game";

export interface INode {
  left: number;
  top: number;
  id: number;
  type?: NodeType;
}

export enum NodeType {
  default = "default",
  point = "point",
  start = "start",
}

export interface IEdge {
  a: number;
  b: number;
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
  changeNodeType = "change node types(default, point, start)"
}

// https://developers.google.com/web/updates/2011/08/Saving-generated-files-on-the-client-side
function Editor() {
  const [gameMode, setGameMode] = useState<boolean>(false);
  const [nodes, setNodes] = useState<INode[]>([]);
  const [edges, setEdges] = useState<IEdge[]>([]);
  const [mode, setMode] = useState<Mode>(Mode.move);
  const [dragged, setDragged] = useState<IDragged>();
  const [startNode, setStartNode] = useState<INode>();
  const [counter, setCounter] = useState<number>(0);
  const [loaderMessage, setLoaderMessage] = useState<string>("");
  const nodeAreaRef = useRef<HTMLDivElement>(null);
  const saveInputRef = useRef<HTMLInputElement>(null);
  const loadInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (loaderMessage) {
      setTimeout(() => {
        setLoaderMessage("");
      }, 2000);
    }
  }, [loaderMessage]);
  useEffect(() => {
    const newNodes = [
      { left: 40, top: 40, id: 0 },
      { left: 80, top: 80, id: 1 },
      { left: 120, top: 40, id: 2 },
    ];
    setNodes(newNodes);
    setCounter(newNodes.length);
    setEdges([
      {
        a: 0,
        b: 1,
      },
      {
        a: 2,
        b: 1,
      },
      {
        a: 0,
        b: 2,
      },
    ]);
  }, []);
  function removeNode(node: INode) {
    setNodes(nodes.filter((el) => el !== node));
    setEdges(
      edges.filter((el) => {
        return el.a !== node.id && el.b !== node.id;
      })
    );
  }
  return (
    <div className="root">
      <div className="top_control">
        <div onClick={(e) => { setGameMode((value) => !value) }}><input checked={gameMode} type="checkbox" /> Enable game mode</div>
        <div className="editor_loader">
          <input ref={loadInputRef} type="text" />
          <button
            onClick={() => {
              const node = loadInputRef.current;
              if (node) {
                const serialized = node.value;
                try {
                  const parsedData = JSON.parse(serialized);
                  setNodes(parsedData.nodes);
                  setEdges(parsedData.edges);
                  setLoaderMessage("Loaded successfully!");
                } catch (e) {
                  console.error(e);
                  setLoaderMessage("Parse error! Check console.");
                }
              }
            }}
          >
            load
            </button>
          <input ref={saveInputRef} type="text" />
          <button
            onClick={() => {
              const node = saveInputRef.current;
              if (node) {
                node.value = JSON.stringify({ nodes, edges });
                node.select();
                document.execCommand("copy");
                setLoaderMessage("Copied to clipboard!");
              }
            }}
          >
            save
            </button>
          {loaderMessage}
        </div>
      </div>
      {gameMode ? <Game nodes={nodes} edges={edges} /> : <div className="root_editor">
        <div className="editor_controlPanel">
          <div
            onClick={() => {
              setMode(Mode.move);
            }}
            className="editor_controlPanel_item"
          >
            move
          </div>
          <div
            onClick={() => {
              setMode(Mode.addNodes);
            }}
            className="editor_controlPanel_item"
          >
            +node
          </div>
          <div
            onClick={() => {
              setMode(Mode.removeNodes);
            }}
            className="editor_controlPanel_item"
          >
            -node
          </div>
          <div
            onClick={() => {
              setMode(Mode.addEdges);
            }}
            className="editor_controlPanel_item"
          >
            +edge
          </div>
          <div
            onClick={() => {
              setMode(Mode.removeEdges);
            }}
            className="editor_controlPanel_item"
          >
            -edge
          </div>
          <div
            onClick={() => {
              setMode(Mode.changeNodeType);
            }}
            className="editor_controlPanel_item"
          >
            type
          </div>
        </div>
        <div
          className="editor_nodeArea"
          ref={nodeAreaRef}
          onClick={(e) => {
            if (nodeAreaRef.current) {
              if (e.target === nodeAreaRef.current) {
                if (mode === Mode.addNodes) {
                  // @ts-ignore
                  const editAreaRect = nodeAreaRef.current.getBoundingClientRect();
                  setNodes([
                    ...nodes,
                    {
                      left: e.clientX - editAreaRect.left - 15,
                      top: e.clientY - editAreaRect.top - 15,
                      id: counter,
                    },
                  ]);
                  setCounter((counter) => counter + 1);
                }
              }
            }
          }}
          onMouseMove={(e) => {
            if (dragged && nodeAreaRef.current) {
              // @ts-ignore
              const editAreaRect = nodeAreaRef.current.getBoundingClientRect();
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
                title={el.type || NodeType.default}
                className={
                  "editor_node" + (startNode === el ? " editor_startNode" : "") + ' editor_nodeType-' + (el.type || NodeType.default)
                }
                onClick={() => {
                  if (mode === Mode.removeNodes) {
                    removeNode(el);
                  } else if (mode === Mode.addEdges) {
                    if (!startNode) {
                      setStartNode(el);
                    } else if (startNode) {
                      setEdges([...edges, { a: startNode.id, b: el.id }]);
                      setStartNode(undefined);
                    } else if (startNode === el) {
                      setStartNode(undefined);
                    }
                  } else if(mode === Mode.changeNodeType) {
                    if(!el.type || el.type === NodeType.default) {
                      el.type = NodeType.point
                    } else if(el.type === NodeType.point) {
                      el.type = NodeType.start
                    } else if(el.type === NodeType.start) {
                      el.type = NodeType.default
                    }
                    setNodes([...nodes])
                  }
                }}
                onMouseDown={(e) => {
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
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
            const a = nodes.find((node) => el.a === node.id);
            const b = nodes.find((node) => el.b === node.id);
            if (a && b) {
              const length = Math.sqrt(
                Math.pow(b.left - a.left, 2) + Math.pow(b.top - a.top, 2)
              );
              return (
                <div
                  key={key}
                  className={
                    "editor_edge" +
                    (mode === Mode.removeEdges ? " editor_edge-remove" : "")
                  }
                  onClick={() => {
                    if (mode === Mode.removeEdges) {
                      setEdges(edges.filter((edge) => el !== edge));
                    }
                  }}
                  style={{
                    width: `${length}px`,
                    left: a.left + 15,
                    top: a.top + 15,
                    transform: `rotate(${
                      (Math.atan2(b.top - a.top, b.left - a.left) / Math.PI) *
                      180
                      }deg)`,
                    transformOrigin: "top left",
                  }}
                ></div>
              );
            } else {
              return <></>;
            }
          })}
        </div>

      </div>}
    </div>
  );
}

export default Editor;
