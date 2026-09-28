type Props = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

export default function OptionButton({ label, selected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      style={{ backgroundColor: selected ? "green" : "gray" }}
    >
      {label}
    </button>
  );
}
