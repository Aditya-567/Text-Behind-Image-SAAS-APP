// src/app/services/ai-mask.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AiMaskService {
  private API_URL = 'http://localhost:3000/remove-bg'; // use your proxy here

  async removeBackground(imageFile: File): Promise<Blob> {
    const form = new FormData();
    form.append('image_file', imageFile);

    const response = await fetch(this.API_URL, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) throw new Error('Remove.bg request failed');

    return await response.blob();
  }
}
