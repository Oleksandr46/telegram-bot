function resetUser(user) {
  user.mode = "menu";
  user.orderStep = null;
  user.order = {};
}

module.exports = { resetUser };
