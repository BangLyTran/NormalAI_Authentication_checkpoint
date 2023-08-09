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
    // Add other fields as needed
  });

  const bcrypt = require('bcryptjs');

  // Add Pre-save Hook to Hash Password
  UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });  

// Create the model
const User = mongoose.model('User', UserSchema);
//Export the model
module.exports = User;

