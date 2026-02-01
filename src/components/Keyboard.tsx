import { FiDelete } from "react-icons/fi";
import { MdOutlineSpaceBar } from "react-icons/md";

const Keyboard = ({ onKeyPress }: any) => {
  const rows = [
    [
      { value: "1" },
      { value: "2" },
      { value: "3" },
      { value: "4" },
      { value: "5" },
      { value: "6" },
      { value: "7" },
      { value: "8" },
      { value: "9" },
      { value: "0" },
    ],
    [
      { value: "Q" },
      { value: "W" },
      { value: "E" },
      { value: "R" },
      { value: "T" },
      { value: "Y" },
      { value: "U" },
      { value: "I" },
      { value: "O" },
      { value: "P" },
    ],
    [
      { value: "A" },
      { value: "S" },
      { value: "D" },
      { value: "F" },
      { value: "G" },
      { value: "H" },
      { value: "J" },
      { value: "K" },
      { value: "L" },
    ],
    [
      { value: "Z" },
      { value: "X" },
      { value: "C" },
      { value: "V" },
      { value: "B" },
      { value: "N" },
      { value: "M" },
      { value: <FiDelete className="ml-2" />, action: "deleteLast" },
      { value: <MdOutlineSpaceBar className="ml-2" />, action: "addSpace" },
    ],
  ];

  return (
    <div className="w-[50vh] mt-4 grid grid-rows-4 grid-flow-col gap-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((key, keyIndex) => (
            <button
              key={keyIndex}
              className="flex-1 w-[3vh] h-10 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 mr-2"
              onClick={() => onKeyPress(key)}
            >
              {key.value}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
