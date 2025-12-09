// app/admin/offers/offer-types.ts
export enum OfferKind {
  RECURRING_WEEKDAY = "RECURRING_WEEKDAY",
  ONE_DAY = "ONE_DAY",
  DATE_RANGE = "DATE_RANGE",
}

export enum Weekday {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum Location {
  RECKE = "RECKE",
  METTINGEN = "METTINGEN",
}

export enum OfferType {
  GENERIC = "GENERIC",
  PRODUCT_NEW = "PRODUCT_NEW",
  PRODUCT_DISCOUNT = "PRODUCT_DISCOUNT",
  MULTIBUY_PRICE = "MULTIBUY_PRICE",
}
