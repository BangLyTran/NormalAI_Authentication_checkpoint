import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi} from 'openai';
import fs from 'fs';
import readline from 'readline';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import session from 'express-session';
import User from './models/User'; // Adjust the path to point to your User model file
import promptData from './resumeprompt.json';


dotenv.config();

const configuration = new Configuration({ 
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

// Protecting Routes function
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Session configuration
app.use(session({ secret: 'your-secret-key' }));
app.use(passport.initialize());
app.use(passport.session());


// Google OAuth2 Strategy configuration
passport.use(new GoogleStrategy({
  clientID: process.env.Client_ID,
  clientSecret: process.env.Client_Secret,
  callbackURL: 'http://localhost:5000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find user by Google ID
    let user = await User.findOne({ googleId: profile.id });

    // If user doesn't exist, create a new user
    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        // Add any other relevant fields from the profile object
      });
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth2 Routes
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/enginuiteeai'); // Redirect to EnginuiteeAI page
});

// Serve login.html in Your Server File
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Implement Logout Route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

app.get('/', async(req, res) => {
    res.status(200).send({
        message:' Hello from Enginuitee',
    })
})

let promptList = promptData.prompts;


app.post('/', ensureAuthenticated, async (req, res) => {
    try {
      const userMessage = req.body.message;
      promptList.push({
        role: "user",
        content: userMessage
      });
  
      const response = await openai.createChatCompletion({
          model: "gpt-4",
          messages: promptList,
          temperature: 1,
          max_tokens: 427,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
      });
  
      const message = response.data.choices[0].message.content;
      promptList.push({
        role: "assistant",
        content: message
      });
  
      // Find user by email or other identifier
      const user = await User.findOne({ email: req.user.email });
  
      // Add conversation to user's conversations array
      user.conversations.push({
        role: "user",
        content: userMessage
      });
  
      user.conversations.push({
        role: "assistant",
        content: message
      });
  
      // Save user
      await user.save();
  
      // Send the entire response data object back to the client
      res.status(200).send(response.data);
    } catch (error) {
      console.error("OpenAI API Error:", error.message);
      res.status(500).send({ error: error.message });
    }   
  });
  app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));