import React from "react";
import { MdOutlinePendingActions, MdCleaningServices } from "react-icons/md";
import {
  formatCurrency,
  formatDateStringToYYYYMMDD,
} from "../utils/formatUtils";
import { darkTheme, dateFormat } from "../utils/constants";
import dayjs from "dayjs";
import { DatePicker, Select } from "antd";
import { useTheme } from "../contexts/ThemeContext";
import { FaCheck, FaSave } from "react-icons/fa";
import { IoMdClose, IoMdCloseCircle } from "react-icons/io";

const CrudTable = ({
  data,
  columns,
  handleAction,
  handleClean,
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
  withActionButton,
  rowValues,
  saveRow,
  onEnterPress = () => {},
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
    checkbox: ({ value, action }: any) => (
      <div className="pt-1">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => action(e)}
          className={` h-4 w-4 border border-gray-300 rounded p-2`}
        />
      </div>
    ),
    select: ({ value, action, dataSelect, enableClean, onClean }: any) => (
      <div className="flex items-center space-x-1">
        <Select
          value={value ? value : ""}
          className={themeStyles[theme].classNameSelector}
          dropdownStyle={themeStyles[theme].dropdownStylesCustom}
          popupClassName={themeStyles[theme].classNameSelectorItem}
          style={{ width: 120 }}
          onSelect={(e: any) => action({ value: e })}
          options={dataSelect.map((data: any) => ({
            value: data.value,
            label: data.label,
          }))}
        />

        {enableClean && (
          <div
            className="bg-gray-700 w-5 text-white py-1 rounded-md flex items-center justify-center select-none transition-opacity duration-200 hover:opacity-80 active:scale-95"
            onClick={onClean}
          >
            <MdCleaningServices />
          </div>
        )}
      </div>
    ),
    string: ({ value, action, inputExpanded }: any) => (
      <input
        type="text"
        className={`${
          inputExpanded ? "w-[220px]" : "w-[80px]"
        } p-1 rounded-md text-center hover:cursor-pointer ${
          themeStyles[theme].tailwindcss.inputText
        }`}
        value={value ? value : ""}
        onChange={action}
      />
    ),
    number: ({ value, action, inputExpanded }: any) => (
      <input
        type="number"
        className={`${
          inputExpanded ? "w-[120px]" : "w-[80px]"
        } p-1 rounded-md text-center hover:cursor-pointer ${
          themeStyles[theme].tailwindcss.inputText
        }`}
        value={value ? value : ""}
        onChange={action}
      />
    ),
    currency: ({ value, action, inputExpanded }: any) => {
      const formattedValue =
        value !== null && value !== undefined && value !== ""
          ? `$${formatCurrency(value)}`
          : "";

      return (
        <input
          type="text"
          className={`${
            inputExpanded ? "w-[120px]" : "w-[80px]"
          } p-1 rounded-md text-center hover:cursor-pointer ${
            themeStyles[theme].tailwindcss.inputText
          }`}
          value={formattedValue}
          onChange={(e) => {
            const inputValue = e.target.value;

            const cleanedValue = inputValue.replace(/[^0-9.]/g, "");

            if (!/^\d*\.?\d*$/.test(cleanedValue)) {
              return;
            }

            action({ target: { value: cleanedValue } });
          }}
        />
      );
    },
    date: ({ value, action, enableClean, onClean }: any) => (
      <div className="flex items-center space-x-1">
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
        {enableClean && (
          <div
            className="bg-gray-700 w-5 text-white py-1 rounded-md flex items-center justify-center select-none transition-opacity duration-200 hover:opacity-80 active:scale-95"
            onClick={onClean}
          >
            <MdCleaningServices />
          </div>
        )}
      </div>
    ),
  };

  return (
    <table className={`w-full ${themeStyles[theme].tailwindcss.table.main}`}>
      <thead>
        <tr className="border-b-2 border-[#1BA1E2]">
          {enableSelectItem && (
            <th className={`${themeStyles[theme].tailwindcss.table.thead.th} `}>
              <div
                className={`bg-red-800 w-5 text-white py-1 rounded-md flex items-center justify-center select-none`}
              >
                <IoMdClose />
              </div>
            </th>
          )}

          {columns.map((column: any, columnIndex: any) => (
            <th
              key={columnIndex}
              className={`text-center font-normal  ${themeStyles[theme].tailwindcss.table.thead.th} ${column.customStyles}`}
            >
              {column.title}
            </th>
          ))}
          {withActionButton && (
            <th className={`${themeStyles[theme].tailwindcss.table.thead.th} `}>
              <div className={`w-full flex items-center justify-center`}>
                <FaSave className={`cursor-pointer`} onClick={saveRow} />
              </div>
            </th>
          )}
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
              onKeyDown={(event) => {
                if (event.key === "Enter" && editableRow === table + rowIndex) {
                  saveRow();
                }
              }}
            >
              {enableSelectItem && (
                <td
                  className={`pt-2 pl-2 ${themeStyles[theme].tailwindcss.table.tbody.td}`}
                >
                  {!row[rowWithoutActions] &&
                    editableRow !== table + rowIndex &&
                    row.id && (
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
              {columns.map((column: any, columnIndex: any) => {
                return (
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
                      handleEditClick(row, table + rowIndex)
                    }
                  >
                    {editableRow === table + rowIndex &&
                    column.editableCell &&
                    column.type
                      ? mappingInputType[column.type]({
                          value: rowValues[column.dataIndex],
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
                          inputExpanded: column.inputExpanded,
                          enableClean: column.enableClean,
                          onClean: () =>
                            handleClean({
                              dataIndex: column.dataIndex,
                              id: row.id,
                            }),
                        })
                      : column.defaultValue
                      ? column.defaultValue(row[column.dataIndex], row)
                      : Boolean(row[column.dataIndex])
                      ? column.format
                        ? column.format(row[column.dataIndex])
                        : row[column.dataIndex]
                      : "-"}
                  </td>
                );
              })}

              {withActionButton && (
                <td
                  className={`${themeStyles[theme].tailwindcss.table.tbody.td}`}
                >
                  {editableRow === table + rowIndex ? (
                    <div className={`w-full flex items-center justify-center`}>
                      <FaSave className={`cursor-pointer`} onClick={saveRow} />
                    </div>
                  ) : (
                    <div className={`text-center font-bold`}>
                      {row.id ? "OK" : "-"}
                    </div>
                  )}
                </td>
              )}
            </tr>
          </React.Fragment>
        ))}

        {columns.find(({ sumAcc }: any) => sumAcc) && (
          <tr>
            {enableSelectItem && (
              <th
                className={`text-right ${themeStyles[theme].tailwindcss.table.thead.th}`}
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
                  {column.sumAcc &&
                    (column.applyFormat
                      ? `$${formatCurrency(reduceValue)}`
                      : reduceValue)}
                </td>
              );
            })}
            <th
              className={`text-right ${themeStyles[theme].tailwindcss.table.thead.th}`}
            ></th>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default CrudTable;
