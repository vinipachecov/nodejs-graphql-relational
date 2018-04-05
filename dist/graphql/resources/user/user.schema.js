"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userTypes = `

  
  type User {
    id: ID!,
    name: String!
    email: String!
    photo: String
    createdAt: String!
    updatedAt: String!
    posts(first: Int, offset: Int): [ Post! ]!
  }
  
  # Para criar um usuário
  input UserCreateInput {
    name: String!
    email: String!
    password: String!
  }

  # Para atualizar um usuário
  input UserUpdateInput {
    name: String!
    email: String! 
    photo: String!
  }

  # Alteração de senhas
  input UserUpdatePassInput {
    password: String!
  }
`;
exports.userTypes = userTypes;
const userQueries = `
  users(first: Int, offset: Int): [ User! ]!
  user(id: ID!): User
  currentUser: User
`;
exports.userQueries = userQueries;
const userMutations = `
  # usando os inputs criados anteriormente
  createUser(input: UserCreateInput!): User
  updateUser(input: UserUpdateInput!): User
  updateUserPassword(input: UserUpdatePassInput!): Boolean
  deleteUser: Boolean
`;
exports.userMutations = userMutations;