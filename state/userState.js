const users = {};
function getUser(chatId) {
  if (!users[chatId]) {
    users[chatId] = {
      lang: null,
      mode: "menu", // menu | ai | order
      orderStep: null, // 👈 ДОДАТИ
      order: {}, // дані замовлення
      aiCount: 0,
    };
  }
  return users[chatId];
}
module.exports = { users, getUser };
