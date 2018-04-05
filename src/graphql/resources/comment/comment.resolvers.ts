import { GraphQLResolveInfo } from 'graphql';
import { DbConnection } from '../../../interfaces/DbConnectionIterface';
import { Transaction } from 'sequelize';
import { CommentInstance } from '../../../models/CommentModel';
import { handleError, throwError } from '../../../utils/utils';
import { compose } from '../../../graphql/composable/composable.resolver';
import { authResolvers } from '../../composable/auth.resolver';
import { AuthUser } from '../../../interfaces/AuthUserInterface';
export const commentResolvers = {

  Comment: {
    // non trivial resolvers
    user: (comment, {args}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
      return db.User
      .findById(comment.get('user'))
      .catch(handleError);
    },
    post: (comment, {args}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
      return db.Post
      .findById(comment.get('user'))
      .catch(handleError);
    },

  },

  Query: {
    commentsByPost: (parent, {postId, first = 10, offset = 0}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
      postId = parseInt(postId);
      return db.Comment
      .findAll({
        where: {post: postId},
        limit: first,
        offset: offset
      })
      .catch(handleError);
    }
  },

  Mutation: {
    // createComment(input: CommentInput!): Comment
    // updateComment(id: ID!, input: CommentInput!): Comment
    // deleteComment(id: ID!): Boolean

    createComment: compose(...authResolvers)((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
      input.user = authUser.id;
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment
          .create(input, {transaction: t});
      }).catch(handleError);
    }),

    updateComment: compose(...authResolvers)((parent, {id, input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {      
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment.findById(id)
        .then((comment: CommentInstance) => {
          throwError(!comment, `comment with id ${id} not found!`);
          throwError(comment.get('user') != authUser.id, `Unauthorized! You can only edit posts you created.`);                    
          // do the actual update
          
          return comment.update(input, {transaction: t});
        });
      }).catch(handleError);;
    }),

    deleteComment: compose(...authResolvers)((parent, {id,}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment.findById(id)
        .then((comment: CommentInstance) => {                    
          throwError(!comment, `comment with id ${id} not found!`);
          throwError(comment.get('user') != authUser.id, `Unauthorized! You can only edit posts you created.`);                    
          // do the actual update
          return comment.destroy({transaction: t})
            .then((comment) => !!comment);
        });
      }).catch(handleError);;
    })
  }
}