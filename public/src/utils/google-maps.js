import { Loader } from "@googlemaps/js-api-loader";

const loader = new Loader({
  apiKey: "AIzaSyCiwPvMBsTQy6yiTJDvDkqZPIWdDerOcRI", 
  version: "weekly",
  libraries: ["places"], // Load all necessary libraries at once
});

export const googleApi = loader.load(); 