/* Network.tsx */
"use client";
import { useEffect, useState, useRef } from "react";
import NodeLink from "./NodeLink";
import SelectParameter from "./selectParameter/SelectParameter";
import { DEFAULT_FILTER, DEFAULT_SLIDER } from "@/constants/DEFAULT_FILTER";
import { Filter, SliderSettings } from "@/types/api/FilterType";
import StreamedList from "./streamedList/StreamedList";
import createNetwork from "@/hooks/createNetwork";
import Loading from "@/app/desktop/loading";
import {
  LinkType,
  NodeType,
  SteamListType,
  StreamerListType,
} from "@/types/NetworkType";
import { getFilterData, getGameIdData, getSliderData } from "@/hooks/indexedDB";
import Sidebar from "./Sidebar";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import Panel from "./Panel";
import SteamList from "./steamList/SteamList";
import HelpTooltip from "./HelpTooltip";
import Tour from "./Tour";
import ProgressBar from "./ProgressBar";
import SimilaritySettings from "./SimilaritySettings/SimilaritySettings";
import TuneIcon from "@mui/icons-material/Tune";
import Leaderboard from "./Leaderboard";
import GameSearchPanel from "./gameDetail/GameSearchPanel";
import useTour from "@/hooks/useTour";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import UserAvatar from "./steamList/UserAvatar";
import { HomeHeader } from "../common/Headers";

type Props = {
  steamAllData: SteamDetailsDataType[];
  steamListData: SteamListType[];
};

