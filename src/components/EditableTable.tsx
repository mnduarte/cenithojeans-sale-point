import React from "react";
import { MdOutlinePendingActions, MdAssignmentAdd } from "react-icons/md";
import {
  formatCurrency,
  formatDateStringToYYYYMMDD,
} from "../utils/formatUtils";
import { darkTheme, dateFormat } from "../utils/constants";
import dayjs from "dayjs";
import { DatePicker, Select } from "antd";
import { useTheme } from "../contexts/ThemeContext";

const EditableTable = ({
  data,
  columns,
  handleAction,
  editableRow,
  handleEditClick = () => {},
  table = "0-",
  setItemInOnClick = false,
  enableSelectItem = false,
  itemsIdSelected = [],
  cashflowIdSelected = [],
  setCashflowIdSelected = false,
  setItemsIdSelected = false,
  rowWithoutActions = "cancelled",
}: any) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();

  const mappingInputType: any = {
    button: ({ action }: any) => (
      <div
        className={`bg-blue-700 w-5 text-white py-1 rounded-md flex items-center justify-center select-none`}
        onClick={action}
      >
        <MdOutlinePendingActions />
      </div>
    ),
    select: ({ value, action, dataSelect }: any) => (
      <Select
        value={value ? value : ""}
        className={themeStyles[theme].classNameSelector}
        dropdownStyle={themeStyles[theme].dropdownStylesCustom}
        popupClassName={themeStyles[theme].classNameSelectorItem}
        style={{ width: 110 }}
        onSelect={(e: any) => action({ value: e })}
        options={dataSelect.map((data: any) => ({ value: data, label: data }))}
      />
    ),
    string: ({ value, action }: any) => (
      <input
        type="text"
        className={`w-20 p-1 rounded-md text-right hover:cursor-pointer ${themeStyles[theme].tailwindcss.inputText}`}
        readOnly
        value={value ? Math.trunc(value).toString() : ""}
        onFocus={action}
      />
    ),
    date: ({ value, action }: any) => (
      <DatePicker
        onChange={action}
        className={`${themeStyles[theme].datePickerIndicator} w-24`}
        style={themeStyles[theme].datePicker}
        popupClassName={themeStyles[theme].classNameDatePicker}
        allowClear={false}
        format={dateFormat}
        placeholder="Seleccione Fecha"
        value={value ? dayjs(formatDateStringToYYYYMMDD(value)) : ""}
      />
    ),
  };

  return (
    <table className={`w-full ${themeStyles[theme].tailwindcss.table.main}`}>
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
              } ${
                row[rowWithoutActions] &&
                "bg-red-500 hover:bg-red-700 text-white"
              }
              ${row.withBackground && "text-red-400"}
              `}
            >
              {enableSelectItem && (
                <td
                  className={`pt-1 ${themeStyles[theme].tailwindcss.table.tbody.td}`}
                >
                  {!row[rowWithoutActions] && (
                    <input
                      type="checkbox"
                      checked={[...itemsIdSelected, ...cashflowIdSelected]
                        .map(({ id }: any) => id)
                        .includes(row.id)}
                      disabled={row[rowWithoutActions]}
                      onChange={(e) => {
                        const setIdsSelected =
                          row.type === "ingreso"
                            ? setCashflowIdSelected
                            : setItemsIdSelected;

                        setIdsSelected((items: any) => {
                          if (e.target.checked) {
                            return [...items, { id: row.id }];
                          }

                          return items.filter((i: any) => i.id !== row.id);
                        });
                      }}
                      className={`form-checkbox h-4 w-4 border border-gray-300 ${
                        ![...itemsIdSelected, ...cashflowIdSelected]
                          .map(({ id }: any) => id)
                          .includes(row.id) &&
                        themeStyles[theme].tailwindcss.table.checkbox
                      } rounded p-2`}
                    />
                  )}
                </td>
              )}
              {columns.map((column: any, columnIndex: any) => (
                <td
                  key={columnIndex}
                  className={`text-center py-1 ${
                    themeStyles[theme].tailwindcss.table.tbody.td
                  } ${
                    column.applyColorText &&
                    row.isWithPrepaid &&
                    "text-cyan-500"
                  }`}
                  onClick={() =>
                    !row[rowWithoutActions] &&
                    !row.withBackground &&
                    handleEditClick(setItemInOnClick ? row : table + rowIndex)
                  }
                >
                  {editableRow === table + rowIndex &&
                  column.editableCell &&
                  column.type
                    ? mappingInputType[column.type]({
                        value: row[column.dataIndex],
                        dataIndex: column.dataIndex,
                        dataSelect: column.dataSelect,
                        action: (inputValue: any) =>
                          handleAction({
                            dataIndex: column.dataIndex,
                            value: row[column.dataIndex],
                            id: row.id,
                            inputType: column.type,
                            inputValue,
                          }),
                      })
                    : column.defaultValue
                    ? column.defaultValue
                    : Boolean(row[column.dataIndex])
                    ? column.format
                      ? column.format(row[column.dataIndex])
                      : row[column.dataIndex]
                    : "-"}
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
                data.reduce((acc: any, current: any) => {
                  const value = current.cancelled
                    ? 0
                    : current[column.dataIndex];
                  return acc + (value || 0);
                }, 0);

              return (
                <td
                  className={`text-center font-bold ${themeStyles[theme].tailwindcss.table.thead.th}`}
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

export default EditableTable;
