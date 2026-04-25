import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BackToHome = () => {
  return (
    <Link
      to="/"
      aria-label="Back to WPE Digital Tool Kit home dashboard"
      className="inline-flex items-center gap-2 min-h-[44px] px-3 -ml-3 text-sm font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      <span>Home</span>
    </Link>
  );
};

export default BackToHome;
