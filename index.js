import express from 'express';
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import { graphqlExpress } from 'graphql-server-express';
import { formatError } from 'apollo-errors';
import { createExpressContext } from 'apollo-resolvers';
import { GraphQLError } from 'graphql';

import { UserModel } from './models';

import schema from './schema';

const app = express();

const auth = async (req, res, next) => {
  const User = new UserModel(null);
  if (req.cookies.token) {  
    req.user = await User.authenticate(req.cookies.token);
  } else {
    req.user = null;
  }
  next();
};

app.use('/graphql',
  cookieParser(),
  json(),
  auth,
  graphqlExpress((req, res) => {
    const { user } = req;
    
    const models = {
      User: new UserModel(user)
    };
    
    const context = createExpressContext({
      models,
      user
    }, res);

    return {
      schema,
      formatError,
      context
    };
  })
)
