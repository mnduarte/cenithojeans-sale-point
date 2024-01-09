export interface Price {
  id: number;
  price: number;
  active: boolean;
}

export interface PriceSelected extends Price {
  quantity: number;
}

export interface PriceDevolutionSelected extends Price {
  quantity: number;
}
