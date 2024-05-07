import React from "react";
import { TbFlag2Filled } from "react-icons/tb";
import { MdAssignmentAdd } from "react-icons/md";
import { FaLocationArrow } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import { formatCurrency } from "../utils/formatUtils";

const TableSaleByDay = ({
  data,
  columns,
  editableRow,
  handleRowClick = () => {},
  handleRowDoubleClick = () => {},
  table = "0-",
  enableSelectItem,
  rowsSelected,
  handleItemsSelected,
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  return (
    <table
      className={`w-full ${themeStyles[theme].tailwindcss.table.main} text-xs`}
    >
      <thead>
        <tr className="border-b-2 border-[#1BA1E2]">
          {enableSelectItem && (
            <th
              className={`${themeStyles[theme].tailwindcss.table.thead.th} `}
            ></th>
          )}
          {columns.map((column: any, columnIndex: any) => (
            <th
              key={columnIndex}
              className={`text-center font-normal  ${themeStyles[theme].tailwindcss.table.thead.th}`}
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any, rowIndex: any) => (
          <React.Fragment key={rowIndex}>
            <tr
              className={` ${
                rowIndex % 2 === 0 &&
                editableRow !== table + rowIndex &&
                themeStyles[theme].tailwindcss.table.impar
              } ${
                editableRow === table + rowIndex
                  ? themeStyles[theme].tailwindcss.table.par
                  : themeStyles[theme].tailwindcss.table.hover
              } ${row.withBackground && "text-red-400"}`}
            >
              {enableSelectItem && (
                <td
                  className={`pt-1 ${themeStyles[theme].tailwindcss.table.tbody.td}`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(
                      rowsSelected.find((i: any) => i.id === row.id)
                    )}
                    onChange={(e) => handleItemsSelected(row, e.target.checked)}
                    className={`form-checkbox h-4 w-4 border border-gray-300  rounded p-2`}
                  />
                </td>
              )}
              {columns.map((column: any, columnIndex: any) => (
                <td
                  key={columnIndex}
                  className={`${themeStyles[theme].tailwindcss.table.tbody.td}`}
                  onClick={(e) => handleRowClick(row, e)}
                  onDoubleClick={handleRowDoubleClick}
                >
                  <div className="flex p-1">
                    {column.applyFlag && row.withFlag && (
                      <TbFlag2Filled className="text-red-600 w-2" />
                    )}

                    {column.applyFlag && row.isWithPrepaid && (
                      <FaLocationArrow className="text-cyan-600 w-2" />
                    )}

                    {column.applyFlag && !row.isWithPrepaid && row.typeSale === "pedido" && (
                      <FaLocationArrow className="text-green-600 w-2" />
                    )}
                    <span className="pl-1">
                      {column.format
                        ? column.notZero && !Boolean(row[column.dataIndex])
                          ? column.defaultValue
                          : column.format(row[column.dataIndex])
                        : row[column.dataIndex]}
                    </span>
                  </div>
                </td>
              ))}
            </tr>
          </React.Fragment>
        ))}

        {columns.find(({ sumAcc }: any) => sumAcc) && (
          <tr>
            {enableSelectItem && (
              <th
                className={`text-right p-2 px-3 ${themeStyles[theme].tailwindcss.table.thead.th}`}
              ></th>
            )}
            {columns.map((column: any, idx: number) => {
              const reduceValue =
                column.sumAcc &&
                data.reduce(
                  (acc: any, current: any) =>
                    acc + (current[column.dataIndex] || 0),
                  0
                );

              return (
                <td
                  className={`text-center p-1 text-cyan-500 font-bold ${themeStyles[theme].tailwindcss.table.thead.th}`}
                  key={idx}
                >
                  {idx === 0 && !Boolean(reduceValue) && <MdAssignmentAdd />}
                  {column.sumAcc &&
                    (column.applyFormat
                      ? `$${formatCurrency(reduceValue)}`
                      : reduceValue)}
                </td>
              );
            })}
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default TableSaleByDay;