const Network = (props: Props) => {
  const { steamAllData, steamListData } = props;

  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);
  const [slider, setSlider] = useState<SliderSettings>(DEFAULT_SLIDER);

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [isNetworkLoading, setIsNetworkLoading] = useState(true);

  const [streamerIds, setStreamerIds] = useState<StreamerListType[]>([]);

  // openPanelを他のパネルのみに使用
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  // GameSearchPanel専用の状態
  const [isGameSearchOpen, setIsGameSearchOpen] = useState<boolean>(false);

  const { tourRun, setTourRun } = useTour();

  const [progress, setProgress] = useState(0);

  // Refを使用して副作用の実行を制御
  const hasFetchedInitialData = useRef(false);

  const initialNodes = async (
    filter: Filter,
    gameIds: string[],
    slider: SliderSettings
  ) => {
    setProgress(0);
    const result = await createNetwork(
      steamAllData,
      filter,
      gameIds,
      slider,
      setProgress
    );
    const nodes = result?.nodes ?? [];
    const links = result?.links ?? [];
    const buffNodes = nodes.concat();
    buffNodes.sort(
      (node1: NodeType, node2: NodeType) =>
        (node2.circleScale ?? 0) - (node1.circleScale ?? 0)
    );
    if (buffNodes.length > 0) {
      setCenterX((buffNodes[0]?.x ?? 0) - 150);
      setCenterY((buffNodes[0]?.y ?? 0) + 100);
      setSelectedIndex(-1);
    }
    setNodes(nodes);
    setLinks(links);
    setProgress(100);
    hasFetchedInitialData.current = false;
  };

  useEffect(() => {
    if (isNetworkLoading && !hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true; // フラグを立てる
      (async () => {
        const filterData = (await getFilterData()) ?? DEFAULT_FILTER;
        const gameIds = (await getGameIdData()) ?? [];
        const sliderData = (await getSliderData()) ?? DEFAULT_SLIDER;
        setFilter(filterData);
        setSlider(sliderData);
        await initialNodes(filterData, gameIds, sliderData);
        setIsNetworkLoading(false);
      })();
    }
  }, [isNetworkLoading]);

  // 選択されたノードが変更されたときに中心座標を更新
  useEffect(() => {
    if (selectedIndex !== -1 && nodes[selectedIndex]) {
      setCenterX((nodes[selectedIndex].x ?? 0) - 150);
      setCenterY((nodes[selectedIndex].y ?? 0) + 100);
      // ノードが選択されたら GameSearchPanel を開く
      setIsGameSearchOpen(true);
    }
  }, [selectedIndex]);

  const togglePanel = (panelName: string) => {
    setOpenPanel((prevPanel) => (prevPanel === panelName ? null : panelName));
    setTourRun(false);
  };

  const toggleTourRun = () => {
    setTourRun((prev) => {
      const newState = !prev;
      if (newState) {
        setOpenPanel(null);
        setIsGameSearchOpen(false); // ツアー開始時に GameSearchPanel も閉じる
      }
      return newState;
    });
  };

  if (isNetworkLoading) {
    return <Loading />;
  }

  // GameSearchPanelを独立して管理する関数
  const handleGameSearchClick = () => {
    setIsGameSearchOpen((prev) => !prev);
    setTourRun(false);
  };

  const handleGameSearchClose = () => {
    setIsGameSearchOpen(false);
  };

  return (
    <div className="flex flex-1 overflow-hidden text-white relative">
      {/* Sidebar */}
      <Sidebar
        openPanel={openPanel}
        togglePanel={togglePanel}
        tourRun={tourRun}
        toggleTourRun={toggleTourRun}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden z-10">
        <HomeHeader />
        {!isNetworkLoading ? (
          <div className="absolute inset-0">
            <div className="absolute top-0 right-4 z-10">
              {/* ユーザーアイコン */}
              <UserAvatar />
            </div>
            <NodeLink
              nodes={nodes}
              links={links}
              centerX={centerX}
              centerY={centerY}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              streamerIds={streamerIds}
              openPanel={openPanel}
            />
          </div>
        ) : (
          <ProgressBar progress={progress} />
        )}

        {/* GameSearchPanel */}
        {isGameSearchOpen && (
          <div className="w-1/4 z-20 absolute top-0 right-0">
            <GameSearchPanel
              nodes={nodes}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              setIsNetworkLoading={setIsNetworkLoading}
              steamListData={steamListData}
              steamAllData={steamAllData}
            />
          </div>
        )}

        {/* フィルターパネル */}
        {openPanel === "filter" && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <SelectParameter
              filter={filter}
              setFilter={setFilter}
              setIsNetworkLoading={setIsNetworkLoading}
            />
          </div>
        )}

        {/* StreamerListパネル */}
        {openPanel === "streamer" && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-transparent overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <Panel
              title={
                <div className="flex items-center">
                  <span>配信者</span>
                  <HelpTooltip title="配信者を追加すると配信者が配信したゲームのアイコンに枠が表示されます。また、アイコンをクリックすると配信者のページに飛べます" />
                </div>
              }
              icon={<LiveTvIcon className="mr-2 text-white" />}
            >
              <StreamedList
                nodes={nodes}
                streamerIds={streamerIds}
                setStreamerIds={setStreamerIds}
              />
            </Panel>
          </div>
        )}

        {/* 類似度 */}
        {openPanel === "similarity" && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-transparent overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <Panel
              title={
                <div className="flex items-center">
                  <span>類似度設定</span>
                  <HelpTooltip title="ゲーム間の類似度計算における重みを調整できます。" />
                </div>
              }
              icon={<TuneIcon className="mr-2 text-white" />}
            >
              <SimilaritySettings
                slider={slider}
                setSlider={setSlider}
                setIsNetworkLoading={setIsNetworkLoading}
              />
            </Panel>
          </div>
        )}

        {/* Steam連携パネル */}
        {openPanel === "steamList" && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <SteamList
              steamAllData={steamAllData}
              nodes={nodes}
              setSelectedIndex={setSelectedIndex}
            />
          </div>
        )}

        {/* ランキングパネル */}
        {openPanel === "ranking" && (
          <div className="absolute top-0 left-0 w-1/5 h-full bg-gray-900 overflow-y-auto overflow-x-hidden shadow-lg z-10 transition-transform duration-300">
            <Leaderboard nodes={nodes} setSelectedIndex={setSelectedIndex} />
          </div>
        )}

        {/* Tourコンポーネント */}
        <Tour run={tourRun} setRun={setTourRun} />
      </div>
    </div>
  );
};

export default Network;
