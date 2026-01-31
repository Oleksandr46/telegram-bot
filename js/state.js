const users = {};

function getUser(chatId) {
  if (!users[chatId]) {
    users[chatId] = {
      lang: null,
      mode: "menu",
      orderStep: null,
      cart: {},
      order: {},
    };
  }
  return users[chatId];
}

module.exports = { getUser };
