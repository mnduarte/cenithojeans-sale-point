import { FaCheck } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { formatCurrency } from "../utils/formatUtils";
import { useTheme } from "../contexts/ThemeContext";

const Table = ({
  data,
  columns,
  itemSelected = false,
  setItemSelected = false,
  enableSelectItem = false,
  itemsIdSelected = false,
  setItemsIdSelected = false,
  showZero = false,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  return (
    <table className={`w-full ${themeStyles[theme].tailwindcss.table.main}`}>
      <thead>
        <tr className="border-b-2 border-[#1BA1E2]">
          {enableSelectItem && (
            <th
              className={`p-2 px-5 ${themeStyles[theme].tailwindcss.table.thead.th}`}
            ></th>
          )}
          {columns.map((column: any) => (
            <th
              key={column.title}
              className={`text-left font-normal p-2 px-5 ${themeStyles[theme].tailwindcss.table.thead.th}`}
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item: any, index: number) => (
          <tr
            key={item.id}
            className={
              itemSelected.id === item.id
                ? themeStyles[theme].tailwindcss.table.par
                : index % 2 === 0
                ? themeStyles[theme].tailwindcss.table.impar
                : themeStyles[theme].tailwindcss.table.hover
            }
            onClick={() => {
              setItemSelected && setItemSelected(item);
            }}
          >
            {enableSelectItem && (
              <td
                className={`p-2 pl-2 ${themeStyles[theme].tailwindcss.table.tbody.td}`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(
                    itemsIdSelected.find((i: any) => i.id === item.id)
                  )}
                  onChange={(e) => {
                    setItemsIdSelected((items: any) => {
                      if (e.target.checked) {
                        return [...items, { id: item.id }];
                      }

                      return items.filter((i: any) => i.id !== item.id);
                    });
                  }}
                  className={`form-checkbox h-4 w-4 border border-gray-300 ${
                    Boolean(
                      !itemsIdSelected.find((i: any) => i.id === item.id)
                    ) && themeStyles[theme].tailwindcss.table.checkbox
                  } rounded p-2`}
                />
              </td>
            )}

            {columns.map((column: any, idx: number) => (
              <td
                className={`text-right p-2 px-3 ${themeStyles[theme].tailwindcss.table.tbody.td}`}
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
                  Boolean(item[column.dataIndex]) ? (
                    column.format(item[column.dataIndex])
                  ) : (
                    "-"
                  )
                ) : Boolean(item[column.dataIndex]) ||
                  (item[column.dataIndex] === 0 && showZero) ? (
                  item[column.dataIndex]
                ) : (
                  "-"
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
