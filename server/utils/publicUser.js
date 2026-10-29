module.exports = (u) => ({
  id: u._id, name: u.name, email: u.email, role: u.role, avatar: u.avatar,
  wishlist: (u.wishlist || []).map(String),
});
