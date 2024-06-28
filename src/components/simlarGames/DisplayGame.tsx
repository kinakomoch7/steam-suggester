import { GameDetails } from "@/types/similarGames/GameDetails";
import Image from "next/image";
import Link from "next/link";

const DisplayGame = (props:GameDetails) => {

  const { name, image, url } = props;

  return (
    <Link className="flex flex-col box-border" href={`/details/${name}`}>
      <Image width={1000} height={0} src={image} alt={name} priority className="mx-auto h-auto w-4/6" />
      <p className="text-center my-2 text-white">{name}</p>
    </Link>
  )
}

export default DisplayGame
