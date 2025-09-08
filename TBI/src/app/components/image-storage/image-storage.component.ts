import { Component, OnInit } from '@angular/core';
import { ImageStorageService } from '../../services/image-storage.service';

@Component({
  selector: 'app-image-storage',
  standalone: false,
  templateUrl: './image-storage.component.html',
  styleUrls: ['./image-storage.component.scss'],
})
export class ImageStorageComponent implements OnInit {
  selectedFile: File | null = null;
  imageDescription: string = '';
  images: any[] = [];
  searchTerm: string = '';

  // Base URL to construct the image source path
  readonly imageBaseUrl = 'http://localhost:3000/';

  constructor(private imageService: ImageStorageService) {}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.imageService.getImages().subscribe(
      (data) => {
        this.images = data;
        console.log('Images loaded successfully', this.images);
      },
      (error) => console.error('Error loading images:', error)
    );
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  onUpload(): void {
    if (!this.selectedFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('description', this.imageDescription); 

    this.imageService.uploadImage(formData).subscribe(
      (response) => {
        console.log('File uploaded successfully', response);
        this.imageDescription = ''; // Clear description
        this.loadImages(); // Refresh the list of images
      },
      (error) => console.error('Error uploading file:', error)
    );
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.loadImages(); // If search is empty, load all images
      return;
    }
    this.imageService.searchImages(this.searchTerm).subscribe(
      (data) => {
        this.images = data;
        console.log('Search successful', this.images);
      },
      (error) => console.error('Error searching images:', error)
    );
  }
}
