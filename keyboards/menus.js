function languageMenu() {
  return {
    keyboard: [["🇺🇦 Українська", "🇵🇱 Polski"]],
    resize_keyboard: true,
  };
}

function mainMenu(lang) {
  const menus = {
    ua: [["🍯 Види меду"], ["🛒 Замовити"], ["🤖 Консультант"]],
    pl: [["🍯 Rodzaje miodu"], ["🛒 Zamów"], ["🤖 Konsultant"]],
  };

  return {
    keyboard: [...menus[lang], ["🏠 Головне меню"]],
    resize_keyboard: true,
  };
}

function honeyMenu(lang) {
  const honeys = {
    ua: [["🍯 Липовий мед"], ["🍯 Акацієвий мед"], ["🍯 Гречаний мед"]],
    pl: [["🍯 Lipowy"], ["🍯 Akacjowy"], ["🍯 Gryczany"]],
  };

  return {
    keyboard: [...honeys[lang], ["⬅ Назад"]],
    resize_keyboard: true,
  };
}

module.exports = {
  languageMenu,
  mainMenu,
  honeyMenu,
};
