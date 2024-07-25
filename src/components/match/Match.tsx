import MatchIndicator from "./MatchIndicator";
import Headline from "../common/Headline";
import { DetailsPropsType } from "@/types/DetailsType";
import { SteamDetailsDataType } from "@/types/api/getSteamDetailType";
import { ISR_FETCH_INTERVAL } from "@/constants/DetailsConstants";

const Match = async(props:DetailsPropsType) => {

  const { steamGameId } = props;


  const res = await fetch(
    `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getSteamGameDetail/${steamGameId}`,
    {next: { revalidate:ISR_FETCH_INTERVAL }}
  );
  const data:SteamDetailsDataType = await res.json();

  return (
    <div>
      <Headline txt='フィルター項目との一致度'/>
      <MatchIndicator data={data} />
    </div>
  )
}

export default Match
