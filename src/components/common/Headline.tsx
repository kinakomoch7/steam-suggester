type Props = {
  txt: string;
};

const Headline = (props: Props) => {

  const { txt } = props;

  return <div className="p-3 text-lg mb-2 text-white">{txt}</div>;
};

export default Headline;