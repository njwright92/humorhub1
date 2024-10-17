interface DataLayerEvent {
  event: string;
  [key: string]: any; // Allows additional properties
}

interface Window {
  dataLayer: DataLayerEvent[];
}
