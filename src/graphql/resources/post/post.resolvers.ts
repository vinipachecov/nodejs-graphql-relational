import { GraphQLResolveInfo } from 'graphql';
import { DbConnection } from '../../../interfaces/DbConnectionIterface';
import { PostInstance } from '../../../models/PostModel';
import { Transaction } from 'sequelize';
import { parse } from 'url';
import { handleError, throwError } from '../../../utils/utils';
import { compose } from '../../composable/composable.resolver';
import { authResolvers } from '../../composable/auth.resolver';
import { AuthUser } from '../../../interfaces/AuthUserInterface';

export const postResolvers = {

  Post: {
    author: (post, {id}, {db}: {db: DbConnection}, info: GraphQLResolveInfo)=> {
      return db.Post
        .findById(post.get('author'))
        .catch(handleError);
    },
    
    comments: (post, {first = 10, offset = 0}, {db}: {db: DbConnection}, info: GraphQLResolveInfo)=> {
      return db.Comment
        .findAll({
          where: {post: post.get('id')},
          limit: first,
          offset: offset
        }).catch(handleError);
    },
  },

  Query: {
    
    posts: (parent, {first = 10, offset = 0}, {db}: {db: DbConnection}, info: GraphQLResolveInfo)=> {
      return db.Post
        .findAll({
          limit: first,
          offset: offset
        }).catch(handleError);
    },
    post: (parent, { id }, {db}: {db: DbConnection}, info: GraphQLResolveInfo)=> {
      id = parseInt(id);
      return db.Post
        .findById(id)
        .then((post : PostInstance) => {
          throwError(!post, `POst with id ${id} not found!`);
          
          return post;
        }).catch(handleError);;
    }
  },

  Mutation: {

    createPost: compose(...authResolvers)((parent, { input }, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo)=> {      
      input.author = authUser.id;
      return db.sequelize.transaction((t: Transaction) => {
        return db.Post
          .create(input, {transaction: t});
      }).catch(handleError);
    }),

    updatePost: compose(...authResolvers)((parent, {id,  input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo)=> {            
      //id do post
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Post.findById(id)
          .then((post: PostInstance) => {
            throwError(!post,`Post with id ${id} not found!`);
            throwError(post.get('author') != authUser.id, `Unauthorized! You can only edit posts you created.`);

            input.author = authUser.id
            return post.update(input, {transaction: t});
          })                
      }).catch(handleError);
    }),

    deletePost: compose(...authResolvers)((parent, {id}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo)=> {
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Post.findById(id)
          .then((post: PostInstance) => {
            throwError(!post, `POst with id ${id} not found!`);
            throwError(post.get('author') != authUser.id, `Unauthorized! You can only edit posts you created.`);
            return post.destroy({transaction: t})
              .then(post => !!post);
          })                
      }).catch(handleError);
    })
  }
}