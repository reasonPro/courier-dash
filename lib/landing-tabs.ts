export type LandingTabNavigationKey = "ArrowLeft" | "ArrowRight" | "Home" | "End";

export function getNextLandingTabIndex(currentIndex: number, key: LandingTabNavigationKey, tabCount: number) {
  if (tabCount <= 0) return 0;
  if (key === "Home") return 0;
  if (key === "End") return tabCount - 1;
  if (key === "ArrowRight") return (currentIndex + 1) % tabCount;
  return (currentIndex - 1 + tabCount) % tabCount;
}
