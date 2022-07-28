# Price Alert bot built with Sif-APIs

## Overview

A Telegram bot that allows users to choose a token and a target price and alert them when the token price is either below, above or equal to the target price.

### How to use:

Set up [Sif-APIs](https://github.com/Sifchain/sif-apis)

1. Clone the repository:
```
git clone https://github.com/hungng157/sif-price-alert-bot
```

2. Set up the bot in [BotFather](https://core.telegram.org/bots#6-botfather) in Telegram and put the token inside the .env file as in .env-example

3. Run the bot
```
cd sif-price-alert-bot
node index.js
```

### Bot commands:

```/help```: Get the information about the features of the bot

```/alert [token] [> | < | =] [target_price]```: Set the price alert for specific token, in USD. 

For example, ```/alert eth < 1000 ```, the bot will notify when the price of eth is lower than $1000.

### Further notes:
Notice that the price of the tokens is in the Sifchain DEX.

