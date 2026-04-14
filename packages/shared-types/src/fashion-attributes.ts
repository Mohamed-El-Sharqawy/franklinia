import type { Fabric, Embellishment, SleeveStyle, Neckline, FitType, GarmentLength, TransparencyLayer } from "./fashion-enums";

export interface FashionAttributes {
  id: string;
  productId: string;
  fabric: Fabric;
  embellishment: Embellishment;
  sleeveStyle: SleeveStyle;
  fitType: FitType;
  transparencyLayer: TransparencyLayer;
  neckline: Neckline | null;
  length: GarmentLength | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateFashionAttributesInput = {
  fabric: Fabric;
  embellishment?: Embellishment;
  sleeveStyle: SleeveStyle;
  fitType: FitType;
  transparencyLayer: TransparencyLayer;
  neckline?: Neckline | null;
  length?: GarmentLength | null;
};
