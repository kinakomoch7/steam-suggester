"use client";
import { useState } from 'react';
import NodeLink from "./NodeLink";
import SelectParameter from './SelectParameter';

const Network = () => {
  const [filter, setFilter] = useState({
    Categories: {
      1: true,
      2: true,
      3: true,
      4: true,
      9: true,
      18: true,
      23: true,
      25: true,
      28: true,
      29: true,
      37: true,
      50: true,
      51: true,
      52: true,
      53: true,
      54: true,
      55: true,
      56: true,
      57: true,
      58: true,
      59: true,
      60: true,
      70: true,
      71: true,
      72: true,
      73: true,
      74: true,
      81: true,
      84: true,
    },
    Price: {
      startPrice: 0,
      endPrice: 10000
    },
    Mode: {
      isSinglePlayer: true,
      isMultiPlayer: true
    },
    Device: {
      windows: true,
      mac: true
    },
    Playtime: {
      1: true,
      2: true,
      3: true,
      4: true,
      5: true,
      6: true,
      7: true,
      8: true,
      9: true,
      10: true,
    },
  });

  return (
    <div className="flex h-[92dvh] overflow-hidden">
      <div className="w-1/4 bg-[#1b2838] overflow-y-auto overflow-x-hidden">
        <SelectParameter filter={filter} setFilter={setFilter} />
      </div>
      <div className="w-3/4 bg-[#2a475e] flex flex-col overflow-y-hidden overflow-x-hidden">
        <NodeLink filter={filter} />
      </div>
    </div>
  );
}

export default Network;
