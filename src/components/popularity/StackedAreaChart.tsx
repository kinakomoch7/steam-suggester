
import { AreaStack } from '@visx/shape';
import { SeriesPoint } from '@visx/shape/lib/types';
import { scaleTime, scaleLinear, scaleOrdinal } from '@visx/scale';
import { CountSteamReviews } from '@/types/Popularity/CountSteamReviews';
import CalcXDomain from './utils/CalcXDomain';
import { StackedAreasProps } from '@/types/Popularity/StackedAreaProps';
import { BG_COLOR_STACKED_AREA } from '@/constants/styles/stackedArea';
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis';

const getX = (d: CountSteamReviews) => d.date;
const getY0 = (d: SeriesPoint<CountSteamReviews>) => d[0] / 100;
const getY1 = (d: SeriesPoint<CountSteamReviews>) => d[1] / 100;



const StackedAreaChart =({
  data,
  width,
  height,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  events = false,
}: StackedAreasProps) => {
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  const keys = Object.keys(data[0]).filter((k) => k !== 'date');

  const colorScale = scaleOrdinal<string, string>({
    domain: keys,
    range: ['#ffc409', '#f14702', '#262d97', 'white', '#036ecd', '#9ecadd', '#51666e'],
  });

  const xScale = scaleTime<number>({
    range: [0, xMax],
    domain: CalcXDomain(data),
  });
  const yScale = scaleLinear<number>({
    range: [yMax, 0],
  });

  return width < 10 ? null : (
    <svg width={width+ 100} height={height + 100}>
      {/* <GradientOrangeRed id="stacked-area-orangered" /> */}
      <rect x={0} y={0} width={width} height={height} fill={BG_COLOR_STACKED_AREA} rx={14} />
      <AxisBottom scale={xScale} label='時間(h)' top={yMax}/>
      <AxisRight scale={yScale} label='人数' left={xMax}/>
      <AreaStack
        top={margin.top}
        left={margin.left}
        keys={keys}
        data={data}
        x={(d) => xScale(getX(d.data)) ?? 0}
        y0={(d) => yScale(getY0(d)) ?? 0}
        y1={(d) => yScale(getY1(d)) ?? 0}
      >
        {({ stacks, path }) =>
          stacks.map((stack) => {
            const color = colorScale(stack.key);
            return (
            <path
              key={`stack-${stack.key}`}
              d={path(stack) || ''}
              stroke="transparent"
              fill={color}
            />);
          })
        }
      </AreaStack>
    </svg>
  );
}

export default StackedAreaChart
