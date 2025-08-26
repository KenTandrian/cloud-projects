/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Product {
  collectionMemberIds: string[];
  categories: string[];
  brands: string[];
  tags: string[];
  fulfillmentInfo: any[];
  images: {
    uri: string;
    height: number;
    width: number;
  }[];
  sizes: any[];
  materials: any[];
  patterns: any[];
  conditions: any[];
  variants: any[];
  promotions: any[];
  localInventories: any[];
  attributes: {
    [key: string]: {
      text: string[];
      numbers: number[];
    };
  };
  name: string;
  id: string;
  type: string;
  primaryProductId: string;
  gtin: string;
  title: string;
  description: string;
  languageCode: string;
  priceInfo: {
    currencyCode: string;
    price: number;
    originalPrice: number;
    cost: number;
    priceEffectiveTime: null | string;
    priceExpireTime: null | string;
    priceRange: {
      price: null | number;
      originalPrice: null | number;
    };
  };
  rating: null | any;
  availableTime: null | string;
  availability: string;
  availableQuantity: null | number;
  uri: string;
  audience: null | any;
  colorInfo: null | any;
  retrievableFields: null | any;
  publishTime: null | string;
}
