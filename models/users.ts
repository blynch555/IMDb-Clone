import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as validator from 'validator';

export interface IFacebook{
  token: string;
  name: string;
  email: string;
}

export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  facebookId: string;
  facebook: IFacebook;
  setPassword(password:string): boolean;
  validatePassword(password:string): boolean;
  generateJWT(): JsonWebKey;
  roles: Array<string>;
}

let UserSchema = new mongoose.Schema({
  username: String,
  email:{
    type: String,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'invalid email']
  },
  passwordHash: {type: String, select: false},
  salt: {type: String, select: false},
  facebookId: String,
  facebook:{
    token: String,
    name: String,
    email: String
  },
  roles: {type: Array, default:['user']}
});

UserSchema.method('setPassword', function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.passwordHash= crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
});

UserSchema.method('validatePassword', function(password){
  let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  console.log(hash === this.passwordHash);
  return (hash === this.passwordHash);
});

UserSchema.method('generateJWT', function(){
  return jwt.sign({
    _id: this._id,
    username: this.username,
    email: this.email
  }, process.env.JWT_SECRET,{expiresIn:'2 days'});
});

export const User = mongoose.model<IUser>('User', UserSchema);