import User from "../models/User.js";
import { ApolloError } from "apollo-server-errors";
import pkg from "bcryptjs";
const { hash, compare } = pkg;
// import { sign } from "jsonwebtoken"
import { default as jsonPkg } from "jsonwebtoken";
const { sign } = jsonPkg;

const resolvers = {
  Query: {
    user: (_, { ID }) => findById(ID),
  },
  Mutation: {
    registerUser: async (
      _,
      { registerInput: { username, email, password } }
    ) => {
      const oldUser = await findOne({ email });

      if (oldUser) {
        throw new ApolloError(
          "A user is already registered with the email" + email,
          "USER_ALREADY_EXISTS"
        );
      }

      let hashedPassword = await hash(password, 10);

      const newUser = new User({
        username: username,
        email: email.toLowerCase(),
        password: hashedPassword,
      });

      const token = sign({ user_id: newUser._id, email }, "UNSAFE_STRING", {
        expiresIn: "2h",
      });

      newUser.token = token;
      const res = await newUser.save();
      return {
        id: res.id,
        ...res._doc,
      };
    },
    loginUser: async (_, { loginInput: { email, password } }) => {
      const user = await findOne({ email });

      if (user && (await compare(password, user.password))) {
        const token = sign({ user_id: user._id, email }, "UNSAFE_STRING", {
          expiresIn: "2h",
        });
        user.token = token;
        return {
          id: user.id,
          ...user._doc,
        };
      } else {
        throw new ApolloError("Incorrect password", "INCORRECT_PASSWORD");
      }
    },
  },
};

export default resolvers;

// export const resolvers = {
//   Mutation: {
//     registerUser: async (
//       _,
//       { registerInput: { username, email, password } }
//     ) => {
//       const oldUser = await findOne({ email });

//       if (oldUser) {
//         throw new ApolloError(
//           "A user is already registered with the email" + email,
//           "USER_ALREADY_EXISTS"
//         );
//       }

//       let hashedPassword = await hash(password, 10);

//       const newUser = new User({
//         username: username,
//         email: email.toLowerCase(),
//         password: hashedPassword,
//       });

//       const token = sign({ user_id: newUser._id, email }, "UNSAFE_STRING", {
//         expiresIn: "2h",
//       });

//       newUser.token = token;
//       const res = await newUser.save();
//       return {
//         id: res.id,
//         ...res._doc,
//       };
//     },
//     loginUser: async (_, { loginInput: { email, password } }) => {
//       const user = await findOne({ email });

//       if (user && (await compare(password, user.password))) {
//         const token = sign({ user_id: user._id, email }, "UNSAFE_STRING", {
//           expiresIn: "2h",
//         });
//         user.token = token;
//         return {
//           id: user.id,
//           ...user._doc,
//         };
//       } else {
//         throw new ApolloError("Incorrect password", "INCORRECT_PASSWORD");
//       }
//     },
//   },
//   Query: {
//     user: (_, { ID }) => findById(ID),
//   },
// };
