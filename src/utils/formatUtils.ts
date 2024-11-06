export const formatDateToYYYYMMDD = (date: any) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Se suma 1 ya que los meses son indexados desde 0
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDateStringToYYYYMMDD = (date: any) => {
  const parts = date.split("/");
  const newDate = new Date(parts[2], parts[1] - 1, parts[0]);
  const newFormat = `${newDate.getFullYear()}-${(
    "0" +
    (newDate.getMonth() + 1)
  ).slice(-2)}-${("0" + newDate.getDate()).slice(-2)}`;

  return newFormat;
};

export const formatCurrency = (number: any) => {
  // Convierte el número a un entero
  const integerNumber = Math.trunc(number);

  // Convierte el número entero a una cadena y extrae el signo
  const sign = Math.sign(integerNumber) === -1 ? "-" : "";
  const absoluteNumber = Math.abs(integerNumber);

  // Convierte el número absoluto a una cadena y revierte la cadena
  const reversedNumberString = absoluteNumber
    .toString()
    .split("")
    .reverse()
    .join("");

  // Divide la cadena en grupos de tres dígitos y luego une los grupos con comas
  const formattedNumber =
    reversedNumberString.match(/.{1,3}/g)?.join(",") || "";

  // Vuelve a invertir la cadena para obtener el orden correcto
  const result = sign + formattedNumber.split("").reverse().join("");

  return result;
};

export const formatDate = (date: any) =>
  date
    ? new Date(date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

export const calculateTotalPercentage = (percentageToDisccountOrAdd: any) => {
  return percentageToDisccountOrAdd < 0
    ? String(percentageToDisccountOrAdd).length > 1
      ? 1 - Math.abs(percentageToDisccountOrAdd) / 100
      : 1.0 + percentageToDisccountOrAdd / 100
    : String(percentageToDisccountOrAdd).length > 1
    ? 1 + Math.abs(percentageToDisccountOrAdd) / 100
    : 1.0 + percentageToDisccountOrAdd / 100;
};
