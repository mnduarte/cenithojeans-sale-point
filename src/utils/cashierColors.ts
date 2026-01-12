// Paleta de colores predefinida para cajeros
// Diseñados para buen contraste con fondo #252525

export const CASHIER_COLORS = [
  { value: "#E57373", label: "Rojo Claro", textColor: "#000000" },
  { value: "#81C784", label: "Verde Claro", textColor: "#000000" },
  { value: "#64B5F6", label: "Azul Claro", textColor: "#000000" },
  { value: "#FFD54F", label: "Amarillo", textColor: "#000000" },
  { value: "#BA68C8", label: "Púrpura", textColor: "#000000" },
  { value: "#4DD0E1", label: "Cyan", textColor: "#000000" },
  { value: "#FF8A65", label: "Naranja", textColor: "#000000" },
  { value: "#A1887F", label: "Marrón", textColor: "#FFFFFF" },
  { value: "#90A4AE", label: "Gris Azulado", textColor: "#000000" },
  { value: "#F06292", label: "Rosa", textColor: "#000000" },
  { value: "#AED581", label: "Lima", textColor: "#000000" },
  { value: "#7986CB", label: "Índigo", textColor: "#FFFFFF" },
];

export const getTextColorForBackground = (bgColor: string): string => {
  const color = CASHIER_COLORS.find((c) => c.value === bgColor);
  return color?.textColor || "#000000";
};

export const getCashierColorLabel = (colorValue: string): string => {
  const color = CASHIER_COLORS.find((c) => c.value === colorValue);
  return color?.label || colorValue;
};
