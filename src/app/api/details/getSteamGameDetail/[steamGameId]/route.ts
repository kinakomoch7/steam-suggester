import { steamGameCategoryType } from "@/types/api/steamDataType";
import { MatchDataType } from "@/types/match/MatchDataType";
import { NextResponse } from "next/server";

type Params = {
  params: {
    steamGameId: string;
  };
};

export async function GET(req: Request, {params}: Params) {
  const steamGameId = params.steamGameId;


  const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamGameId}&cc=jp`);
  const responseJson = await response.json();
  const gameDetailData = responseJson[steamGameId].data

  const result:MatchDataType = {
    title: gameDetailData.name,
    genres: gameDetailData.genres,
    price: gameDetailData.price_overview ? gameDetailData.price_overview.final / 100 : 0,
    isSinglePlayer: gameDetailData.categories.some((category: steamGameCategoryType) => category.id === 2),
    isMultiPlayer: gameDetailData.categories.some((category: steamGameCategoryType) => category.id === 1),
    platforms: {
      windows: gameDetailData.platforms.windows,
      mac: gameDetailData.platforms.mac,
      linux: gameDetailData.platforms.linux
    }
  }

  return NextResponse.json(result);
}
