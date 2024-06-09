import Headline from "../common/Headline"
import StackedAreaChart from "./StackedAreaChart"

const Popularity = async() => {

  const response = await fetch(`http://localhost:3000/api/popularity/countSteamReviews/1172470`);
  const data = await response.json();

  return (
    <div>
      <Headline txt="流行度" />
      {data ? (
        <StackedAreaChart data={data} width={350} height={200}  />
      ) : null}
      
    </div>
  )
}

export default Popularity
