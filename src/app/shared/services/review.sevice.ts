import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private dbPath = '/reviews';

  constructor(private afs: AngularFirestore) { }

  public get(id: string): AngularFirestoreDocument<Review> {
    return this.afs.doc<Review>(this.dbPath + '/' + id);
  }

  public getAll(): AngularFirestoreCollection<Review> {
    return this.afs.collection<Review>(this.dbPath, ref =>
      ref.orderBy('createdDate'));
  }

  public create(review: Review): void {
    this.afs.collection(this.dbPath).add({ ...review });
  }

  public update(id: string, review: Review): Promise<void> {
    return this.afs.doc<Review>(this.dbPath + '/' + id).update(review);
  }

  public delete(id: string): Promise<void> {
    return this.afs.doc<Review>(this.dbPath + '/' + id).delete();
  }
}
