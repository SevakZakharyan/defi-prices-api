# ️ DeFi Prices API

<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
A simple <a href="http://nodejs.org" target="_blank">Node.js</a> + <a href="https://nestjs.com/" target="_blank">NestJS</a> application that provides Ethereum gas prices and Uniswap V2 quotes via clean and efficient APIs.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank">
    <img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank">
    <img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" />
  </a>
  <a href="https://www.npmjs.com/package/@nestjs/common" target="_blank">
    <img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" />
  </a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank">
    <img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" />
  </a>
</p>

---

## Description

This project exposes two endpoints:

- `GET /gasPrice` → Returns the latest Ethereum gas price (cached and refreshed every 2.5s).  
- `GET /return/:fromTokenAddress/:toTokenAddress/:amountIn` → Estimates output amount for a Uniswap V2 swap using **off-chain calculation** (reserves + AMM formula).  

Built with **NestJS**, **Ethers.js**, caching, validation, and logging.

---

## ⚙️ Project setup

Clone the repository and install dependencies:

```bash
$ npm install
```

Copy the example environment file and adjust values (**provide your own RPC URL**):

```bash
$ cp .env.example .env
```

Example:

```env
PORT=3000
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

⚠️ **Important:**
- You must provide your own **Ethereum RPC URL** from [Alchemy](https://www.alchemy.com/), [Infura](https://www.infura.io/), or another provider.
- Update the `.env` file with your values. Example:

---

##  Run the project

### Development

```bash
$ npm run start
```

### Watch mode

```bash
$ npm run start:dev
```

### Production mode

```bash
$ npm run build
$ npm run start:prod
```

---

## Run with Docker Compose

A `docker-compose.yml` is provided for quick bootstrap.

```bash
$ docker-compose up --build
```

This will build and start the app on `http://localhost:3000`.

---

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

---

## API Endpoints

### Get Gas Price

```http
GET /gasPrice
```

Response:

```json
{
  "gasPrice": "1234567890"
}
```

---

### Get Uniswap V2 Quote

```http
GET /return/:fromTokenAddress/:toTokenAddress/:amountIn
```

Example:

```http
GET /return/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/1000000000000000000
```

Response:

```json
{
  "amountOut": "222342642109316699"
}
```

## 📘

- Swap calculation uses **Uniswap V2 formula** (no on-chain helpers).  
- Caching ensures `/gasPrice` responds in <50ms.  
- Works with any Ethereum RPC provider (Alchemy, Infura, etc).  

---
# defi-prices-api
