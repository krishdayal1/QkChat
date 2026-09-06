import ResponsiveLayout from "../components/ResponsiveLayout";

const HomePage = () => {
  return (
    <div className="h-[100dvh] bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4 h-full">
        <div className="relative bg-base-100 rounded-2xl shadow-xl w-full max-w-6xl h-[calc(100dvh-5rem)] overflow-hidden">
          <ResponsiveLayout />
        </div>
      </div>
    </div>
  );
};

export default HomePage;