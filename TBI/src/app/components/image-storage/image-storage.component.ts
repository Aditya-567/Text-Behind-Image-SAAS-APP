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
  viewingImage: any | null = null; // --- NEW: To hold the image for the modal
  isLoading: boolean = false; // --- NEW: To manage loading state

  constructor(private imageService: ImageStorageService) {}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.isLoading = true; // --- NEW: Set loading state to true
    this.imageService.getImages().subscribe(
      (data) => {
        this.images = data;
        console.log('Images loaded successfully');
        this.isLoading = false; // --- NEW: Set loading state to false
      },
      (error) => {
        console.error('Error loading images:', error);
        this.isLoading = false; // --- NEW: Set loading state to false
      }
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
        // Clear the file input visually after upload
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = "";

        this.selectedFile = null;
        this.imageDescription = '';
        this.loadImages();
      },
      (error) => console.error('Error uploading file:', error)
    );
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.loadImages();
      return;
    }
    this.imageService.searchImages(this.searchTerm).subscribe(
      (data) => {
        this.images = data;
      },
      (error) => console.error('Error searching images:', error)
    );
  }

  downloadImage(image: any): void {
    const link = document.createElement('a');
    link.href = image.imageData;
    link.download = image.originalName || 'download.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  deleteImage(imageId: string, event: MouseEvent): void {
    event.stopPropagation(); // Prevent the modal from opening when clicking delete
    if (confirm('Are you sure you want to delete this image?')) {
      this.imageService.deleteImage(imageId).subscribe(
        () => {
          console.log('Image deleted successfully');
          this.images = this.images.filter(img => img._id !== imageId);
        },
        (error) => console.error('Error deleting image:', error)
      );
    }
  }

  // --- NEW ---
  openImageViewer(image: any): void {
    this.viewingImage = image;
  }

  // --- NEW ---
  closeImageViewer(): void {
    this.viewingImage = null;
  }
}

