const users = {};

function getUser(chatId) {
  if (!users[chatId]) {
    users[chatId] = {
      lang: null,
      mode: "menu", // menu | order
      orderStep: null, // name | phone
      cart: [], // 🧺 корзина
      order: {}, // дані клієнта
    };
  }
  return users[chatId];
}

module.exports = { getUser };
