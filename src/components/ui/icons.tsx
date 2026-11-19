import Svg, { Circle, Path } from 'react-native-svg';

/** Íconos de trazo del diseño (24×24). Decorativos: ocultos a lectores de pantalla. */

export type IconName =
  | 'home'
  | 'list'
  | 'plus'
  | 'activity'
  | 'chart'
  | 'user'
  | 'back'
  | 'close'
  | 'search'
  | 'trash'
  | 'walk'
  | 'dumbbell'
  | 'flame'
  | 'scale';

const PATHS: Record<IconName, React.ReactNode> = {
  home: <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  list: <Path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  activity: <Path d="M3 12h4l3-8 4 16 3-8h4" />,
  chart: <Path d="M3 20h18M6 16v-4M11 16V8M16 16v-6M21 16V5" />,
  user: (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  back: <Path d="M15 5l-7 7 7 7" />,
  close: <Path d="M6 6l12 12M18 6 6 18" />,
  search: (
    <>
      <Circle cx="11" cy="11" r="7" />
      <Path d="M20 20l-4-4" />
    </>
  ),
  trash: <Path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  walk: (
    <>
      <Circle cx="13" cy="4" r="2" />
      <Path d="M10 21l2-6-3-3 1-5 4 3h3M8 11l-3 2" />
    </>
  ),
  dumbbell: <Path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12" />,
  flame: <Path d="M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8z" />,
  scale: (
    <>
      <Path d="M4 7h16v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <Path d="M9 11a3 3 0 0 1 6 0" />
      <Path d="M12 11l1.5-1.5" />
    </>
  ),
};

export function Icon({
  name,
  size = 24,
  color,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden>
      {PATHS[name]}
    </Svg>
  );
}
