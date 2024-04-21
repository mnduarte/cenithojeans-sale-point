export const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const concepts = [
  { value: "", description: "Sin concepto", action: "" },
  { value: "bolsas", description: "Bolsas", action: "addition" },
  { value: "envio", description: "Envío", action: "addition" },
  {
    value: "recargoPorMenor",
    description: "Recargo por menor",
    action: "addition",
  },
  {
    value: "pagoEfectivo",
    description: "Pago efectivo",
    action: "subtraction",
  },
  {
    value: "pagoTransferencia",
    description: "Pago transferencia",
    action: "subtraction",
  },
  {
    value: "descuento",
    description: "Descuento",
    action: "subtraction",
  },
];

export const listStore = [
  { name: "Todos", value: "ALL" },
  { name: "Bogota", value: "BOGOTA" },
  { name: "Helguera", value: "HELGUERA" },
];

export const mappingListStore = {
  "": "Todos",
  ALL: "Todos",
  BOGOTA: "Bogota",
  HELGUERA: "Helguera",
};

export const darkTheme = {
  backgroundColor: "#3B3B3B",
  color: "#fff",
  width: 120,
};

export const dateFormat = "DD/MM/YYYY";

export const mappingOrderSort = {
  "": "-",
  higher: "Mayor",
  lower: "Menor",
};

export const mappingTypeShipment = {
  "": "Todos",
  retiraLocal: "Retira local",
  envio: "Envio",
};

export const mappingCheckoutDate = {
  "": "Todos",
  with: "Con Salida",
  wihtout: "Sin Salida",
};