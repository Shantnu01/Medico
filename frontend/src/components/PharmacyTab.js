import React from "react";
import { NearbyMapTab } from "./NearbyMapTab.js";

export function PharmacyTab({ userLocation = "Chennai, India" }) {
  return <NearbyMapTab type="pharmacy" />;
}
