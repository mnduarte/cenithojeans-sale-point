import { useEffect, useState } from "react";
import { usePrice } from "../contexts/PriceContext";
import { useEmployee } from "../contexts/EmployeeContext";
import {
  Price,
  PriceDevolutionSelected,
  PriceSelected,
  SaleItem,
} from "../types";
import ShoppingCartContainer from "./ShoppingCartContainer";
import ListOfPricesContainer from "./ListOfPricesContainer";
import ConfirmSale from "./ConfirmSale";
import { saleActions, useSale } from "../contexts/SaleContext";
import Toast from "../components/Toast";
import KeyboardNum from "../components/KeyboardNum";
import { useUser } from "../contexts/UserContext";
import { concepts } from "../utils/constants";
import { calculateTotalPercentage } from "../utils/formatUtils";

const SalesContainer = () => {
  const {
    state: { prices, loading: loadingPrices },
  } = usePrice();
  const {
    state: { employees, loading: loadingEmployees },
  } = useEmployee();

  const {
    state: { user },
  } = useUser();

  const {
    state: {
      loading: loadingSales,
      showSuccessToast,
      showErrorToast,
      showSuccessToastMsg,
      inboundSale,
      lastNumOrder,
    },
    dispatch: dispatchSale,
  } = useSale();

  const [pricesFiltered, setPricesFiltered] = useState<any[]>([]);
  const [employeesFiltered, setEmployeesFiltered] = useState<any[]>([]);

  const [pricesSelected, setPricesSelected] = useState<any[]>([]);
  const [devolutionPricesSelected, setDevolutionPricesSelected] = useState<
    any[]
  >([]);

  const [searchAmount, setSearchAmount] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [totalDevolutionItems, setTotalDevolutionItems] = useState(0);
  const [totalPrices, setTotalPrices] = useState(0);
  const [totalDevolutionPrices, setTotalDevolutionPrices] = useState(0);
  const [percentageToDisccountOrAdd, setPercentageToDisccountOrAdd] =
    useState(0);

  const [devolutionModeActive, setDevolutionModeActive] = useState(false);

  const [isModalSaleOpen, setIsModalSaleOpen] = useState(false);
  const [isModalKeyboardNumOpen, setIsModalKeyboardNumOpen] = useState(false);
  const [itemIdFocusForQuantity, setItemIdFocusForQuantity] = useState("");
  const [quantityForItem, setQuantityForItem] = useState("");
  const [concept, setConcept] = useState("");

  const openModalSale = () => {
    setIsModalSaleOpen(true);
  };

  useEffect(() => {
    const totalItems = pricesSelected.reduce(
      (acc, current) =>
        Number(acc) + (current.concept ? 0 : Number(current.quantity)),
      0
    );
    setTotalItems(totalItems);

    const totalDevolutionItems = devolutionPricesSelected.reduce(
      (acc, current) =>
        Number(acc) + (current.concept ? 0 : Number(current.quantity)),
      0
    );
    setTotalDevolutionItems(totalDevolutionItems);

    setTotalPrices(
      pricesSelected.reduce(
        (acc, current) => current.price * current.quantity + acc,
        0
      )
    );
    setTotalDevolutionPrices(
      devolutionPricesSelected.reduce(
        (acc, current) => current.price * current.quantity + acc,
        0
      )
    );
  }, [pricesSelected, devolutionPricesSelected]);

  useEffect(() => {
    const activePrices = prices.filter((price: any) => price.active);

    setPricesFiltered(activePrices);
  }, [prices]);

  useEffect(() => {
    const activeEmployees = employees.filter((price: any) => price.active);

    setEmployeesFiltered(activeEmployees);
  }, [employees]);

  useEffect(() => {
    if (!isModalSaleOpen) {
      dispatchSale(saleActions.newSale()(dispatchSale));
    }
  }, [isModalSaleOpen]);

  const onSale = (data: any) => {
    const totalToPay = totalPrices - (totalDevolutionPrices || 0);

    data.items = totalItems - totalDevolutionItems;
    data.subTotalItems = totalPrices;
    data.devolutionItems = totalDevolutionItems;
    data.subTotalDevolutionItems = totalDevolutionPrices;
    data.percentageToDisccountOrAdd = percentageToDisccountOrAdd;
    data.username = user.username;
    data.total =
      totalToPay * calculateTotalPercentage(percentageToDisccountOrAdd);

    dispatchSale(saleActions.addSale(data)(dispatchSale));
  };

  const handleQuantityByPrice = (
    event: any,
    itemId: any,
    isDevolution: boolean
  ) => {
    const inputValue = event.target.value;
    if (/^\d*$/.test(inputValue)) {
      const pricesItems = isDevolution
        ? devolutionPricesSelected
        : pricesSelected;
      const setPricesItems = isDevolution
        ? setDevolutionPricesSelected
        : setPricesSelected;

      const priceByQuantityUpdated = pricesItems.map((item: any) => {
        return itemId === item.id ? { ...item, quantity: inputValue } : item;
      });

      setPricesItems(priceByQuantityUpdated);
    }
  };

  const closeModal = () => {
    setConcept("");
    setIsModalKeyboardNumOpen(false);
  };

  const addManualPrice = (concept: any) => {
    if (manualPrice) {
      const [foundConcept]: any = concepts.filter((c) => c.value === concept);

      let setPricesItems = devolutionModeActive
        ? setDevolutionPricesSelected
        : setPricesSelected;

      if (foundConcept && foundConcept.action === "addition") {
        setPricesItems = setPricesSelected;
      }

      if (foundConcept && foundConcept.action === "subtraction") {
        setPricesItems = setDevolutionPricesSelected;
      }

      setPricesItems((items: any) => {
        const maxId = Math.max(
          ...items.map((item: PriceSelected) => item.id),
          ...prices.map((item: Price) => item.id)
        );

        const newItem: SaleItem = {
          id: maxId + 1,
          price: manualPrice,
          quantity: 1,
          active: true,
        };

        if (concept.length) {
          setConcept("");
          newItem.concept = concept;
        }

        return [...items, newItem];
      });
      setManualPrice("");
      closeModal();
    }
  };

  const addManualQuantity = () => {
    if (quantityForItem) {
      const setPricesItems = devolutionModeActive
        ? setDevolutionPricesSelected
        : setPricesSelected;
      setPricesItems((items: any) =>
        items.map((item: any) => {
          if (item.id === Number(itemIdFocusForQuantity)) {
            item.quantity = Number(quantityForItem);
          }
          return item;
        })
      );
      setItemIdFocusForQuantity("");
      setQuantityForItem("");
      closeModal();
    }
  };

  const handleManualPrice = (item: any, concept: any) => {
    if (item.action === "deleteLast") {
      return setManualPrice((currentValue: any) =>
        String(currentValue).slice(0, -1)
      );
    }

    if (item.action === "addPrice") {
      return addManualPrice(concept);
    }

    setManualPrice(
      (currentValue: any) => String(currentValue) + String(item.value)
    );
  };

  const handleQuantityByItem = (item: any) => {
    if (item.action === "deleteLast") {
      return setQuantityForItem((currentValue: any) =>
        String(currentValue).slice(0, -1)
      );
    }

    if (item.action === "addPrice") {
      return addManualQuantity();
    }

    setQuantityForItem(
      (currentValue: any) => String(currentValue) + String(item.value)
    );
  };

  const handleOpenKeyboardNum = (itemId: any) => {
    setItemIdFocusForQuantity(itemId);
    setIsModalKeyboardNumOpen(true);
  };

  const handlePrintSale = ({
    sellerSelected,
    typeSale,
    numOrder,
    pricesWithconcepts,
    pricesDevolutionWithconcepts,
  }: any) =>
    dispatchSale(
      saleActions.printSale({
        pricesSelected: pricesSelected.filter((price: any) => !price.concept),
        devolutionPricesSelected: devolutionPricesSelected.filter(
          (price: any) => !price.concept
        ),
        percentageToDisccountOrAdd,
        username: user.username,
        seller: sellerSelected,
        typeSale,
        numOrder,
        pricesWithconcepts,
        pricesDevolutionWithconcepts,
        totalPrices: totalPrices,
        totalDevolutionPrices: totalDevolutionPrices,
        total:
          (totalPrices - totalDevolutionPrices) *
          calculateTotalPercentage(percentageToDisccountOrAdd),
      })(dispatchSale)
    );

  const getLastNumOrder = (seller: any) =>
    dispatchSale(saleActions.getLastNumOrder(seller)(dispatchSale));

  return (
    <div className="flex gap-4 h-[80vh]">
      <div className="w-1/3">
        <ShoppingCartContainer
          prices={prices}
          manualPrice={manualPrice}
          setManualPrice={setManualPrice}
          pricesSelected={pricesSelected}
          setPricesSelected={setPricesSelected}
          totalPrice={totalPrices - totalDevolutionPrices}
          totalItems={totalItems}
          devolutionModeActive={devolutionModeActive}
          devolutionPricesSelected={devolutionPricesSelected}
          setDevolutionPricesSelected={setDevolutionPricesSelected}
          totalDevolutionItems={totalDevolutionItems}
          openModalSale={openModalSale}
          setIsModalKeyboardNumOpen={setIsModalKeyboardNumOpen}
          handleQuantityByPrice={handleQuantityByPrice}
          handleOpenKeyboardNum={handleOpenKeyboardNum}
        />
      </div>
      <div className="w-4/5">
        <ListOfPricesContainer
          prices={prices}
          setSearchAmount={setSearchAmount}
          setPricesFiltered={setPricesFiltered}
          pricesSelected={pricesSelected}
          setPricesSelected={setPricesSelected}
          devolutionPricesSelected={devolutionPricesSelected}
          setDevolutionPricesSelected={setDevolutionPricesSelected}
          searchAmount={searchAmount}
          pricesFiltered={pricesFiltered}
          devolutionModeActive={devolutionModeActive}
          setDevolutionModeActive={setDevolutionModeActive}
          isLoading={loadingPrices || loadingEmployees}
        />
      </div>
      <ConfirmSale
        employees={employeesFiltered}
        isModalSaleOpen={isModalSaleOpen}
        setIsModalSaleOpen={setIsModalSaleOpen}
        totalItems={totalItems}
        totalDevolutionItems={totalDevolutionItems}
        totalPrices={totalPrices}
        totalDevolutionPrices={totalDevolutionPrices}
        onSale={onSale}
        isLoading={loadingSales}
        pricesSelected={pricesSelected}
        devolutionPricesSelected={devolutionPricesSelected}
        setPricesSelected={setPricesSelected}
        setDevolutionPricesSelected={setDevolutionPricesSelected}
        setDevolutionModeActive={setDevolutionModeActive}
        percentageToDisccountOrAdd={percentageToDisccountOrAdd}
        setPercentageToDisccountOrAdd={setPercentageToDisccountOrAdd}
        handlePrintSale={handlePrintSale}
        inboundSale={inboundSale}
        lastNumOrder={lastNumOrder}
        getLastNumOrder={getLastNumOrder}
      />
      <KeyboardNum
        isModalKeyboardNumOpen={isModalKeyboardNumOpen}
        manualNum={manualPrice}
        itemIdFocusForQuantity={itemIdFocusForQuantity}
        quantityForItem={quantityForItem}
        handleManualNum={handleManualPrice}
        handleQuantityByItem={handleQuantityByItem}
        closeModal={closeModal}
        isItemPrice={true}
        title={
          itemIdFocusForQuantity
            ? "Agregar Cantidad al Item"
            : devolutionModeActive
            ? "Añadir precio dev manual"
            : "Añadir precio manual"
        }
        concept={concept}
        setConcept={setConcept}
      />
      {showSuccessToast && (
        <Toast
          type="success"
          message={showSuccessToastMsg}
          onClose={() =>
            dispatchSale(saleActions.setHideToasts()(dispatchSale))
          }
        />
      )}

      {showErrorToast && (
        <Toast
          type="error"
          message={showSuccessToastMsg}
          onClose={() =>
            dispatchSale(saleActions.setHideToasts()(dispatchSale))
          }
        />
      )}
    </div>
  );
};

export default SalesContainer;
