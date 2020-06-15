import React, { useEffect, useState, useRef } from "react";
import "./Game.css";
import { INode, IEdge, NodeType } from "./Editor";

interface IProps {
  nodes: INode[],
  edges: IEdge[],
}

function Game(props: IProps) {
  const [path, setPath] = useState<INode[]>([])
  const [pathMode, setPathMode] = useState<boolean>(false)
  useEffect(() => {
    console.log("DD:", pathMode)
    if (!pathMode) {
      const id = window.setTimeout(() => {
        setPath([])
      }, 2000)
      return () => { window.clearTimeout(id) }
    }
    return () => { }
  }, [pathMode, path])
  return <div>
    <div className="game_field" onMouseLeave={() => {
      if (pathMode) {
        setPathMode(false)
        setPath([])
      }
    }}
      onMouseUp={() => {
        setPathMode(false)
      }}>
      {props.nodes.map((el) => {
        return (
          <div
            key={el.id}
            className={"game_node" + ' game_nodeType-' + (el.type || NodeType.default) + (~path.indexOf(el) ? " game_node-path" : '')}
            style={{ left: el.left, top: el.top }}
            onMouseDown={() => {
              if (!path.length) {
                setPath([el])
                setPathMode(true)
              }
            }}
            onMouseEnter={() => {
              if (pathMode) {
                if (path[path.length - 1] !== el) {
                  setPath([...path, el])
                }
              }
            }}
          >
            {el.type === NodeType.point || el.type === NodeType.start ? el.type : ''}
          </div>
        );
      })}
      {props.edges.map((el, key) => {
        const a = props.nodes.find((node) => el.a === node.id);
        const b = props.nodes.find((node) => el.b === node.id);
        if (a && b) {
          const length = Math.sqrt(
            Math.pow(b.left - a.left, 2) + Math.pow(b.top - a.top, 2)
          );
          return (
            <div
              key={key}
              className="game_edge"
              style={{
                width: `${length}px`,
                left: a.left + 30,
                top: a.top + 30,
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
  </div>
}

export default Game;
