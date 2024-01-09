const Spinner = ({ size = "sm" }: any) => {
  const customSize = size === "sm" ? "h-5 w-5" : "h-16 w-16";
  return (
    <div
      className={`animate-spin rounded-full border-t-4 border-[#ffffff] border-opacity-80 ${customSize}`}
    ></div>
  );
};

export default Spinner;
