import { FC } from "react";
import { useSettingsStore } from "../../application/stores";

export const BottomBar: FC = () => {
  const { activeEnvironment } = useSettingsStore();
  return (
    <div className="bottom-bar">
      <div className="status-dot" />
      <div className="status-row">
        <span className="status-text">ONLINE</span>
      </div>
      <span className="env-status">
        ◇ {activeEnvironment ? activeEnvironment : "NO ENVIRONMENT"}
      </span>
      <span className="version">VORTEX v1.0</span>
    </div>
  );
};
