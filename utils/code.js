const shortid = require('shortid');

function generateOrderCode() {
    const orderCode = shortid.generate().substr(0, 8);
    return orderCode;
}

function generateRandomChars(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let randomChars = '';
    for (let i = 0; i < length; i++) {
        randomChars += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomChars;
}

module.exports = { generateOrderCode, generateRandomChars }