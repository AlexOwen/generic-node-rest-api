'use strict';

// Load environment variables
require('dotenv').config();

// Load the config file
global.config = require('./config.js');

// Load other libraries

// Web server
const Koa = require('koa'),
  Router = require('koa-router'),
  router = new Router(),

  // Body parser
  bodyParser = require('koa-bodyparser'),

  // JWT libraries
  jwt = require('koa-jwt'),
  jsonwebtoken = require('jsonwebtoken'),

  // Hardening
  helmet = require('koa-helmet');

// Start the server
const app = new Koa(),
  port = process.env.PORT || 8080;

// Enable helmet
app.use(helmet());

// Any paths that don't need JWT authentication
const jwtExceptions = ['/login'];

// Hide 401 errors as 404 errors, it's safer to not tell attackers there's something here
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (401 == err.status) {
      this.status = 404;
    } else {
      throw err;
    }
  }
});

// Init JWT
app.use(jwt({secret: process.env.JWT_KEY}).unless({path: jwtExceptions}));

// Parse the request's body
app.use(bodyParser());

// An eample login function
const login = async (userID, apiKey) => {
  let user = null;

  // Lookup apiKey - TODO: replace with actual authentication logic
  let valid = true;

  // If the key matches
  if (valid) {
    user = {
      _id: 'example',
      role: 'admin'
    };
  }

  return user;
};

// Routes

// An example login route that returns a JWT
router.get('/login', async (ctx) => {
  let body = {};
  if (ctx.request.body) {
    const user = await login(body.user_id, body.api_key);
    if (user !== null) {
      // Encode the user's role etc. in the JWT and return it
      body = {
        token: jsonwebtoken.sign({
          role: user.role,
          user_id: user._id
        }, process.env.JWT_KEY, {algorithm: 'HS512'})
      };
    } else {
      ctx.throw(403, 'Incorrect API key');
    }
  } else {
    ctx.throw(400, 'Missing API key');
  }
  ctx.body = body;
});

// An example authentication function
const authenticate = user_id => {
  let allow = false;

  if (user_id === 'example') {
    allow = true;
  }

  return allow;
};

// An example of a route that returns a value if supplied with a valid JWT_KEY
router.get('/user_profile', async (ctx) => {
  if (authenticate(ctx.state.user.user_id)) {
    ctx.body = `User ID: ${ctx.state.user.user_id}`;
    ctx.response.status = 200;
  }
});

app.use(router.routes());


// Start the web server, and any other pre-start functions (e.g. database init)
const init = () => {
  // Start the web server
  return app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
  });
};

init();
