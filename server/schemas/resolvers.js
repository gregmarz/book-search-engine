const { AuthenticationError } = require("apollo-server-express");
const { async } = require("rxjs");
const { User, Book } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {},
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("There is no user with that email");
      }
      const correctPass = await User.isCorrectPassword(password);
      if (!correctPass) {
        throw new AuthenticationError("Password is incorrect");
      }
      const token = signToken(user);
      return { user, token };
    },
  },
};
module.exports = resolvers;
