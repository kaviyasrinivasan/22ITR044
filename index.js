// const express = require('express');
// const axios = require('axios');
// const app = express();
// const port = 9876;

// // Configuration
// const WINDOW_SIZE = 10;
// const REQUEST_TIMEOUT = 10000; // 500ms timeout
// const VALID_IDS = ['p', 'f', 'e', 'r'];
// const API_BASE_URL = 'http://20.244.56.144/evaluation-service';

// // In-memory storage for numbers
// let numberWindow = [];

// // Map of number ID to API endpoint
// const apiEndpoints = {
//   p: `${API_BASE_URL}/primes`,
//   f: `${API_BASE_URL}/fibo`,
//   e: `${API_BASE_URL}/even`,
//   r: `${API_BASE_URL}/rand`
// };

// // Helper function to calculate average
// const calculateAverage = (numbers) => {
//   if (numbers.length === 0) return 0;
//   const sum = numbers.reduce((acc, num) => acc + num, 0);
//   return parseFloat((sum / numbers.length).toFixed(2));
// };

// // Helper function to fetch numbers from test server
// const fetchNumbers = async (numberId) => {
//   try {
//     const response = await axios.get(apiEndpoints[numberId], {
//       timeout: REQUEST_TIMEOUT
//     });
//     return response.data.numbers || [];
//   } catch (error) {
//     console.error(`Error fetching numbers for ${numberId}:`, error.message);
//     return [];
//   }
// };

// // API endpoint to get numbers and calculate average
// app.get('/numbers/:numberId', async (req, res) => {
//   const { numberId } = req.params;

//   // Validate numberId
//   if (!VALID_IDS.includes(numberId)) {
//     return res.status(400).json({ error: 'Invalid number ID. Use p, f, e, or r.' });
//   }

//   // Store previous state
//   const windowPrevState = [...numberWindow];

//   // Fetch new numbers
//   const newNumbers = await fetchNumbers(numberId);

//   // Update window with unique numbers
//   const uniqueNewNumbers = [...new Set(newNumbers)]; 
//   numberWindow = [...numberWindow, ...uniqueNewNumbers];

//   // Ensure window size does not exceed WINDOW_SIZE
//   if (numberWindow.length > WINDOW_SIZE) {
//     numberWindow = numberWindow.slice(numberWindow.length - WINDOW_SIZE);
//   }

//   // Calculate average
//   const avg = calculateAverage(numberWindow);

//   // Prepare response
//   const response = {
//     windowPrevState,
//     windowCurrState: numberWindow,
//     numbers: newNumbers,
//     avg
//   };

//   res.json(response);
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });


const express = require('express');
const axios = require('axios');
require('dotenv').config();


const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
let window = [];


const apiMap = {
    p: "http://20.244.56.144/evaluation-service/primes",
    f: "http://20.244.56.144/evaluation-service/fibo",
    e: "http://20.244.56.144/evaluation-service/even",
    r: "http://20.244.56.144/evaluation-service/rand"
};

const fetchNumbers = async (type) => {
    try {
        const response = await axios.get(apiMap[type], {
  headers: {
    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
  },
  timeout: 500
});

        return response.data.numbers || [];
    } catch (error) {
        console.error(`Fetch error for type '${type}':`, error.message);
        return [];
    }
};

app.get('/numbers/:numberid', async (req, res) => {
    const type = req.params.numberid;
    const prevWindow = [...window];

    if (!apiMap[type]) {
        return res.status(400).json({ error: "Invalid number ID. Use p, f, e, or r." });
    }

    const start = Date.now();
    const numbers = await fetchNumbers(type);
    const duration = Date.now() - start;

    if (duration > 500) {
        return res.json({
            windowPrevState: prevWindow,
            windowCurrState: prevWindow,
            numbers: [],
            avg: calculateAverage(prevWindow)
        });
    }

    for (let num of numbers) {
        if (!window.includes(num)) {
            window.push(num);
        }
    }

    if (window.length > WINDOW_SIZE) {
        window = window.slice(window.length - WINDOW_SIZE);
    }

    const avg = calculateAverage(window);

    res.json({
        windowPrevState: prevWindow,
        windowCurrState: window,
        numbers,
        avg: parseFloat(avg.toFixed(2))
    });
});

const calculateAverage = (arr) => {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
};

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});
