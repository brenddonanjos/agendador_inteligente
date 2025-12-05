import { Alert } from "antd";
import "./style.css";

interface WarningCardProps {
  message: string;
}

function WarningCard(props: WarningCardProps) {
  return (
    <>
      <Alert
        className="warning-card"
        description={props.message}
        type="warning"
        showIcon
      />
    </>
  );
}

export default WarningCard;
