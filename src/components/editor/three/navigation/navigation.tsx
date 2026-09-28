import NavigationBarButton from "./navigationBarButton";
import Options from "./options/options";

type Props = {
  sceneName: string;
  onPrevious: () => void;
  onNext: () => void;
};

export default function Navigation({ sceneName, onPrevious, onNext }: Props) {
  return (
    <div className="navigation">
      <div className="navigationBar">
        <NavigationBarButton label="Last" onClick={onPrevious} />
        <span className="navigationBarButton">{sceneName}</span>
        <NavigationBarButton label="Next" onClick={onNext} />
      </div>
      <Options />
    </div>
  );
}
