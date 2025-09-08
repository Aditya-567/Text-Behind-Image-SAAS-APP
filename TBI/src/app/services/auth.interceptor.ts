import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private afAuth: AngularFireAuth) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Only intercept requests to your backend API
    if (request.url.startsWith('http://localhost:3000/api')) {
      return this.afAuth.idToken.pipe(
        take(1), // Take the first token emitted
        switchMap((token) => {
          if (token) {
            // Clone the request to add the new header.
            const clonedRequest = request.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`,
              },
            });
            return next.handle(clonedRequest);
          }
          // If no token, proceed with the original request (it will be rejected by the backend)
          return next.handle(request);
        })
      );
    }

    // For all other requests, do not modify them
    return next.handle(request);
  }
}
