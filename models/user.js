const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 30 },
  avatar: {
    type: String,
    required: [true, "Avatar is required"],
    validate: {
      validator(value) {
        return validator.isURL(value);
      },
      message: "Invalid avatar URL",
    },
  },
});

const User = mongoose.model("user", userSchema);

module.exports = User;
