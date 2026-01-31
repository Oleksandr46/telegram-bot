const { mainMenu, honeyMenu } = require("./menus");
const { products } = require("./products");

function handleOrder(bot, msg, user) {
  const chatId = msg.chat.id;
  const text = msg.text;

  // ІМʼЯ
  if (user.orderStep === "name") {
    user.order.name = text;
    user.orderStep = "phone";
    return bot.sendMessage(chatId, "📞 Вкажіть телефон:");
  }

  // ТЕЛЕФОН
  if (user.orderStep === "phone") {
    user.order.phone = text;
    user.orderStep = "product";
    return bot.sendMessage(chatId, "🍯 Оберіть мед:", {
      reply_markup: honeyMenu(user.lang),
    });
  }

  // ПРОДУКТ
  if (user.orderStep === "product") {
    user.cart[text] = (user.cart[text] || 0) + 1;

    return bot.sendMessage(chatId, "➕ Додано в кошик. Оберіть ще або ⬅ Назад");
  }
}

function buildOrderSummary(user) {
  let total = 0;
  let text = "🧾 *Ваше замовлення:*\n\n";

  for (const item in user.cart) {
    const qty = user.cart[item];
    const price = products[user.lang][item].price;
    const sum = qty * price;
    total += sum;

    text += `${item} × ${qty} = ${sum}€\n`;
  }

  text += `\n💰 *Разом: ${total}€*`;
  return text;
}

module.exports = { handleOrder, buildOrderSummary };
