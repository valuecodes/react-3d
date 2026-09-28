import { useGlobalOptions } from "../../../../../context/GlobalOptions";
import { ALGORITHMS } from "../../../../../context/options";
import type { Algorithm } from "../../../../../context/options";
import Header from "./header";
import Option from "./option";
import type { Menu } from "./option";

const ALGORITHM_MENU: Menu = {
  name: "Algorithm",
  kind: "setting",
  values: ALGORITHMS,
};
const SIMULATION_MENU: Menu = {
  name: "Simulation",
  kind: "command",
  values: ["Start", "Reset"],
};

const SUB_MENUS: Record<Algorithm, readonly Menu[]> = {
  "Maze Creator": [SIMULATION_MENU],
  Pathfinder: [
    {
      name: "Mode",
      kind: "setting",
      values: ["Rotate", "AddWalls", "Add Start", "Add Target"],
    },
    { name: "Obstacles", kind: "command", values: ["Set random", "Clear All"] },
    SIMULATION_MENU,
  ],
  "Maze Pathfinder": [
    {
      name: "Mode",
      kind: "setting",
      values: ["Rotate", "Add Start", "Add Target"],
    },
    SIMULATION_MENU,
  ],
};

export default function Options() {
  const { options } = useGlobalOptions();
  const subMenus = options.Algorithm ? SUB_MENUS[options.Algorithm] : [];

  return (
    <div className="options">
      <Header />
      <div className="controls">
        <Option menu={ALGORITHM_MENU} />
        {subMenus.map((menu) => (
          <Option key={menu.name} menu={menu} />
        ))}
      </div>
    </div>
  );
}
