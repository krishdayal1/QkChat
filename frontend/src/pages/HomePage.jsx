import AiButton from "../components/AiButton";
import ResponsiveLayout from "../components/ResponsiveLayout";

const HomePage = () => {
  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="relative bg-base-100 rounded-2xl shadow-xl w-full max-w-6xl h-[calc(100vh-6rem)] overflow-hidden">
          <ResponsiveLayout />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
