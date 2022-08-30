const { AuthenticationError } = require("apollo-server-express");
const { async } = require("rxjs");
const { User, Book } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, arg, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      } else {
        throw new AuthenticationError("You must log in first");
      }
    },
  },
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
    addBook: async (parent, book, context) => {
      if (context.user) {
        const updateBook = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: book.input } }
        );
        return updateBook;
      } else {
        throw new AuthenticationError("You must log in first");
      }
    },
    removeBook: async (parent, book, context) => {
      if (context.user) {
        const data = await User.findOneAndReplace(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: book.bookId } } }
        );
        return data;
      } else {
        throw new AuthenticationError("You must log in first");
      }
    },
  },
};
module.exports = resolvers;
