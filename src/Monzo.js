/**
 * Created by steve on 24/10/2016.
 */
import fetch from 'node-fetch';

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
  console.log(`***** MAKING REQUEST TO ${urlPath} *********`);
  return fetch(`${baseURL}/${urlPath}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(result => result.json());
}

export class Monzo {

  constructor(token, sessionAttrs) {
    this.token = token;
    if (sessionAttrs) {
      console.log('***** RECOVERING ACCOUNT ID FROM SESSION', sessionAttrs);
      this.accountId = sessionAttrs.monzoAccountId || undefined;
    }
  }

  getAccountId() {
    if (this.accountId) {
      return Promise.resolve(this.accountId);
    }

    return makeRequest('accounts', this.token)
      .then((result) => {
        if (!result || !result.accounts) {
          console.log(JSON.stringify(result, null, 4));
          return 'Failed to read response, please ensure your account is linked in the app';
        }
        return result.accounts[0].id;
      })
      .then((accountId) => {
        this.accountId = accountId;
        return accountId;
      });
  }

  getBalance() {
    return this.getAccountId()
      .then(accountId => makeRequest(`balance?account_id=${accountId}`, this.token))
      .then((result) => {
        if (!result || !result.balance) {
          return 'Failed to read response, please ensure your account is linked in the app';
        }
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
          decimal: Math.round((spentToday % 1) * 100)
        };

        return result;
      })
      .then((result) => {
        if (typeof result === 'string') {
          return result;
        }
        // e.g. "Your account balance is 15 pounds 24 pence. Today you have spent 3 pounds 18 pence"
        return `Your account balance is ${result.balance.units} ${result.currency[0]} ${result.balance.decimal} ${result.currency[1]}.
      Today you have spent ${result.spend_today.units} ${result.currency[0]} ${result.spend_today.decimal} ${result.currency[1]}`;
      });
  }

  getTransactions(start, end, limit) {
    return this.getAccountId()
      .then((accountId) => {
        let url = `transactions?account_id=${accountId}`;

        if (start) {
          url += `&since=${start}`;
        }

        if (end) {
          url += `&before=${end}`;
        }

        if (!limit) {
          limit = 3;
        }

        url += `&limit=${limit}`;

        return makeRequest(url, this.token);
      })
      .then((result) => {
        if (!result || !result.transactions) {
          console.log(JSON.stringify(result, null, 4));
          return 'Failed to read response, please ensure your account is linked in the app';
        }

        const transactions = result.transactions;

        if (transactions.length < 1) {
          return 'There are no transactions for that period';
        }

        let response = 'Your transactions are follows: ';

        response += transactions.map((transaction) => {
          const amount = Math.abs(transaction.amount) / 100;
          const currency = mapCurrency[transaction.currency.toLowerCase()];

          transaction.amount = {
            units: Math.floor(amount),
            decimal: Math.round((amount % 1) * 100)
          };

          return `${transaction.description}: ${transaction.balance.units} ${currency[0]} ${transaction.balance.decimal} ${currency[1]}`;
        }).join(', ');

        return response;
      });
  }

}
