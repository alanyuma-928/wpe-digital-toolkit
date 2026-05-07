import BackToHome from "@/components/BackToHome";
import SolveBox from "@/components/solve/SolveBox";

const Solve = () => (
  <main className="min-h-screen bg-background text-foreground">
    <div className="mx-auto w-full max-w-[260px] px-4 py-6" data-se="260">
      <BackToHome />
      <h2 className="text-2xl font-bold mt-4 mb-4">Solve Box</h2>
      <SolveBox />
    </div>
  </main>
);

export default Solve;
