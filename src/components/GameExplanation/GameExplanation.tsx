/* GameExplanation.tsx */
'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import LanguageIcon from '@mui/icons-material/Language';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import Tooltip from '@mui/material/Tooltip';
import AppleIcon from '@mui/icons-material/Apple';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";
import { getFilterData } from '@/hooks/indexedDB';
import CircularProgress from '@mui/material/CircularProgress';

type Props = {
  steamGameId: string;
  twitchGameId: string;
};

type LocalFilterType = {
  Genres: { [key: string]: boolean };
  Price: {
    startPrice: number;
    endPrice: number;
  };
  Mode: {
    isSinglePlayer: boolean;
    isMultiPlayer: boolean;
  };
  Device: {
    windows: boolean;
    mac: boolean;
  };
  Playtime: { [key: string]: boolean };
};

const GameExplanation: React.FC<Props> = ({ steamGameId, twitchGameId }) => {
  const [node, setNode] = useState<SteamDetailsDataType | null>(null);
  const [localFilter, setLocalFilter] = useState<LocalFilterType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [overallMatch, setOverallMatch] = useState<number | null>(null);
  const [genreMatch, setGenreMatch] = useState<number | null>(null);
  const [priceMatch, setPriceMatch] = useState<number | null>(null);

  useEffect(() => {
    // Fetch game data
    const fetchGameData = async () => {
      try {
        const res = await fetch(
          `/api/details/getSteamGameDetail/${steamGameId}`,
          { next: { revalidate: ISR_FETCH_INTERVAL } }
        );
        if (!res.ok) {
          throw new Error("ゲームデータの取得に失敗しました。");
        }
        const data: SteamDetailsDataType = await res.json();
        setNode(data);
      } catch (err) {
        console.error(err);
        setError("ゲームデータの取得中にエラーが発生しました。");
      }
    };

    // Fetch local filter data
    const fetchLocalFilter = async () => {
      try {
        const filterData = await getFilterData();
        if (filterData) {
          setLocalFilter(filterData);
        } else {
          setError("フィルターデータが見つかりませんでした。");
        }
      } catch (err) {
        console.error(err);
        setError("フィルターデータの取得中にエラーが発生しました。");
      }
    };

    fetchGameData();
    fetchLocalFilter();
  }, [steamGameId]);

  useEffect(() => {
    if (node && localFilter) {
      // Calculate Genre Match
      const preferredGenres = Object.keys(localFilter.Genres).filter(
        (genre) => localFilter.Genres[genre]
      );
      const matchingGenres = node.genres.filter((genre) =>
        preferredGenres.includes(genre)
      );
      const genreScore =
        preferredGenres.length === 0
          ? 100
          : Math.min(
              (matchingGenres.length / preferredGenres.length) * 100,
              100
            );
      setGenreMatch(Math.round(genreScore));

      // Calculate Price Match
      const salePrice = typeof node.salePrice === 'string' ? parseFloat(node.salePrice) : node.salePrice;
      const price = typeof node.price === 'string' ? parseFloat(node.price) : node.price;
      const gamePrice = salePrice || price;

      if (isNaN(gamePrice)) {
        setPriceMatch(0);
      } else {
        const { startPrice, endPrice } = localFilter.Price;
        let priceScore = 0;
        if (gamePrice >= startPrice && gamePrice <= endPrice) {
          priceScore = 100;
        } else {
          // Calculate how far the price is from the preferred range
          const distance =
            gamePrice < startPrice
              ? startPrice - gamePrice
              : gamePrice - endPrice;
          // Assuming a maximum distance where the score becomes 0
          const maxDistance = Math.max(startPrice, endPrice, 1); // Avoid division by zero
          priceScore = Math.max(100 - (distance / maxDistance) * 100, 0);
        }
        setPriceMatch(Math.round(priceScore));
      }

      // Calculate Overall Match as average of genre and price
      const overall =
        (genreScore + (priceMatch !== null ? priceMatch : 0)) / 2;
      setOverallMatch(Math.round(overall));
    }
  }, [node, localFilter]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!node || !localFilter || overallMatch === null) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="container w-full mx-auto p-4 max-w-3xl">
      <div className="rounded-lg overflow-hidden border border-gray-400 bg-gray-800 p-4">
        {/* ゲーム画像 */}
        <Image
          src={node.imgURL}
          alt={`${node.title} Header`}
          width={1000}
          height={500}
          className="w-full h-auto rounded"
        />

        {/* ゲームタイトル */}
        <h2 className="text-2xl font-bold text-white mt-4">{node.title}</h2>

        {/* Short Details */}
        <div className="flex items-start mt-2">
          <InfoIcon className="mt-1 mr-2 text-white" />
          <div className="max-h-20 overflow-y-auto p-1 short-details-scrollbar">
            <p className="text-sm text-gray-300">{node.shortDetails}</p>
          </div>
        </div>

        {/* Genres */}
        {node.genres && node.genres.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto h-8 mt-2 genres-scrollbar">
            <StarIcon className="flex-shrink-0 text-yellow-500" />
            <div className="flex space-x-2 items-center">
              {node.genres.map((genre, index) => (
                <span
                  key={index}
                  className="bg-blue-500 text-xs text-white px-2 py-1 rounded flex-shrink-0 flex items-center"
                >
                  {genre}
                  {genreMatch !== null && (
                    <span className="ml-1 text-yellow-300 text-xs">
                      {genreMatch}%
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* タグ */}
        {node.tags && node.tags.length > 0 && (
          <div className="text-white mt-2">
            <strong>タグ:</strong>
            <div className="flex items-center space-x-0.5 overflow-x-auto mt-1 h-8 tags-scrollbar">
              {node.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-green-500 text-xs text-white px-2 py-1 rounded whitespace-nowrap flex-shrink-0"
                  title={tag} // ツールチップとしてタグ名を表示
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* デバイスサポート */}
        <div className="flex items-center space-x-2 mt-2">
          {node.device.windows && (
            <Tooltip title="Windows対応">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                className="text-white h-5 w-5"
                fill="currentColor"
              >
                <path d="M0 0h224v224H0zM224 0h224v224H224zM0 224h224v288H0zM224 224h224v288H224z" />
              </svg>
            </Tooltip>
          )}
          {node.device.mac && (
            <Tooltip title="Mac対応">
              <AppleIcon className="text-white h-5 w-5" />
            </Tooltip>
          )}
        </div>

        {/* マルチプレイヤー情報 */}
        <div className="flex items-center space-x-2 mt-2">
          {node.isSinglePlayer && (
            <Tooltip title="Single Player">
              <PersonIcon className="text-white h-5 w-5" />
            </Tooltip>
          )}
          {node.isMultiPlayer && (
            <Tooltip title="Multiplayer">
              <GroupIcon className="text-white h-5 w-5" />
            </Tooltip>
          )}
        </div>

        {/* Developer & Release Date */}
        <div className="flex items-center mt-2">
          <DeveloperModeIcon className="mr-2 text-white" />
          <span className="text-sm text-gray-300">{node.developerName}</span>
        </div>
        <div className="flex items-center mt-1">
          <LanguageIcon className="mr-2 text-white" />
          <span className="text-sm text-gray-300">{node.releaseDate} 発売</span>
        </div>

        {/* 価格 */}
        <div className="flex items-center mt-2">
          <StarIcon className="mr-2 text-yellow-500" />
          <span className="text-sm text-gray-300"><strong>価格:</strong></span>
          {node.salePrice ? (
            <>
              <span className="line-through text-gray-400 ml-2">¥{node.price}</span>
              <span className="text-red-500 ml-2">¥{node.salePrice}</span>
            </>
          ) : (
            <span className="text-sm ml-2 text-gray-300">
              {node.price > 0 ? `¥${node.price}` : "無料"}
            </span>
          )}
          {priceMatch !== null && (
            <span className="ml-2 text-yellow-300 text-xs">
              {priceMatch}%
            </span>
          )}
        </div>

        {/* Play Time */}
        <div className="flex items-center mt-2">
          <StarIcon className="mr-2 text-yellow-500" />
          <span className="text-sm text-gray-300">プレイ時間: {node.playTime} 時間</span>
        </div>

        {/* Reviews */}
        {node.review && (
          <div className="space-y-1 mt-2">
            <span className="text-sm font-semibold text-gray-300">レビュー:</span>
            <div className="flex flex-wrap">
              {Object.entries(node.review).map(([key, value]) => (
                <div key={key} className="flex items-center mr-2 mb-1">
                  <StarIcon className="text-yellow-400 mr-1" />
                  <span className="text-xs text-gray-300">{key}: {Math.round(value * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Match Score */}
        <div className="mt-6 p-4 bg-gray-700 rounded">
          <h3 className="text-xl font-semibold text-white">全体の一致度: {overallMatch}%</h3>
          <div className="mt-2">
            <div className="flex items-center">
              <span className="text-sm text-gray-300">ジャンルの一致度:</span>
              <span className="ml-2 text-yellow-300 text-sm">{genreMatch}%</span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-300">価格の一致度:</span>
              <span className="ml-2 text-yellow-300 text-sm">{priceMatch}%</span>
            </div>
            {/* 必要に応じて他の一致基準も追加 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameExplanation;
