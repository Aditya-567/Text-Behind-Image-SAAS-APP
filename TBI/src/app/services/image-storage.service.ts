import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageStorageService {
  private apiUrl = 'http://localhost:3000/api/images';

  constructor(private http: HttpClient) {}

  // No changes needed here. The interceptor handles the token.
  uploadImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // No changes needed here. The interceptor handles the token.
  getImages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // No changes needed here. The interceptor handles the token.
  searchImages(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?q=${query}`);
  }
}
