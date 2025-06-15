const express = require("express");
const app = express();

// Middleware to parse incoming POST data (from Twilio)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

console.log('I am in server');

// Add webhook route
app.post("/webhook/incoming", (req, res) => {
  console.log("Message received:");
  console.log("From:", req.body.From);
  console.log("Message:", req.body.Body);

  return res.json({ message: "Message received" });
});

// Start the server
app.listen(3000, () => {
  console.log("App listening on port 3000");
});
