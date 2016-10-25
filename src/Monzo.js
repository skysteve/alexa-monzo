/**
 * Created by steve on 24/10/2016.
 */
const fetch = require('node-fetch');

const baseURL = 'https://api.monzo.com';

// Map currency codes to the real word units and decimal names
const mapCurrency = {
  gbp: ['pounds', 'pence'],
  eur: ['euros', 'cents'],
  usd: ['dollars', 'cents']
};

/**
 * Helper function to include auth token and parse response as JSON
 * @param urlPath {string} the path to append to the base url
 * @param token {string} the auth token
 * @returns {Promise<object>} promise which returns a JSON response from the api
 */
function makeRequest(urlPath, token) {
  return fetch(`${baseURL}/url`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(result => result.json());
}

export class Monzo {

  constructor(token) {
    this.token = token;
  }

  getBalance() {
    return makeRequest('balance', this.token)
    .then((result) => {
      const balance = result.balance / 100;
      const spentToday = result.spend_today / 100;

      result.currency = mapCurrency[result.currency.toLowerCase()];

      // monzo returns us balance in pence, convert to units and decimals.
      result.balance = {
        units: Math.floor(balance),
        decimal: Math.round((balance % 1) * 100)
      };

      result.spend_today = {
        units: Math.floor(spentToday),
        decimal: Math.round((balance % 1) * 100)
      };

      return result;
    })
    .then((result) => {
      // e.g. "Your account balance is 15 pounds 24 pence. Today you have spent 3 pounds 18 pence"
      return `Your account balance is ${result.balance.units} ${result.currency[0]} ${result.balance.decimal} ${result.currency[1]}.
      Today you have spent ${result.spend_today.units} ${result.currency[0]} ${result.spend_today.decimal} ${result.currency[1]}`;
    });
  }
}
