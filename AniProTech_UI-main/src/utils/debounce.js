// utils/debounce.js
export const debounce = (func, delay) => {
    let timerId;
    return (...args) => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => func(...args), delay);
    };
  };
  
export const waitFor = (ms) => new Promise((res) => setTimeout(res, ms));
