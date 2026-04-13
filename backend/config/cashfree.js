const { Cashfree } = require('cashfree-pg');

const initCashfree = () => {
  Cashfree.XClientId = process.env.CASHFREE_APP_ID;
  Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
  Cashfree.XEnvironment =
    process.env.CASHFREE_ENV === 'PRODUCTION'
      ? Cashfree.Environment.PRODUCTION
      : Cashfree.Environment.SANDBOX;
  return Cashfree;
};

module.exports = { initCashfree, Cashfree };
