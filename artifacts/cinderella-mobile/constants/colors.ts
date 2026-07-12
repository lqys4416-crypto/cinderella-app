// Cinderella Team — Brand colors: luxury black + gold
// HSL source from web artifact index.css
// Always dark — both light and dark themes use the same palette

const palette = {
  background: '#0D0D0D',       // hsl(0 0% 5%)
  foreground: '#F2F2F2',       // hsl(0 0% 95%)
  card: '#141414',             // hsl(0 0% 8%)
  cardForeground: '#F2F2F2',
  primary: '#E8A830',          // hsl(43 80% 55%) — gold
  primaryForeground: '#0D0D0D',
  secondary: '#262626',        // hsl(0 0% 15%)
  secondaryForeground: '#F2F2F2',
  muted: '#1F1F1F',            // hsl(0 0% 12%)
  mutedForeground: '#999999',  // hsl(0 0% 60%)
  accent: '#C48820',           // hsl(43 70% 45%) — darker gold
  accentForeground: '#0D0D0D',
  destructive: '#D93030',      // hsl(0 70% 50%)
  destructiveForeground: '#F2F2F2',
  border: '#2D2516',           // solid version of border with gold hue
  input: '#1F1F1F',
  text: '#F2F2F2',
  tint: '#E8A830',
  // Semantic chart colors
  chartGold: '#E8A830',
  chartBlue: '#3B82F6',
  chartGreen: '#10B981',
  chartRed: '#EF4444',
  chartPurple: '#8B5CF6',
};

const colors = {
  light: palette,
  dark: palette,
  radius: 12,
};

export default colors;
