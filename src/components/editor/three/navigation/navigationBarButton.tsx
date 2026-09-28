type Props = {
  label: string;
  onClick: () => void;
};

export default function NavigationBarButton({ label, onClick }: Props) {
  return (
    <button className="navigationBarButton" onClick={onClick}>
      {label}
    </button>
  );
}
