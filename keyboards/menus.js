function languageMenu() {
  return {
    keyboard: [["🇺🇦 Українська", "🇵🇱 Polski"]],
    resize_keyboard: true,
  };
}

function mainMenu(lang) {
  const menus = {
    ua: ["🍯 Види меду", "🤖 Консультант", "🛒 Замовити"],
    pl: ["🍯 Rodzaje miodu", "🤖 Konsultant", "🛒 Zamów"],
  };

  return {
    keyboard: [...menus[lang].map(b => [b]), ["🏠 Головне меню"]],
    resize_keyboard: true,
  };
}

module.exports = { mainMenu, languageMenu };
