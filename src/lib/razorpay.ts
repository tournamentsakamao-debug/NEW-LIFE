export const initializeRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Frontend call example:
// const res = await initializeRazorpay();
// if (!res) alert("Razorpay SDK failed to load");
// const options = { key: "YOUR_KEY", amount: 50000, ... };

