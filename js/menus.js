function languageMenu() {
  return {
    keyboard: [["🇺🇦 Українська", "🇵🇱 Polski"]],
    resize_keyboard: true,
  };
}

function mainMenu(lang) {
  const menus = {
    ua: [["🍯 Види меду"], ["🛒 Замовити"]],
    pl: [["🍯 Rodzaje miodu"], ["🛒 Zamów"]],
  };

  return {
    keyboard: [...menus[lang], ["🏠 Головне меню"]],
    resize_keyboard: true,
  };
}

function honeyMenu(lang) {
  const honeys = {
    ua: [["🍯 Липовий мед"], ["🍯 Акацієвий мед"]],
    pl: [["🍯 Lipowy"], ["🍯 Akacjowy"]],
  };

  return {
    keyboard: [...honeys[lang], ["⬅ Назад"]],
    resize_keyboard: true,
  };
}

function confirmMenu() {
  return {
    keyboard: [["✅ Підтвердити"], ["⬅ Назад"]],
    resize_keyboard: true,
  };
}

module.exports = { languageMenu, mainMenu, honeyMenu, confirmMenu };
