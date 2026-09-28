import { useGlobalOptions } from "../../../../../context/GlobalOptions";
import type { OptionsStore } from "../../../../../context/GlobalOptions";
import type {
  CommandKey,
  Commands,
  SettingKey,
  Settings,
} from "../../../../../context/options";
import OptionButton from "./optionButton";
import OptionHeader from "./optionHeader";

/** A row of buttons that either sets a persistent option or fires a momentary command. */
export type Menu =
  | {
      [K in SettingKey]: {
        name: K;
        kind: "setting";
        values: readonly NonNullable<Settings[K]>[];
      };
    }[SettingKey]
  | {
      [K in CommandKey]: {
        name: K;
        kind: "command";
        values: readonly NonNullable<Commands[K]>["value"][];
      };
    }[CommandKey];

type Button = { label: string; onSelect: () => void };

export default function Option({ menu }: { menu: Menu }) {
  const store = useGlobalOptions();
  const selected = menu.kind === "setting" ? store.options[menu.name] : null;

  return (
    <div className="option">
      <OptionHeader name={menu.name} />
      {buttonsFor(menu, store).map((button) => (
        <OptionButton
          key={button.label}
          label={button.label}
          selected={button.label === selected}
          onSelect={button.onSelect}
        />
      ))}
    </div>
  );
}

// One case per key so the (key, value) pair stays correlated for TypeScript.
function buttonsFor(
  menu: Menu,
  { setOption, sendCommand }: OptionsStore
): Button[] {
  switch (menu.name) {
    case "Algorithm":
      return menu.values.map((value) => ({
        label: value,
        onSelect: () => setOption({ key: "Algorithm", value }),
      }));
    case "Mode":
      return menu.values.map((value) => ({
        label: value,
        onSelect: () => setOption({ key: "Mode", value }),
      }));
    case "Position":
      return menu.values.map((value) => ({
        label: value,
        onSelect: () => setOption({ key: "Position", value }),
      }));
    case "Obstacles":
      return menu.values.map((value) => ({
        label: value,
        onSelect: () => sendCommand({ key: "Obstacles", value }),
      }));
    case "Simulation":
      return menu.values.map((value) => ({
        label: value,
        onSelect: () => sendCommand({ key: "Simulation", value }),
      }));
  }
}
