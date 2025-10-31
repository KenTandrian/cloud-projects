import type { google } from "@google-cloud/retail/build/protos/protos";

/**
 * Recursively converts a Protobuf Struct in its JSON representation
 * into a standard JavaScript object.
 * @param pv The raw Protobuf-JSON value.
 * @returns A clean JavaScript object, array, or primitive.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function protoJsonToJs(pv?: google.protobuf.IValue): any {
  if (!pv) {
    return null;
  }

  if ("stringValue" in pv) {
    return pv.stringValue;
  }
  if ("numberValue" in pv) {
    return pv.numberValue;
  }
  if ("boolValue" in pv) {
    return pv.boolValue;
  }
  if ("nullValue" in pv) {
    return null;
  }

  if ("listValue" in pv) {
    return pv.listValue?.values?.map((item) => protoJsonToJs(item));
  }

  if ("structValue" in pv) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newObj: { [key: string]: any } = {};
    for (const key in pv.structValue?.fields) {
      newObj[key] = protoJsonToJs(pv.structValue.fields[key]);
    }
    return newObj;
  }

  return pv;
}
