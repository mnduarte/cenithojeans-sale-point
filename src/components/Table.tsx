import { FaCheck } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { formatCurrency } from "../utils/formatUtils";

const Table = ({
  data,
  columns,
  itemSelected = false,
  setItemSelected = false,
}: any) => {
  return (
    <table className="w-full bg-[#252525] border border-[#2A2B2A] ">
      <thead>
        <tr className="border-b-2 border-[#1BA1E2]">
          {columns.map((column: any) => (
            <th
              key={column.title}
              className="text-left font-normal border border-[#333333] p-2 px-5"
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item: any) => (
          <tr
            key={item.id}
            className={
              itemSelected.id === item.id
                ? "bg-[#1b78e2]"
                : "hover:bg-[#1E1E1E]"
            }
            onClick={() => {
              setItemSelected && setItemSelected(item);
            }}
          >
            {columns.map((column: any, idx: number) => (
              <td
                className="text-right p-2 px-3 border border-[#292A28]"
                key={idx}
              >
                {typeof item[column.dataIndex] === "boolean" ? (
                  <div className="flex justify-end ">
                    {item[column.dataIndex] ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <MdClose className="text-red-500" />
                    )}
                  </div>
                ) : column.format ? (
                  Boolean(item[column.dataIndex]) ? column.format(item[column.dataIndex]) : "-"
                ) : (
                  Boolean(item[column.dataIndex]) ? item[column.dataIndex] : "-"
                )}
              </td>
            ))}
          </tr>
        ))}
        {columns.find(({ sumAcc }: any) => sumAcc) && (
          <tr>
            {columns.map((column: any, idx: number) => (
              <td
                className="text-right p-2 px-3 border border-[#292A28] font-bold bg-[#1E1E1E]"
                key={idx}
              >
                {idx === 0 && "TOTAL"}
                {column.sumAcc &&
                  `$${formatCurrency(
                    data.reduce(
                      (acc: any, current: any) =>
                        acc + current[column.dataIndex],
                      0
                    )
                  )}`}
              </td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Table;
