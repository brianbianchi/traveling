import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model'; // optional

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  user$: Observable<User>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    public toastService: ToastService
  ) {
    // Get the auth state, then fetch the Firestore user document or return null
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        // Logged in
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          // Logged out
          return of(null);
        }
      })
    );
  }

  async emailCreate(email: string, password: string) {
    const credential = await this.afAuth.auth.createUserWithEmailAndPassword(email, password);
    this.toastService.show('Successfully signed up. Welcome!', { classname: 'bg-success text-light', delay: 2000 });
    return this.updateUserData(credential.user);
  }

  async emailLogin(email: string, password: string) {
    const credential = await this.afAuth.auth.signInWithEmailAndPassword(email, password);
    this.toastService.show('Successfully signed in', { classname: 'bg-success text-light', delay: 2000 });
    return this.updateUserData(credential.user);
  }

  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.auth.signInWithPopup(provider)
      .then((cred) => {
        this.updateUserData(cred.user);
        this.toastService.show('Successfully signed in with Google', { classname: 'bg-success text-light', delay: 2000 });
        this.router.navigate(['/reviews']);
      })
      .catch((err) => {
        this.toastService.show('Something went wrong', { classname: 'bg-danger text-light', delay: 2000 });
        console.log(err);
      });
    return credential;
  }

  async facebookSignin() {
    const provider = new auth.FacebookAuthProvider();
    const credential = await this.afAuth.auth.signInWithPopup(provider)
      .then((cred) => {
        this.updateUserData(cred.user);
        this.toastService.show('Successfully signed in with Facebook', { classname: 'bg-success text-light', delay: 2000 });
        this.router.navigate(['/reviews']);
      })
      .catch((err) => {
        this.toastService.show('Something went wrong', { classname: 'bg-danger text-light', delay: 2000 });
        console.log(err);
      });
    return credential;
  }

  getUserByUserId(id: string) {
    return this.afs.collection('user').doc(id).ref.get();
  }

  private updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isAdmin: false
    };

    return userRef.set(data, { merge: true });
  }

  async signOut() {
    await this.afAuth.auth.signOut();

    this.toastService.show('Signed out', { classname: 'bg-success text-light', delay: 2000 });

    this.router.navigate(['/reviews']);
  }

}
