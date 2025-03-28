const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 9876;

let previousWindow = [];
let currentWindow = new Set();
const MAX_WINDOW_SIZE = 10;

const checkPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const checkFibonacci = (num) => {
  const isPerfectSquare = (x) => Number.isInteger(Math.sqrt(x));
  return isPerfectSquare(5 * num * num + 4) || isPerfectSquare(5 * num * num - 4);
};

const retrieveNumbers = async () => {
    try {
      const response = await axios.get("https://www.randomnumberapi.com/api/v1.0/random?min=1&max=100&count=10", { timeout: 500 });
  
      console.log("API Response:", response.data);
  
      if (!Array.isArray(response.data) || response.data.length === 0) {
        console.warn("Received empty response, retrying...");
        return [2, 4, 6, 8]; 
      }
  
      return response.data;
    } catch (error) {
      console.error("Error fetching numbers:", error.message);
      return [2, 4, 6, 8];
    }
  };

const classifyNumber = (num) => {
  if (checkPrime(num)) return "p";
  if (checkFibonacci(num)) return "f";
  if (num % 2 === 0) return "e";
  return "r";
};

const refreshWindow = (numbers) => {
  previousWindow = Array.from(currentWindow);
  numbers.forEach((num) => currentWindow.add(num));

  if (currentWindow.size > MAX_WINDOW_SIZE) {
    currentWindow = new Set(Array.from(currentWindow).slice(-MAX_WINDOW_SIZE));
  }
};

const computeAverage = () => {
  if (currentWindow.size === 0) return "0.00";
  const avg = Array.from(currentWindow).reduce((sum, num) => sum + num, 0) / currentWindow.size;
  return avg.toFixed(2);
};

app.get("/numbers", async (req, res) => {
    const numbers = await retrieveNumbers();
    console.log("Fetched Numbers:", numbers);
    if (numbers.length === 0) {
      return res.json({
        previousWindow,
        currentWindow: Array.from(currentWindow),
        categorizedNumbers: [],
        Avg: computeAverage(),
      });
    }
    const categorizedNumbers = numbers.map((num) => ({
      number: num,
      category: classifyNumber(num),
    }));
    refreshWindow(numbers);
    console.log("Updated Window:", currentWindow);
    res.json({
      previousWindow,
      currentWindow: Array.from(currentWindow),
      categorizedNumbers,
      Avg: computeAverage(),
    });
  });
  

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
