const express = require("express");
const app = express();

// Middleware to parse incoming POST data (from Twilio)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

console.log('I am in server');
// Your AccountSID and Auth Token from console.twilio.com
const accountSid = process.env.ACCOUNTSID ;
const authToken = process.env.AUTHTOKEN ;

const client = require('twilio')(accountSid, authToken);

// Sample user schema
let userDetails = [
  { number: '+98767', name: "Nitesh", address: "", age: null }
];

function sendMessageToUser(msg, to) {
  client.messages
    .create({
      body: msg,
      to: to,
      from: 'whatsapp:+14155238886' // Twilio WhatsApp number
    })
    .then((message) => console.log("Message SID:", message.sid))
    .catch(err => console.error(err));
}

app.get('/whatsapp', (req, res) => {
  return res.json({ message: "App is working fine" });
});

// Main webhook handler
app.post("/webhook/incoming", (req, res) => {
  const from = req.body.From.replace('whatsapp:', '');
  const message = req.body.Body.trim().toLowerCase();

  let user = userDetails.find(u => u.number === from);

  if (!user) {
    // If user not found, create new and ask name
    userDetails.push({ number: from, name: "", age: null, address: "" });
    sendMessageToUser("👋 Hi! What’s your name?", `whatsapp:${from}`);
    return res.sendStatus(200);
  }

  // Switch logic to collect missing info
  switch (true) {
    case !user.name:
      user.name = message;
      sendMessageToUser(`Nice to meet you, ${user.name}! What's your age?`, `whatsapp:${from}`);
      break;

    case !user.age:
      if (!isNaN(parseInt(message))) {
        user.age = parseInt(message);
        sendMessageToUser("Got it! What's your address?", `whatsapp:${from}`);
      } else {
        sendMessageToUser("Please enter a valid age in numbers.", `whatsapp:${from}`);
      }
      break;

    case !user.address:
      user.address = message;
      sendMessageToUser(`Thanks ${user.name}, you're all set! 🎉`, `whatsapp:${from}`);
      break;

    default:
      sendMessageToUser(`Hi ${user.name}, we've already recorded your details. ✅`, `whatsapp:${from}`);
  }

  return res.sendStatus(200);
});

// Trigger message from backend if needed
app.post('/message', (req, res) => {
  sendMessageToUser(req.body.msg, req.body.to);
  res.json({ status: "Message sent" });
});

app.listen(3000, () => {
  console.log("App listening on port 3000");
  sendMessageToUser('mESSAGE SENT WORKING','whatsapp:+9779844253789')
});

