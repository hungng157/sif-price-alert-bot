require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");

const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: true });

let chatId;
let tokensAlerted = {
  'rowan': {
    priceInUSD: null,
    belowTarget: null,
    aboveTarget: null,
    equalTarget: null
  }
}
 
const getRowanToUSD = async () => {
  try {
    const response = await fetch('http://localhost:8080/asset/tokenStats');
    const data = await response.json();
    const rowanToUSD = Number(data['body']['rowanUSD']);
    return rowanToUSD;
  } catch (err) {
    console.log(err);
  }
}

const getTokenToUSD = async (token) => {
  try {
    const response = await fetch('http://localhost:8080/asset/tokenStats');
    const data = await response.json();
    const tokenData = data['body']['pools'].filter(item => item['symbol'] === token);
    const tokenToUSD = Number(tokenData[0]['priceToken']);
    return tokenToUSD;
  } catch (err) {
    console.log(err);
  }
}

const getTokenPrice = async (token) => {
  if (token === 'rowan') {
    return getRowanToUSD();
  }
  return getTokenToUSD(token);
}

const alertTokenPrice = async (token, getTokenPriceFunc) => {
  if (!chatId) {
    return;
  }
  tokensAlerted[token].priceInUSD = await getTokenPriceFunc(token);
  if (tokensAlerted[token].belowTarget && tokensAlerted[token].priceInUSD < tokensAlerted[token].belowTarget) {
    bot.sendMessage(chatId, 
      `${token} price now is $${tokensAlerted[token].priceInUSD}, which is below your target of $${tokensAlerted[token].belowTarget}`
    );
    tokensAlerted[token].belowTarget = null;
  }
  if (tokensAlerted[token].aboveTarget && tokensAlerted[token].priceInUSD > tokensAlerted[token].aboveTarget) {
    bot.sendMessage(chatId, 
      `${token} price now is $${tokensAlerted[token].priceInUSD}, which is above your target of $${tokensAlerted[token].aboveTarget}`
    );
    tokensAlerted[token].aboveTarget = null;
  }
  if (tokensAlerted[token].equalTarget && tokensAlerted[token].priceInUSD == tokensAlerted[token].equalTarget) {
    bot.sendMessage(chatId, 
      `${token} price now is $${tokensAlerted[token].priceInUSD}, which is equal to your target of $${tokensAlerted[token].equalTarget}`
    );
    tokensAlerted[token].equalTarget = null;
  }
}


const alertTokens = () => {
  const allTokens = Object.keys(tokensAlerted);
  allTokens.forEach(token => {
    alertTokenPrice(token, getTokenPrice)
  })
}

setInterval(alertTokens, 1000);

bot.onText(/\/help/, async (msg) => {
  const { chat: { id }, _text } = msg;
  try {
    bot.sendMessage(id, 
      "Hello, I am a Sifchain Telegram bot.\nYou can control me by sending these commands:\n\n/alert [token] [(> < =)] [target_price]: Alert when the price of the token is less, more than or equal to the target price in USD\n\nExample:\n /alert rowan > 0.006:  Alert when the price of rowan is larger than $0.006");
  } catch (err) {
    console.log(err);
  }
})

bot.onText(/\/alert/, async (msg) => {
  const { chat: { id }, text } = msg;
  chatId = id;
  const msgText = text.replace("/","")
  const msgTextArray = msgText.split(" ");
  if (msgTextArray.length != 4) {
    bot.sendMessage(id, "Please enter the following format: /alert [token] [(> < =)] [target_price]");
    return;
  }
  const token = msgTextArray[1];
  const symbol = msgTextArray[2];

  if (!(token in tokensAlerted)) {
    tokensAlerted[token] = {
      priceInUSD: null,
      belowTarget: null,
      aboveTarget: null,
      equalTarget: null
    }
  }

  if (symbol === '>') {
    tokensAlerted[token].aboveTarget = Number(msgTextArray[3]);
  }
  if (symbol === '<') {
    tokensAlerted[token].belowTarget = Number(msgTextArray[3]);
  }
  if (symbol === "=") {
    tokensAlerted[token].equalTarget = Number(msgTextArray[3]);
  }
})

