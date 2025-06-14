import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { BehaviorSubject } from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | undefined>(undefined);
  currentUser$ = this.currentUserSubject.asObservable();
  private isLoggedInState = false;

  constructor(private afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe((firebaseUser: firebase.User | null) => {
      if (firebaseUser) {
        this.isLoggedInState = true;
        const mappedUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          phoneNumber: firebaseUser.phoneNumber,
          isAnonymous: firebaseUser.isAnonymous,
          metadata: {
            creationTime: firebaseUser.metadata.creationTime!,
            lastSignInTime: firebaseUser.metadata.lastSignInTime!,
          },
          refreshToken: firebaseUser.refreshToken,
        };

        this.currentUserSubject.next(mappedUser);
      } else {
        this.isLoggedInState = false;
        this.currentUserSubject.next(undefined);
      }
    });
  }

  setCurrentUser(user: User) {
    this.currentUserSubject.next(user);
  }

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

  // Add this method in AuthService
  githubSignIn() {
    return this.afAuth.signInWithPopup(new firebase.auth.GithubAuthProvider());
  }

  resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  signOut() {
    return this.afAuth.signOut().then(() => {
      this.isLoggedInState = false;
      this.currentUserSubject.next(undefined);
      window.location.reload();
    });
  }

  getCurrentUser() {
    return this.afAuth.authState;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInState;
  }

  updateUserProfile(displayName: string, photoURL: string): Promise<void> {
    return this.afAuth.currentUser.then((user) => {
      if (!user) {
        throw new Error('No user is currently logged in.');
      }

      return user
        .updateProfile({ displayName, photoURL })
        .then(() => user.reload())
        .then(() => {
          // Now use the same `user` again, it has been reloaded
          const mappedUser: User = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            isAnonymous: user.isAnonymous,
            metadata: {
              creationTime: user.metadata.creationTime!,
              lastSignInTime: user.metadata.lastSignInTime!,
            },
            refreshToken: user.refreshToken,
          };

          this.currentUserSubject.next(mappedUser);
        });
    });
  }
}
