import React from 'react';
import './App.css';

import axios from 'axios';
import url from 'url';
import qs from 'qs';
import querystring from 'querystring';
import jwt from 'jsonwebtoken';

const clientID = 1234;
const clientSecret = '1x2x3x4';
const state = 'ayy';
const nonce = 'lmao';
const max_age = 120;

class App extends React.Component {

  lineLogin() {
    // Build query string.
    let query = querystring.stringify({
      'response_type': 'code',
      'client_id': clientID,
      'state': state,
      'scope': 'profile openid email',
      'nonce': nonce,
      'prompt': 'consent',
      'max_age': max_age,
      'bot_prompt': 'normal'
    });
    // The Callback URL specify in the Line Developer Console.
    let redirectURI = 'http://localhost:3000';
    // Build the Line authorise URL.
    let lineAuthoriseURL = 'https://access.line.me/oauth2/v2.1/authorize?' + query + '&redirect_uri=' + redirectURI;
    // Redirect to external URL.
    window.location.href=lineAuthoriseURL;
  }

  getAccessToken(callbackURL) {
    var url_parts = url.parse(callbackURL, true);
    var query = url_parts.query;

    if (query.hasOwnProperty('code')) {
      let reqBody = {
        'grant_type': 'authorization_code',
        'code': query.code,
        'redirect_uri': 'http://localhost:3000',
        'client_id': clientID,
        'client_secret': clientSecret
      };
      let reqConfig = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      axios.post('https://api.line.me/oauth2/v2.1/token', qs.stringify(reqBody), reqConfig)
        .then(res => {
          console.log("payload:")
          console.log(res.data);

          console.log("id token:")
          console.log(res.data.id_token);

          try {
            
            let decoded_id_token = jwt.verify(res.data.id_token, clientSecret, {
              algorithms: ['HS256'],
              audience: clientID.toString(),
              issuer: 'https://access.line.me',
              nonce: nonce
            });

            console.log("decoded id token:")
            console.log(decoded_id_token);

          } catch (err) {
            
            // If token is invalid.
            console.log(err);

          }
        })
        .catch(err => {
          console.log(err);
        }) 
    }
  }


  componentDidMount() {
    this.getAccessToken(window.location.href);
  }

  render() {
    return (
      <div className="App">
        <p>
          <button onClick={this.lineLogin}>
            Line Login
          </button>
        </p>
      </div>
    );
  }
}

export default App;
