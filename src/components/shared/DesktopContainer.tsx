export const DesktopContainer: React.FC<{
  children: React.ReactNode;
  side: React.ReactNode;
  bottom: React.ReactNode;
}> = ({ children, side, bottom }) => {
  return (
    <div className="grid h-screen w-screen grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-0">
      <div className="relative col-start-1 col-end-2 row-start-1 row-end-2 w-[275px]">
        {side}
      </div>
      <div className="col-start-2 col-end-3 row-start-1 row-end-2 overflow-x-hidden">
        {children}
      </div>
      <div className="col-start-1 col-end-3 row-start-2 row-end-3">
        {bottom}
      </div>
    </div>
  );
};
