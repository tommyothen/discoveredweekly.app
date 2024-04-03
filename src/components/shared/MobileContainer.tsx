export const MobileContainer: React.FC<{
  children: React.ReactNode;
  side: React.ReactNode;
  bottom: React.ReactNode;
}> = () => {
  return (
    <div className="relative">
      <div className="grid h-screen w-screen place-items-center text-center text-white">
        <div>
          <h1 className="font-circular-title text-3xl">
            Sorry! Mobile support coming soon!
          </h1>
          <p className="text-2xl">
            {/* Breaking Heart emoji */}
            &#128148;
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 pb-4 pl-4 text-white">
        <p className="text-lg">Please visit on a desktop for now.</p>
      </div>
    </div>
  );
};
