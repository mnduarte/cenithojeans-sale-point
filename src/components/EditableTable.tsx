import React from "react";

const mappingInputType: any = {
  string: ({ value, action }: any) => (
    <input
      type="text"
      className="w-[10vh] p-1 border border-[#484E55] rounded-md mr-2 text-right hover:cursor-pointer"
      readOnly
      value={value ? value.toString() : ""}
      onFocus={action}
    />
  ),
  date: ({ value, action }: any) => (
    <input
      type="date"
      value={value ? value : ""}
      onChange={({ target }: any) => action(target.value)}
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
              className={`${
                editableRow === rowIndex ? "bg-[#01557c]" : "hover:bg-[#1E1E1E]"
              }  ${rowIndex % 2 === 0 && "bg-[#1E1E1E]"} ${
                row[rowWithoutActions] && "bg-red-700 hover:bg-red-700"
              }`}
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
                  className="text-right p-2 px-2 border border-[#292A28] hover:cursor-pointer"
                  onClick={() =>
                    !row[rowWithoutActions] && handleEditClick(rowIndex)
                  }
                >
                  {editableRow === rowIndex &&
                  column.editableCell &&
                  column.type
                    ? mappingInputType[column.type]({
                        value: row[column.dataIndex],
                        dataIndex: column.dataIndex,
                        action: (inputValue: any) =>
                          handleAction({
                            dataIndex: column.dataIndex,
                            value: row[column.dataIndex],
                            id: row.id,
                            inputType: column.type,
                            inputValue,
                          }),
                      })
                    : column.format
                    ? Boolean(row[column.dataIndex])
                      ? column.format(row[column.dataIndex])
                      : "-"
                    : Boolean(row[column.dataIndex])
                    ? row[column.dataIndex]
                    : "-"}
                </td>
              ))}
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default EditableTable;
