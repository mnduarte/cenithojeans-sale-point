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
  const [totalPrice, setTotalPrice] = useState(0);
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
      (acc, current) => Number(current.quantity) + Number(acc),
      0
    );
    setTotalDevolutionItems(totalDevolutionItems);

    const totalPrice = pricesSelected.reduce(
      (acc, current) => current.price * current.quantity + acc,
      0
    );
    const totalDevolutionPrice = devolutionPricesSelected.reduce(
      (acc, current) => current.price * current.quantity + acc,
      0
    );

    setTotalPrice(totalPrice - totalDevolutionPrice);
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
    data.store = user.store;
    data.items = totalItems;
    data.subTotalItems = pricesSelected.reduce(
      (acc, current) =>
        Number(current.quantity) * Number(current.price) + Number(acc),
      0
    );
    data.devolutionItems = totalDevolutionItems;
    data.subTotalDevolutionItems = devolutionPricesSelected.reduce(
      (acc, current) =>
        Number(current.quantity) * Number(current.price) + Number(acc),
      0
    );
    data.percentageToDisccountOrAdd = percentageToDisccountOrAdd;
    data.username = user.username;
    data.total = totalPrice;
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
      const setPricesItems = concept.length
        ? setPricesSelected
        : devolutionModeActive
        ? setDevolutionPricesSelected
        : setPricesSelected;

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
  }: any) =>
    dispatchSale(
      saleActions.printSale({
        pricesSelected: pricesSelected.filter((price: any) => !price.concept),
        devolutionPricesSelected,
        percentageToDisccountOrAdd,
        username: user.username,
        seller: sellerSelected,
        typeSale,
        numOrder,
        pricesWithconcepts,
        totalPrice,
      })(dispatchSale)
    );

  return (
    <div className="flex gap-4 h-[80vh]">
      <div className="w-1/3">
        <ShoppingCartContainer
          prices={prices}
          manualPrice={manualPrice}
          setManualPrice={setManualPrice}
          pricesSelected={pricesSelected}
          setPricesSelected={setPricesSelected}
          totalPrice={totalPrice}
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
        totalPrice={totalPrice}
        onSale={onSale}
        isLoading={loadingSales}
        pricesSelected={pricesSelected}
        setPricesSelected={setPricesSelected}
        setDevolutionPricesSelected={setDevolutionPricesSelected}
        setDevolutionModeActive={setDevolutionModeActive}
        percentageToDisccountOrAdd={percentageToDisccountOrAdd}
        setPercentageToDisccountOrAdd={setPercentageToDisccountOrAdd}
        handlePrintSale={handlePrintSale}
        inboundSale={inboundSale}
      />
      <KeyboardNum
        isModalKeyboardNumOpen={isModalKeyboardNumOpen}
        setIsModalKeyboardNumOpen={setIsModalKeyboardNumOpen}
        setDevolutionPricesSelected={setDevolutionPricesSelected}
        devolutionModeActive={devolutionModeActive}
        setPricesSelected={setPricesSelected}
        manualNum={manualPrice}
        setManualPrice={setManualPrice}
        itemIdFocusForQuantity={itemIdFocusForQuantity}
        quantityForItem={quantityForItem}
        handleManualNum={handleManualPrice}
        handleQuantityByItem={handleQuantityByItem}
        closeModal={closeModal}
        isItemPrice={true}
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
