import IsEmpty from "../IsEmpty";
import toast from "react-hot-toast";

const ErrorNotDeployed = (contract, error) => {
    if (IsEmpty(contract)) toast.error("Not connected to blockchain.");
    else toast.error(`${contract.contractName} contract is not deployed to this network.`);
};

export default ErrorNotDeployed;