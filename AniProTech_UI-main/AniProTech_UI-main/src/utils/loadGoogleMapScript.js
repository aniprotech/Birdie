let googleMapsScriptLoadingPromise = null;

export const loadGoogleMapScript = (apiKey) => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Not in a browser environment"));
  }

  console.log("Test");

  if (googleMapsScriptLoadingPromise) {
    return googleMapsScriptLoadingPromise;
  }

  googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      console.log("Google Maps already loaded");
      resolve(window.google);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker,maps`;
    script.async = true;
    script.defer = true;

    console.log("Appending script:", script);

    script.onload = () => {
      if (window.google && window.google.maps) {
        console.log("Google Maps script loaded successfully");
        resolve(window.google);
      } else {
        reject(new Error("Google Maps API not available after script load"));
      }
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      reject(new Error("Failed to load Google Maps script"));
    };

    document.head.appendChild(script);
  });

  return googleMapsScriptLoadingPromise;
};
