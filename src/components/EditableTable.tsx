import React from "react";
import { MdOutlinePendingActions } from "react-icons/md";
import { formatCurrency } from "../utils/formatUtils";

const mappingInputType: any = {
  button: ({ action }: any) => (
    <div
      className={`bg-blue-500 p-2 rounded-md flex items-center justify-center select-none`}
      onClick={action}
    >
      <MdOutlinePendingActions />
    </div>
  ),
  select: ({ value, action, dataSelect }: any) => (
    <select
      className="p-1 border border-[#484E55] rounded-md"
      onChange={action}
      value={value ? value : ""}
    >
      <option value="" className="py-2" disabled hidden>
        -
      </option>
      {dataSelect.map((data: any, idx: number) => (
        <option value={data} key={idx} className="py-2">
          {data}
        </option>
      ))}
    </select>
  ),
  string: ({ value, action }: any) => (
    <input
      type="text"
      className="w-20 p-1 border border-[#484E55] rounded-md mr-2 text-right hover:cursor-pointer"
      readOnly
      value={value ? value.toString() : ""}
      onFocus={action}
    />
  ),
  date: ({ value, action }: any) => (
    <input
      type="date"
      //value={value ? value.split("/").reverse().join("-") : ""}
      value={value ? value : ""}
      onChange={action}
      className="p-1 border border-gray-300 rounded-md hover:cursor-pointer"
    />
  ),
};

const EditableTable = ({
  data,
  columns,
  handleAction,
  editableRow,
  handleEditClick,
  table = "0-",
  enableSelectItem = false,
  itemsIdSelected = false,
  setItemsIdSelected = false,
  rowWithoutActions = "cancelled",
}: any) => {
  return (
    <table className="w-full bg-[#252525] border border-[#2A2B2A]">
      <thead>
        <tr className="border-b-2 border-[#1BA1E2]">
          {enableSelectItem && <th className="p-2 px-5"></th>}
          {columns.map((column: any, columnIndex: any) => (
            <th
              key={columnIndex}
              className="text-left font-normal border border-[#333333] p-2 px-5"
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
                "bg-[#1E1E1E]"
              } ${
                editableRow === table + rowIndex
                  ? "bg-[#01557c]"
                  : "hover:bg-[#1E1E1E]"
              } ${row[rowWithoutActions] && "bg-red-700 hover:bg-red-700"}`}
            >
              {enableSelectItem && (
                <td className="p-2 pl-2 border border-[#292A28]">
                  {!row[rowWithoutActions] && (
                    <input
                      type="checkbox"
                      checked={Boolean(
                        itemsIdSelected.find((i: any) => i.id === row.id)
                      )}
                      disabled={row[rowWithoutActions]}
                      onChange={(e) => {
                        setItemsIdSelected((items: any) => {
                          if (e.target.checked) {
                            return [...items, { id: row.id }];
                          }

                          return items.filter((i: any) => i.id !== row.id);
                        });
                      }}
                      className="form-checkbox h-5 w-5 text-[#1BA1E2] focus:ring-[#1BA1E2] border-gray-300 rounded"
                    />
                  )}
                </td>
              )}
              {columns.map((column: any, columnIndex: any) => (
                <td
                  key={columnIndex}
                  className="text-right p-1 px-2 border border-[#292A28] hover:cursor-pointer"
                  onClick={() =>
                    !row[rowWithoutActions] && handleEditClick(table + rowIndex)
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
              <th className="text-right p-2 px-3 border border-[#292A28] font-bold bg-[#1E1E1E]"></th>
            )}
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

export default EditableTable;
