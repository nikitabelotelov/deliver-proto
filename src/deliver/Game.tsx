import React, { useEffect, useState, useRef } from "react";
import "./Game.css";
import { INode, IEdge, NodeType } from "./Editor";

interface IProps {
  nodes: INode[];
  edges: IEdge[];
  goal: number;
}

interface IMessage {
  message: string;
  style: string;
}

function checkSuccess(path: INode[], allNodes: INode[], goal: number) {
  const points = allNodes.filter((el) => el.type === NodeType.point);
  const success = points.reduce((res, el) => {
    if (~path.indexOf(el)) {
      return res && true;
    } else {
      return false;
    }
  }, true);
  return success && goal >= path.length;
}

function Game(props: IProps) {
  const [path, setPath] = useState<INode[]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [pathMode, setPathMode] = useState<boolean>(false);
  const [message, setMessage] = useState<IMessage>({
    message: "CLICK ON START",
    style: "default",
  });
  useEffect(() => {
    if (!pathMode && gameStarted) {
      if (checkSuccess(path, props.nodes, props.goal)) {
        setMessage({
          style: "success",
          message: "SUCCESS",
        });
      } else {
        setMessage({
          style: "fail",
          message: "CAN DO BETTER",
        });
      }
      const id = window.setTimeout(() => {
        setPath([]);
        setGameStarted(false);
        setMessage({
          message: "CLICK ON START",
          style: "default",
        });
      }, 2000);
      return () => {
        window.clearTimeout(id);
      };
    }
    return () => {};
  }, [pathMode, path, gameStarted]);
  return (
    <div className="game_root">
      <div
        className="game_field"
        onMouseLeave={() => {
          if (pathMode) {
            setPathMode(false);
          }
        }}
        onMouseUp={() => {
          setPathMode(false);
        }}
      >
        {props.nodes.map((el) => {
          return (
            <div
              key={el.id}
              className={
                "game_node" +
                " game_nodeType-" +
                (el.type || NodeType.default) +
                (~path.indexOf(el) ? " game_node-path" : "")
              }
              style={{ left: el.left, top: el.top }}
              onMouseDown={() => {
                if (!path.length && el.type === NodeType.start) {
                  setPath([el]);
                  setPathMode(true);
                  setGameStarted(true);
                }
              }}
              onMouseEnter={() => {
                if (pathMode) {
                  const lastNode = path[path.length - 1];
                  const canVisit = !!props.edges.find((edge) => {
                    return (
                      (edge.a === el.id && edge.b === lastNode.id) ||
                      (edge.b === el.id && edge.a === lastNode.id)
                    );
                  });
                  if (canVisit && path[path.length - 1] !== el) {
                    setPath([...path, el]);
                  }
                }
              }}
            >
              {el.type === NodeType.point || el.type === NodeType.start
                ? el.type
                : ""}
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
                    (Math.atan2(b.top - a.top, b.left - a.left) / Math.PI) * 180
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
      <div
        className={
          "game_messageBox " + "game_messageBox_message-" + message.style
        }
      >
        {message.message}
      </div>
    </div>
  );
}

export default Game;
