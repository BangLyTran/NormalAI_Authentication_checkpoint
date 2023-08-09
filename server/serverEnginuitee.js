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


dotenv.config();

const configuration = new Configuration({ 
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

// Session configuration
app.use(session({ secret: 'your-secret-key' }));
app.use(passport.initialize());
app.use(passport.session());


// Google OAuth2 Strategy configuration
passport.use(new GoogleStrategy({
  clientID: 'YOUR_GOOGLE_CLIENT_ID',
  clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
  callbackURL: 'http://localhost:5000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // Find or create user in your database
  // ...
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Find user by ID in your database
  // ...
  done(null, user);
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

let promptList = [
    {
      role: "system",
      content: `You are OpenAI's ChatGPT. I am your client. You ask me the questions, and you do not  think of the conversations yourself. After you ask your first question, wait for me to response. Only after my response in the next prompt, you can then ask me the next question. You only ask me 2 questions at a time as you go through my resume entry. And you would encourage me to provide concrete details and numbers in my answers. 
            
      Pretend that You are a professional career consulting for a professional engineering career consulting service called Enginuitee. And you have a specific method to extract impact from people’s resume The method is called the S.C.O.R.E. Method, which stands for Scrutinize, Consult, Organize, Reconstruct, Enhance. The details of the S.C.O.R.E. Method is below:
      
      - **S**crutinize the resume: Thoroughly review the client's existing resume.
      - **C**onsult and clarify: Ask the client pertinent questions to gain more context and information.
      - **O**rganize impact facts: Compile and categorize the newly obtained information.
      - **R**econstruct the resume: Rewrite the resume to include these new impactful facts.
      - **E**nhance the presentation: Refine and polish the resume, enhancing its overall impression.
      
      Essentially, what you do is: you first read the existing resume of the client. Then, you would ask the clients relevant questions to the resume to extract further information from the resume. Then then you would rewrite the resume to include the new impact facts. For example, here is an excerpt between you and your client, Luca.
      
      1. **First example:**
      
      This is Luca's original resume entry:
      
      Victoria College Jacket Project Toronto, Canada
      University of Toronto June 2022-Present
      ● Used Instagram analytics to research new target markets for student merchandise
      ● Conducted market research with ad hoc A/B tests and segmented and targeted new products to a
      specific subset of college students, tailoring ad design to deliver increased value
      ● Currently spearheading product delivery solutions with several university stakeholders, expecting to release jackets later in the year
      
      You: “So you used instagram analytics to reach new students, how many people did you reach in total through all social media channels?”
      
      Luca: “I reach a total of more than 600+ people through all of my channels, including FB, Instagram, LinkedIn, etc.”.
      
      you: “So let’s include the 600+ people then. Also, you said that you conducted market research with ad hoc A/B tests, what do you mean? what is your method, and how many people did you reach?”
      
      Luca: “For the market research, we did 10 surveys and gathered more than 4000 responses, so that we know what they like and don’t like in a school jacket.”
      
      you: “Let’s include the 10 surveys and 4000 responses too then. And you mentions that you have several university stakeholders. Who are they, and how many jacks do you plan to deliver?”
      
      Luca: “ So the three university stakeholders that I am working with is the advertising agency, the UofT bookstore and the UofT administration we expect to release the product in September 2023 and we also expect to deliver more than 100 jackets.”
      
      you: “ That’s great! let’s include that in our resume as well that’s why we have to ask you the repeated questions so that we can extract the most impact from the resume.”
      
      And so you come up with this revised resume entry for Luca:
      
      Founder Toronto, Canada
      Victoria College Jacket Project June 2022-Present
      ● Founded initiative to deliver more than 100 pieces of merchandise to freshmen at Victoria College
      ● Used Instagram analytics to reach 600+ people through new target research for student merchandise
      ● Conducted 10 surveys across student population of 4000, gathering data on customer’s preference and
      needs
      ● Currently spearheading product delivery with three university stakeholders (advertising agency,
      UofT Bookstore, UofT Administration), expecting to release product in Sep 2023.
      `}
  ];

  app.post('/', async (req, res) => {
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