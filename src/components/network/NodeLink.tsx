"use client";
import { useState, useEffect, useRef, ReactNode } from "react";
import * as d3 from 'd3';
import Icon from "./Icon";
import { LinkType, NodeType, StreamerListType } from "@/types/NetworkType";

type NodeLinkProps = {
  nodes: NodeType[],
  links: LinkType[],
  centerX: number,
  centerY: number,
  selectedIndex: number,
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>,
  streamerIds: StreamerListType[],
  isStreamerOpen: boolean
}

type ZoomableSVGProps = {
  children: ReactNode;
  centerX: number;
  centerY: number;
};

const ZoomableSVG: React.FC<ZoomableSVGProps> = (props) => {
  const { children, centerX, centerY } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  const zoom = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    zoom.current = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4]) 
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        setTransform(event.transform);
      });

    if (svgRef.current) {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
      svg.call(zoom.current);
    }
  }, []);

  useEffect(() => {
    if (svgRef.current && zoom.current) {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);

      const initialTransform = d3.zoomIdentity.translate(window.innerWidth / 2 - window.innerWidth / 5 - centerX, window.innerHeight / 2 - centerY).scale(1);
      svg.transition()
        .duration(1200)
        .call(zoom.current.transform, initialTransform)
        .on('end', () => {
          setTransform(initialTransform);
        });
    }
  }, [centerX, centerY]);

  return (
    <svg ref={svgRef} width="100%" height="100%">
      <g transform={`translate(${transform.x},${transform.y})scale(${transform.k})`}>
        {children}
      </g>
    </svg>
  );
};

const NodeLink = (props: NodeLinkProps) => {
  const { nodes, links, centerX, centerY, selectedIndex, setSelectedIndex, streamerIds = [], isStreamerOpen } = props;

  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);

  const findHoveredNode = (index: number) => {
    return nodes.find((node: NodeType) => node.index === index)
  }

  return (
    <ZoomableSVG centerX={centerX} centerY={centerY}>
       <>
          {links.length !== 0 &&
            links.map((link: LinkType, i: number) => {
              const isHovered = link.source === hoveredIndex || link.target === hoveredIndex;
              const isSelected = link.source === selectedIndex || link.target === selectedIndex;
              return (
                <line
                  key={i}
                  className="link"
                  x1={nodes[link.source].x}
                  y1={nodes[link.source].y}
                  x2={nodes[link.target].x}
                  y2={nodes[link.target].y}
                  style={{
                    stroke: (isHovered || isSelected) ? "cyan" : "white",
                    strokeWidth: (isHovered || isSelected) ? "2" : "1"
                  }}
                />
              )
            })
          }
          {nodes.length !== 0 &&
              nodes.map((node: NodeType, i: number) => {
                const streamerColors = streamerIds
                  .filter((game: StreamerListType) =>
                    game.videoId.some((id) => id === node.twitchGameId)
                  )
                  .map((game: { color: string }) => game.color); // 配信者の色をすべて取得

                // それぞれの色を等間隔で分けるための角度計算
                const angleStep = streamerColors.length > 0 ? 360 / streamerColors.length : 0;

                return(
                  <g className={`brightness-${hoveredIndex === node.index ? "125" : "100"}`}
                    transform={`translate(${node.x},${node.y})`}
                    onMouseEnter={() => setHoveredIndex(node.index ?? -1)}
                    onMouseLeave={() => setHoveredIndex(-1)}
                    onClick={() => setSelectedIndex(node.index)}
                    key={i}>
                    <Icon
                      title={node.title}
                      imgURL={node.imgURL}
                      index={node.index ?? i}
                      steamGameId={node.steamGameId}
                      twitchGameId={node.twitchGameId}
                      circleScale={node.circleScale ?? 1}
                      suggestValue={node.suggestValue}
                    />
                  {/* 色付きセグメントを描画 配信者による強調 */}
                  {isStreamerOpen && streamerColors.length > 0 &&
                      streamerColors.map((color: string, index: number) => {
                        const angleStart = -90 + angleStep * index; // -90は真上
                        const angleEnd = angleStart + angleStep;

                        return (
                          <g transform={`scale(${node.circleScale})`} key={index}>
                            <circle
                              key={index}
                              cx="0"
                              cy="0"
                              r="17" // 半径
                              stroke={color}
                              strokeWidth="5"
                              fill="transparent"
                              strokeDasharray={`${angleStep} ${360 - angleStep}`}
                              strokeDashoffset={-angleStart}
                            />
                          </g>
                        );
                      })}
                  </g>
                );
              })}

            {hoveredIndex !== -1 && findHoveredNode(hoveredIndex) && (
              <g transform={`translate(${findHoveredNode(hoveredIndex)?.x},${findHoveredNode(hoveredIndex)?.y})`}>
                <g>
                  <text
                    x={0}
                    y={80}
                    textAnchor="middle"
                    fill="white"
                    fontSize="30px"
                    pointerEvents="none"
                    style={{
                      textShadow: `
                        -1px -1px 0 #000,
                        1px -1px 0 #000,
                        -1px 1px 0 #000,
                        1px 1px 0 #000,
                        -1px 0 0 #000,
                        1px 0 0 #000,
                        0 -1px 0 #000,
                        0 1px 0 #000
                      `
                    }}
                  >
                    {findHoveredNode(hoveredIndex)?.title}
                  </text>
                </g>
              </g>
            )}

            {selectedIndex !== -1 && findHoveredNode(selectedIndex) && (
              <g transform={`translate(${findHoveredNode(selectedIndex)?.x},${findHoveredNode(selectedIndex)?.y})`}>
                <g>
                  <text
                    x={0}
                    y={80}
                    textAnchor="middle"
                    fill="white"
                    fontSize="30px"
                    pointerEvents="none"
                    style={{
                      textShadow: `
                        -1px -1px 0 #000,
                        1px -1px 0 #000,
                        -1px 1px 0 #000,
                        1px 1px 0 #000,
                        -1px 0 0 #000,
                        1px 0 0 #000,
                        0 -1px 0 #000,
                        0 1px 0 #000
                      `
                    }}
                  >
                    {findHoveredNode(selectedIndex)?.title}
                  </text>
                </g>
              </g>
            )}
          </>
    </ZoomableSVG>
  );
};

export default NodeLink;
