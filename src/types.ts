export interface Product {
  id: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  unit: string;
  limit?: string;
  expiryDate?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
}
