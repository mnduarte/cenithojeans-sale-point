import { FaArrowAltCircleUp, FaShoppingBag, FaTruck } from "react-icons/fa";
import { IoIosCash } from "react-icons/io";
import { FaMoneyBillTransfer } from "react-icons/fa6";

interface ConceptWithIcon {
  value: string;
  icon: JSX.Element;
}

export const mappingConceptWithIcon: Record<string, ConceptWithIcon> = {
    bolsas: { value: "Bolsas", icon: <FaShoppingBag className="mr-2" /> },
    envio: { value: "Envio", icon: <FaTruck className="mr-2" /> },
    recargoPorMenor: {
      value: "Recargo por menor",
      icon: <FaArrowAltCircleUp className="mr-2" />,
    },
    pagoEfectivo: {
      value: "Pago efectivo",
      icon: <IoIosCash  className="mr-2" />,
    },
    pagoTransferencia: {
      value: "Pago transferencia",
      icon: <FaMoneyBillTransfer className="mr-2" />,
    },
  };