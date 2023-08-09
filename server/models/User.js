import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ConversationSchema = new mongoose.Schema({
  role: String,
  content: String
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  conversations: [ConversationSchema]
  // Add other fields as needed
});

// Add Pre-save Hook to Hash Password
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Create the model
const User = mongoose.model('User', UserSchema);
// Export the model
export default User;