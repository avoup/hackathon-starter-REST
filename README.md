<p align="center">
  <img src="https://lh3.googleusercontent.com/Cxm8haaslJnyjRK4aHFGZj9G9E3mCaZKxQWE_qpKsOEfemtnBatPoKjlxguQoBJEa7Motm_5gCtYomnRqQ=w800-h414-rw-no">
</p>
Hackathon Starter REST
=======================

[![Dependency Status](https://david-dm.org/avoup/hackathon-starter-rest/status.svg?style=flat)](https://david-dm.org/avoup/hackathon-starter-rest) [![devDependencies Status](https://david-dm.org/avoup/hackathon-starter-rest/dev-status.svg)](https://david-dm.org/avoup/hackathon-starter-rest?type=dev) [![Build Status](https://travis-ci.com/avoup/hackathon-starter-rest.svg?branch=master)](https://travis-ci.com/avoup/hackathon-starter-rest)

Inspired by https://github.com/sahat/hackathon-starter


A boilerplate for **Node.js** REST api.

When starting a new project until you get to the best part of it you have to go through setting it up and adding all the necessary features like authentication with json web token, social authentication, deciding on json request/response format and the list goes on.

Goal of hackathon-starter-REST (HSR) is to skip through all this steps and get to the interesting part of a project quicker.

The code is as simple as it gets, it is thoroughly documented and can be easily changed to suit your needs.


Table of Contents
-----------------

- [Hackathon Starter REST](#hackathon-starter-rest)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
  - [API Keys](#api-keys)
  - [Project Structure](#project-structure)
  - [List of Packages](#list-of-packages)
    - [Dependencies](#dependencies)
    - [devDependencies](#devdependencies)
  - [API Endpoints, requests and responses](#api-endpoints-requests-and-responses)
  - [### Login](#-login)
  - [### Signup](#-signup)
  - [### Resend verification mail](#-resend-verification-mail)
  - [### Verify email](#-verify-email)
  - [### Forgot password](#-forgot-password)
  - [### Reset password](#-reset-password)
  - [Deployment](#deployment)
    - [Deployment to Heroku](#deployment-to-heroku)
    - [Hosted MongoDB Atlas](#hosted-mongodb-atlas)
  - [Contributing](#contributing)
  - [License](#license)

Features
--------

- **Local Authentication**
- **OAuth 2.0 Authentication**
  - Google
  - more will be added...
- **Account Management**
  - Forgot password
  - Reset password
  - Verification via email using jwt (sendgrid)
  - Auth via jwt
- **JSON:API request/response structure**
- **File upload**
- **Global error handler**

**Note**: list is not exhaustive and more features will be added.

Prerequisites
-------------

- [MongoDB](https://www.mongodb.com/download-center/community) *
- [Node.js](http://nodejs.org) *
- [Git](https://git-scm.com/)

**Note**: required prerequisites are marked by *

Getting Started
---------------

In your terminal type:

```bash
# Clone from Github
git clone https://github.com/avoup/hackathon-starter-REST.git myproject

# Change directory
cd myproject

# Install NPM dependencies
npm install

# Start your app
# Regularly
npm start
# In development mode (starts nodemon)
npm run dev
```

API Keys
------------------

In order to use OAuth methods and APIs in the project, you will have to obtain credentials and set them as environment variables in .env file.

**Note:** The app will read environment variables from .env file not .env.example file. You can use.env.example file to set up your .env file. 

<hr>

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1000px-Google_2015_logo.svg.png" width="200">

- Visit <a href="https://cloud.google.com/console/project" target="_blank">Google Cloud Console</a>
- Click on the **Create Project** button
- Enter *Project Name*, then click on **Create** button
- Then click on *APIs & auth* in the sidebar and select *API* tab
- Click on **Google+ API** under *Social APIs*, then click **Enable API**
- Click on **Google Drive API** under *G Suite*, then click **Enable API**
- Click on **Google Sheets API** under *G Suite*, then click **Enable API**
- Next, under *APIs & auth* in the sidebar click on *Credentials* tab
- Click on **Create new Client ID** button
- Select *Web Application* and click on **Configure Consent Screen**
- Fill out the required fields then click on **Save**
- In the *Create Client ID* modal dialog:
 - **Application Type**: Web Application
 - **Authorized Javascript origins**: http://localhost:8080
 - **Authorized redirect URI**: http://localhost:8080/auth/google/callback
- Click on **Create Client ID** button
- Copy and paste *Client ID* and *Client secret* keys into `.env`

**Note:** When you ready to deploy to production don't forget to
add your new URL to *Authorized Javascript origins* and *Authorized redirect URI*,
e.g. `http://my-awesome-app.herokuapp.com` and
`http://my-awesome-app.herokuapp.com/auth/google/callback` respectively.
The same goes for other providers.

<hr>

<img src="https://sendgrid.com/brand/sg-logo-300.png" width="200">

You can use SendGrid for sending emails.  The developer tier allows you to send 100 free emails per day.  As an Alternative to SendGrid, you may also choose to use an SMTP service provider.  If using SendGrid:
- Go to <a href="https://sendgrid.com/user/signup" target="_blank">https://sendgrid.com/user/signup</a>
- Sign up and **confirm** your account via the *activation email*
- Then enter your SendGrid *API Key* into `.env` file as SENDGRID_API_KEY


<hr>

Project Structure
-----------------

| Name                   | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| **config**/passport.js | Passport authentication strategies.                          |
| **controllers**/       | Controllers.                                                 |
| **models**/User.js     | Mongoose schema and model for User.                          |
| .env.example           | Environmental variables example file.                        |
| .gitignore             | Folder and files to be ignored by git.                       |
| .travis.yml            | Configuration file for build and test on travis-ci.          |
| app.js                 | The main application file.                                   |
| package.json           | NPM dependencies.                                            |
| package-lock.json      | Contains exact versions of NPM dependencies in package.json. |


List of Packages
----------------

### Dependencies
| Package                | Description                                        |
| ---------------------- | -------------------------------------------------- |
| @sendgrid/mail         | Library for using Sendgrid api                     |
| bcryptjs               | Library for hashing and salting user passwords     |
| chalk                  | For stileing terminal output.                      |
| compression            | For compressing response data                      |
| cors                   | For enabling cors                                  |
| dotenv                 | For loading environment variables from .env file   |
| express                | Express js                                         |
| helmet                 | For setting http headers                           |
| jsonwebtoken           | For generating and decripting jwt tokens           |
| mongoose               | For connecting to a mongodb                        |
| morgan                 | For logging requests                               |
| multer                 | For handling file uploads                          |
| passport               | For handling authentication                        |
| passport-google-oauth2 | For handling google auth                           |
| passport-jwt           | For authenticating using jwt                       |
| passport-local         | For handling authentication with mail and password |
| validator              | For validating and sanitizing request data         |


### devDependencies
| Package   | Description                            |
| --------- | -------------------------------------- |
| chai      | Assertion library                      |
| mocha     | Test framework                         |
| nodemon   | For restarting server on change        |
| sinon     | Standalone test spies, stubs and mocks |
| supertest | HTTP testing                           |

API Endpoints, requests and responses
----------

### Login
---
`POST /auth/login` - Post email and password and get jwt token

Controller: `controllers/auth.js - postLogin`

Request:
```json
Content-Type: application/json
Accept: application/json

{
  "data": {
    "attributes": {
      "email": "some@mail.com",
      "password": "1234"
    }
  }
}
```
<span style="color:green">**Success**</span> response:
```json
Content-Type: application/json
201 OK

{
  "data": {
    "type": "jwt bearer token",
    "id": "<JWT.TOKEN>",
    "attributes": {
      "expiresIn": "1h"
    }
  }
}
```
<span style="color:red">**Fail**</span> response:
```json
Content-Type: application/json
401 Unauthorized

{
    "meta": {
        "path": "/auth/login"
    },
    "errors": [
        {
            "status": "422",
            "title": "validationerror",
            "detail": "Invalid password."
        }
    ]
}
```

### Signup
---
`POST /auth/signup` - Registers user and sends verification email, user won't be able to login until email is verified. It can be disabled by not calling ```sendVerify``` function in signup controller and setting ```isVerified: true``` when creating new user.

Controller: `controllers/auth.js - postSignup`

| Property          | Description                         |
| ----------------- | ----------------------------------- |
| email *           | email address                       |
| password *        | password                            |
| confirmPassword * | confirm password                    |
| redirect          | URL for email verification redirect |

\* - required property

Request:
```json
Content-Type: application/json
Accept: application/json

{
  "data": {
    "attributes": {
        "email": "some@mail.com",
        "password": "1234",
        "confirmPassword": "1234",
        "redirect": "http://domain.com/"
    }
  }
}
```
<span style="color:green">**Success**</span> response:
```json
204 No Content
```

<span style="color:red">**Fail**</span> response:
```json
Content-Type: application/json
422 Unprocessable Entity

{
    "meta": {
        "path": "/auth/signup"
    },
    "errors": [
        {
            "source": {
                "pointer": "/data/attributes/confirmPassword"
            },
            "status": 422,
            "title": "validationerror",
            "detail": "Passwords do not match"
        }
    ]
}
```

### Resend verification mail
---
`POST /auth/resend` - Resends verification mail. It's using jwt token. As you can't manually invalidate jwt token, previously sent tokens will be valid too until they expire, expiration time can be set in .env file.

Controller: `controllers/auth.js - resendVerify`

| Property | Description                         |
| -------- | ----------------------------------- |
| email *  | email address                       |
| redirect | URL for email verification redirect |

\* - required properties

Request:
```json
Content-Type: application/json
Accept: application/json

{   
  "data": {
    "type": "users",
    "attributes": {
        "email": "some@mail.com",
        "redirect": "http://domain.com/"
    }
  }
}
```
<span style="color:green">**Success**</span> response:
```json
204 No Content
```

<span style="color:red">**Fail**</span> response:
```json
Content-Type: application/json
422 Unprocessable Entity

{
    "meta": {
        "path": "/auth/resend"
    },
    "errors": [
        {
            "status": "422",
            "title": "Error",
            "detail": "Email is already verified."
        }
    ]
}
```

### Verify email
---
`GET /auth/verify?token=<jwt.token>` - Verifies mail if valid jwt token is provided.

Controller: `controllers/auth.js - verifyEmail`

| Query   | Description |
| ------- | ----------- |
| token * | JWT token   |

\* - required properties

### Forgot password
---
`POST /auth/forgot` - If account with the provided email exists sends password reset token to that email.

Controller: `controllers/auth.js - forgotPassword`

| Property | Description                     |
| -------- | ------------------------------- |
| email *  | email address                   |
| redirect | URL for password reset redirect |

\* - required properties

**Note**: redirect page should be capable of extracting query `?token` from url and making POST request for password reset (see `POST /auth/reset`). 


Request:
```json
Content-Type: application/json
Accept: application/json

{   
  "data": {
    "attributes": {
        "email": "some@mail.com",
        "redirect": "http://somedomain.com/password-reset/"
    }
  }
}
```
<span style="color:green">**Success**</span> response:
```json
204 No Content
```

<span style="color:red">**Fail**</span> response:
```json
Content-Type: application/json
422 Unprocessable Entity

{
    "meta": {
        "path": "/auth/forgot"
    },
    "errors": [
        {
            "status": "404",
            "title": "notfound",
            "detail": "Account with that email address was not found"
        }
    ]
}
```

### Reset password
---
`POST /auth/reset` - Resets password. Forgot password request adds `?token` query to redirect url. It should be extracted by password reset page and put into post body (example can be seen in `examples/password-reset/` directory).

Controller: `controllers/auth.js - resetPassword`


| Property          | Description                     |
| ----------------- | ------------------------------- |
| password *        | new password                    |
| confirmPassword * | confirm new password            |
| token *           | JWT password reset token        |

\* - required properties

Request:
```json
Content-Type: application/json
Accept: application/json

{   
  "data": {
    "attributes": {
        "password": "1234",
        "confirmPassword": "1234",
        "token": "<JWT.TOKEN>"
    }
  }
}
```
<span style="color:green">**Success**</span> response:
```json
204 No Content
```

<span style="color:red">**Fail**</span> response:
```json
Content-Type: application/json
401 Unauthorized

{
    "meta": {
        "path": "/auth/reset"
    },
    "errors": [
        {
            "status": 401,
            "title": "jwttokeninvalid",
            "detail": "Provided jwt token is invalid"
        }
    ]
}
```


Deployment
----------

The app is easily deployable to any cloud or conventional hosting provider as it does not require any special permissions or prerequisites.

That said you might find these instructions helpful:

### Deployment to Heroku

<img src="https://www.fullstackpython.com/img/logos/heroku.png" width="200">

- Download and install [Heroku Toolbelt](https://toolbelt.heroku.com/)
- In a terminal, run `heroku login` and enter your Heroku credentials
- From *your app* directory run `heroku create`
- Use the command `heroku config:set KEY=val` to set the different environment variables (KEY=val) for your application (i.e.  `heroku config:set BASE_URL=[heroku App Name].herokuapp.com` or `heroku config:set MONGODB_URI=mongodb://dbuser:<password>@cluster0-shard-00-00-sdf32.mongodb.net:27017,cluster0-shard-00-01-sdf32.mongodb.net:27017/<dbname>?ssl=true&retryWrites=true&w=majority` (see Hosted MongoDB Atlas below), etc.)  Make sure to set the environment variables for SENDGRID_USER, SENDGRID_PASSWORD, and any other API that you are using as well.
- Lastly, do `git push heroku master`.

Please note that you may also use the [Herko Dashboard](https://dashboard.heroku.com) to set or modify the configurations for your application.

---

### Hosted MongoDB Atlas

<img src="https://www.mongodb.com/assets/images/global/MongoDB_Logo_Dark.svg" width="200">

- Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Click the green **Get started free** button
- Fill in your information then hit **Get started free**
- You will be redirected to Create New Cluster page.
- Select a **Cloud Provider and Region** (such as AWS and a free tier region)
- Select cluster Tier to Free forever **Shared** Cluster
- Give Cluster a name (default: Cluster0)
- Click on green **:zap:Create Cluster button**
- Now, to access your database you need to create a DB user. To create a new MongoDB user, from the **Clusters view**, select the **Security tab**
- Under the **MongoDB Users** tab, click on **+Add New User**
- Fill in a username and password and give it either **Atlas Admin** User Privilege
- Next, you will need to create an IP address whitelist and obtain the connection URI.  In the Clusters view, under the cluster details (i.e. SANDBOX - Cluster0), click on the **CONNECT** button.
- Under section **(1) Check the IP Whitelist**, click on **ALLOW ACCESS FROM ANYWHERE**. The form will add a field with `0.0.0.0/0`.  Click **SAVE** to save the `0.0.0.0/0` whitelist.
- Under section **(2) Choose a connection method**, click on **Connect Your Application**
- In the new screen, select **Node.js** as Driver and version **3.6 or later**.
- Finally, copy the URI connection string and replace the URI in MONGODB_URI of `.env.example` with this URI string.  Make sure to replace the <PASSWORD> with the db User password that you created under the Security tab.
- Note that after some of the steps in the Atlas UI, you may see a banner stating `We are deploying your changes`.  You will need to wait for the deployment to finish before using the DB in your application.


**Note:** As an alternative to MongoDB Atlas, there is also [Compose](https://www.compose.io/).

---

Contributing
------------

If you find any error in code, or have an idea for more optimal solution for some parts of the code, please either open an issue or submit a pull request. 
Contributions are welcome!

License
-------

MIT License

Copyright (c) 2021 avoup

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.