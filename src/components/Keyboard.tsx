import { FiDelete } from "react-icons/fi";

const Keyboard = ({ onKeyPress }: any) => {
  const rows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M", <FiDelete className="ml-3 text-2xl"/>],
  ];

  return (
    <div className="w-[50vh] mt-4 grid grid-rows-4 grid-flow-col gap-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((key, keyIndex) => (
            <button
              key={keyIndex}
              className="flex-1 w-[3vh] h-10 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 bg-[#333333] mr-2"
              onClick={() => onKeyPress(key)}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
