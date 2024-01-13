export interface SaleItem {
  id: number;
  price: string;
  quantity: number;
  active: boolean;
  concept?: string; // Agrega la propiedad concept como opcional
}

export interface Price {
  id: number;
  price: number;
  active: boolean;
  concept?: string;
}

export interface PriceSelected extends Price {
  quantity: number;
}

export interface PriceDevolutionSelected extends Price {
  quantity: number;
}
