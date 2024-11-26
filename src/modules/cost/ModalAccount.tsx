import { MdClose } from "react-icons/md";
import { useTheme } from "../../contexts/ThemeContext";
import { useState } from "react";
import { costActions, useCost } from "../../contexts/CostContext";
import CrudTable from "../../components/CrudTable";

export const ModalAccount = ({ isModalOpen, setIsModaOpen }: any) => {
  const [itemsIdSelected, setItemsIdSelected] = useState<any[]>([]);
  const [editableRow, setEditableRow] = useState<number | null>(null);

  const INITIAL_VALUES_ACCOUNT = {
    id: null,
    name: null,
  };

  const [rowValues, setRowValues] = useState(INITIAL_VALUES_ACCOUNT);

  const {
    state: { theme, themeStyles },
  } = useTheme();

  const {
    state: { loading, accounts },
    dispatch: dispatchCost,
  } = useCost();

  const columns = [
    {
      title: "Cuenta",
      dataIndex: "name",
      editableCell: true,
      type: "string",
    },
  ];

  const accountsData = [
    ...accounts,
    {
      date: null,
      account: null,
      numOrder: null,
      amount: null,
      approved: null,
      dateApproved: null,
      employee: null,
      customer: null,
      typeShipment: null,
      checkoutDate: null,
    },
  ];

  const handleEditClick = ({ id, name }: any, rowIndex: number) => {
    if (editableRow !== rowIndex) {
      setRowValues({
        id,
        name,
      });
      setEditableRow(rowIndex);
    }
  };

  const handleAction = ({ dataIndex, inputType, inputValue }: any) => {
    if (["string", "number"].includes(inputType)) {
      setRowValues((e: any) => ({
        ...e,
        [dataIndex]: inputValue.target.value,
      }));
    }
  };

  const saveRow = () => {
    const actionCost = (values: any) =>
      rowValues.id
        ? costActions.updateAccount(values)
        : costActions.addAccount(values);

    dispatchCost(actionCost(rowValues)(dispatchCost));
    setRowValues(INITIAL_VALUES_ACCOUNT);
    setEditableRow(null);
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#252525] bg-opacity-60 flex items-center justify-center">
          <div
            className={`w-[70vh] h-[65vh] p-8 rounded-md shadow-md relative ${themeStyles[theme].tailwindcss.modal}`}
          >
            {/* Icono de cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsModaOpen(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-bold mb-4">Listado de Cuentas</h2>

            <div className="mt-2 h-[4vh] mx-auto max-w flex items-center">
              {Boolean(itemsIdSelected.length) && (
                <div
                  className=" ml-2 bg-red-700 hover:bg-red-800 hover:cursor-pointer text-white px-2  py-1 rounded-md flex items-center justify-center select-none"
                  onClick={() => {
                    dispatchCost(
                      costActions.removeAccounts({
                        accountsIds: itemsIdSelected,
                      })(dispatchCost)
                    );
                    setItemsIdSelected([]);
                  }}
                >
                  Eliminar Cuentas
                </div>
              )}
            </div>

            <div className="mt-2 h-[50vh] mx-auto max-w overflow-hidden overflow-y-auto overflow-x-auto">
              <CrudTable
                data={accountsData}
                columns={columns}
                handleAction={handleAction}
                editableRow={editableRow}
                handleEditClick={handleEditClick}
                itemsIdSelected={itemsIdSelected}
                setItemsIdSelected={setItemsIdSelected}
                enableSelectItem={true}
                withActionButton={true}
                rowValues={rowValues}
                saveRow={saveRow}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
