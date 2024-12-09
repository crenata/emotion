import toast from "react-hot-toast";

const ErrorCallContract = (error) => {
    if (error.message.toString().includes("Internal JSON-RPC error.")) {
        try {
            let json = JSON.parse(error.message.toString().replace("Internal JSON-RPC error.\n", ""));
            toast.error(json.data.reason);
        } catch (e) {
            toast.error(error.message);
        }
    } else {
        toast.error(error.message);
    }
};

export default ErrorCallContract;