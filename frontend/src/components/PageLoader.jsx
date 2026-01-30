import { LoaderIcon } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <LoaderIcon className="animate-spin size-16 text-green-500" />
    </div>
  );
};
export default PageLoader;