import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  // Sign Up with Email and Password
  signUp(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  // Sign In with Email and Password
  signIn(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  // Google Sign-In
  googleSignIn() {
    return this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  // Facebook Sign-In
  facebookSignIn() {
    return this.afAuth.signInWithPopup(
      new firebase.auth.FacebookAuthProvider()
    );
  }

  resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  // Sign Out
  signOut() {
    return this.afAuth.signOut();
  }

  // Get current user
  getCurrentUser() {
    return this.afAuth.authState;
  }
}
