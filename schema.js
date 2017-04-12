import { createResolver } from 'apollo-resolvers';
import { createError, isInstance } from 'apollo-errors';
import { makeExecutableSchema } from 'graphql-tools';

import schema from './schema.graphql';

import {
  UnknownError,
  UnauthorizedError,
  AlreadyAuthenticatedError,
  ForbiddenError
} from './errors';


// Abstract resolvers ////////////////////////////////////////

const baseResolver = createResolver(
  null,
  (root, args, context, err) => {
    if (isInstance(err)) {
      return err;
    }
    return new UnknownError({
      data: {
        name: err.name
      }
    });
  }
);

const isAuthenticatedResolver = rootResolver.createResolver(
  (root, args, context) => {
    const { user } = context;
    
    if (!user) throw new UnauthorizedError();
  }
);

const isNotAuthenticatedResolver = baseResolver.createResolver(
  (root, args, context) => {
    const { user } = context;
    
    if (user) throw new AlreadyAuthenticatedError();
  }
);

const isAdminResolver = isAuthenticatedResolver.createResolver(
  (root, args, context) => {
    const { user } = context;
    
    if (!user.isAdmin) throw new ForbiddenError();
  }
);






// Functional resolvers ///////////////////////////

const getMyUser = isAuthenticatedResolver.createResolver(
  (root, args, context) => {
    const { user } = context;
    return user; 
  }
);

const register = isNotAuthenticatedResolver.createResolver(
  async (root, args, context) => {
    const { models: { UserModel } } = context;
    
    const { name, email, password } = args;
    
    const user = await UserModel.register({
      name,
      email,
      password
    });
    
    context.user = user;
    
    return user;
  }
)

const login = isNotAuthenticatedResolver.createResolver(
  async (root, args, context) => {
    const { models: { UserModel } } = context;
    
    const { email, password } = args;
    
    const user = await UserModel.login({
      email,
      password
    });
    
    context.user = user;
    
    return user;
  }
)

const updateProfile = isAuthenticatedResolver.createResolver(
  (root, args, context) => {
    const { user, models: { UserModel } } = context;
    
    const { name, email } = args;
    
    return UserModel.update(user, {
      name,
      email
    });
  }
);

const banUser = isAdminResolver.createResolver(
  (root, args, context) => {
    const { models: { UserModel } } = context;
    const { id } = args;
    
    return UserModel.ban(id);
  }
);



// Schema creation

const typeDefs = [ schema ];

const resolvers = {
  Query: {
    getMyUser
  },
  Mutation: {
    register,
    updateProfile,
    banUser
  }
};

export default makeExecutableSchema({
  typeDefs,
  resolvers
});
