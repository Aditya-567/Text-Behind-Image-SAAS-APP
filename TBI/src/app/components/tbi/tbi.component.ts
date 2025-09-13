import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { ImageStorageService } from '../../services/image-storage.service';
import { ToasterService } from '../../services/toaster.service';

export interface GoogleFont {
  name: string;
  value: string;
  category: string;
}

export interface TextLayer {
  id: number;
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  opacity: number;
  rotation: number;
  vPos: number;
  hPos: number;
  align: 'left' | 'center' | 'right';
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
}

export interface CloudinaryEffect {
  name: string;
  transformation: string;
  hasIntensity: boolean;
  min: number;
  max: number;
  defaultValue: number;
}

@Component({
  selector: 'app-tbi',
  templateUrl: './tbi.component.html',
  standalone: false,
  styleUrl: './tbi.component.scss',
})
export class TbiComponent implements OnInit {
  // Element References
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('downloadDropdown') downloadDropdown!: ElementRef;
  @ViewChild('downloadDropdownTab') downloadDropdownTab!: ElementRef;
  @ViewChild('aspectRatioDropdown') aspectRatioDropdown!: ElementRef;

  // Cloudinary Configuration
  cloudName = environment.cloudinary.cloudName;
  uploadPreset = environment.cloudinary.uploadPreset;

  // Image & Layer State
  textLayers: TextLayer[] = [];
  activeLayerId: number | null = null;
  backgroundImageUrl: string | null = null;
  foregroundImageUrl: string | null = null;
  originalBackgroundImageUrl: string | null = null;
  originalForegroundImageUrl: string | null = null;

  // UI State
  activeTab: 'text' | 'image' | 'settings' = 'text';
  isDragging = false;
  isLoading = false; // For initial upload
  isEffectLoading = false; // For applying Cloudinary effects
  messageText = '';
  isImageUploaded = false;
  isDropdownOpen = false;
  isDropdownTabOpen = false;
  isAspectRatioDropdownOpen = false;
  showScrollTop = false;

  // Download & Aspect Ratio State
  downloadFormat = 'png';
  aspectRatioSelection = 'original';
   aspectRatios = [
    { name: 'Original', value: 'original' },
    { name: '1:1 (Square)', value: '1/1' },
    { name: '4:3', value: '4/3' },
    { name: '16:9', value: '16/9' },
  ];
  originalImageAspectRatio: string | null = null;
  fileName = 'Cool TBI';

  // Google Fonts State
  allGoogleFonts: GoogleFont[] = [];
  fontSearchTerm = '';

  // CSS Effects State (Background only)
  brightness = 100;
  contrast = 100;
  blur = 0;
  hdr = 0;

  // Cloudinary Effects State
  allCloudinaryEffects: CloudinaryEffect[] = [];
  selectedEffect: CloudinaryEffect | null = null;
  effectIntensity = 100;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, 
    private imageService: ImageStorageService, private toast: ToasterService) {
    window.addEventListener('scroll', () => {
      this.showScrollTop = window.scrollY > 400;
    });

    if (!this.cloudName || !this.uploadPreset || this.cloudName === 'YOUR_CLOUD_NAME') {
      this.messageText = 'Please configure your Cloudinary credentials in the environment file.';
    }
  }

  ngOnInit(): void {
    this.loadGoogleFonts();
    this.loadCloudinaryEffects();
  }

  // --- GETTERS ---

  get filteredFonts(): GoogleFont[] {
    if (!this.fontSearchTerm) {
      return this.allGoogleFonts;
    }
    return this.allGoogleFonts.filter((font) =>
      font.name.toLowerCase().includes(this.fontSearchTerm.toLowerCase())
    );
  }

  get safeBackgroundImage(): SafeUrl | null {
    return this.backgroundImageUrl ? this.sanitizer.bypassSecurityTrustUrl(this.backgroundImageUrl) : null;
  }

  get safeForegroundImage(): SafeUrl | null {
    return this.foregroundImageUrl ? this.sanitizer.bypassSecurityTrustUrl(this.foregroundImageUrl) : null;
  }

  get activeLayer(): TextLayer | undefined {
    return this.textLayers.find((l) => l.id === this.activeLayerId);
  }

  get backgroundCssFilters(): string {
    const hdrContrast = 1 + (this.hdr / 150);
    const hdrSaturate = 1 + (this.hdr / 150);
    return `brightness(${this.brightness}%) contrast(${this.contrast}%) blur(${this.blur}px) contrast(${hdrContrast}) saturate(${hdrSaturate})`;
  }

  get currentAspectRatioName(): string {
    const selected = this.aspectRatios.find(ar => ar.value === this.aspectRatioSelection);
    return selected ? selected.name : 'Original';
  }

  // --- EVENT LISTENERS & UI ---

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isDropdownOpen && this.downloadDropdown && !this.downloadDropdown.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
    if (this.isDropdownTabOpen && this.downloadDropdownTab && !this.downloadDropdownTab.nativeElement.contains(event.target)) {
      this.isDropdownTabOpen = false;
    }
    if (this.isAspectRatioDropdownOpen && this.aspectRatioDropdown && !this.aspectRatioDropdown.nativeElement.contains(event.target)) {
      this.isAspectRatioDropdownOpen = false;
    }
  }

  scrollToHowToUse(): void {
    const element = document.getElementById('how-to-use');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  selectAspectRatio(ratio: string): void {
    this.aspectRatioSelection = ratio;
    this.isAspectRatioDropdownOpen = false;
  }

  // --- DATA LOADING ---

  private loadGoogleFonts(): void {
    this.allGoogleFonts = [
        { name: 'Roboto', value: "'Roboto', sans-serif", category: 'sans-serif' },
        { name: 'Open Sans', value: "'Open Sans', sans-serif", category: 'sans-serif' },
        { name: 'Lato', value: "'Lato', sans-serif", category: 'sans-serif' },
        { name: 'Montserrat', value: "'Montserrat', sans-serif", category: 'sans-serif' },
        { name: 'Nunito', value: "'Nunito', sans-serif", category: 'sans-serif' },
        { name: 'Inter', value: "'Inter', sans-serif", category: 'sans-serif' },
        { name: 'Poppins', value: "'Poppins', sans-serif", category: 'sans-serif' },
        { name: 'Source Sans Pro', value: "'Source Sans Pro', sans-serif", category: 'sans-serif' },
        { name: 'Raleway', value: "'Raleway', sans-serif", category: 'sans-serif' },
        { name: 'Merriweather', value: "'Merriweather', serif", category: 'serif' },
        { name: 'Playfair Display', value: "'Playfair Display', serif", category: 'serif' },
        { name: 'Lora', value: "'Lora', serif", category: 'serif' },
        { name: 'PT Serif', value: "'PT Serif', serif", category: 'serif' },
        { name: 'Noto Serif', value: "'Noto Serif', serif", category: 'serif' },
        { name: 'Libre Baskerville', value: "'Libre Baskerville', serif", category: 'serif' },
        { name: 'Roboto Mono', value: "'Roboto Mono', monospace", category: 'monospace' },
        { name: 'Source Code Pro', value: "'Source Code Pro', monospace", category: 'monospace' },
        { name: 'Inconsolata', value: "'Inconsolata', monospace", category: 'monospace' },
        { name: 'Space Mono', value: "'Space Mono', monospace", category: 'monospace' },
        { name: 'Dancing Script', value: "'Dancing Script', cursive", category: 'handwriting' },
        { name: 'Pacifico', value: "'Pacifico', cursive", category: 'handwriting' },
        { name: 'Lobster', value: "'Lobster', cursive", category: 'handwriting' },
        { name: 'Caveat', value: "'Caveat', cursive", category: 'handwriting' },
        { name: 'Satisfy', value: "'Satisfy', cursive", category: 'handwriting' },
        { name: 'Oswald', value: "'Oswald', sans-serif", category: 'display' },
        { name: 'Anton', value: "'Anton', sans-serif", category: 'display' },
        { name: 'Bebas Neue', value: "'Bebas Neue', cursive", category: 'display' },
        { name: 'Abril Fatface', value: "'Abril Fatface', cursive", category: 'display' },
      ].sort((a, b) => a.name.localeCompare(b.name));
  }

  private loadCloudinaryEffects(): void {
    this.allCloudinaryEffects = [
      { name: 'None', transformation: 'none', hasIntensity: false, min: 0, max: 0, defaultValue: 0 },
      { name: 'Sepia', transformation: 'e_sepia', hasIntensity: true, min: 1, max: 100, defaultValue: 80 },
      { name: 'Vibrance', transformation: 'e_vibrance', hasIntensity: true, min: 1, max: 100, defaultValue: 70 },
      { name: 'Grayscale', transformation: 'e_grayscale', hasIntensity: false, min: 0, max: 0, defaultValue: 0 },
      { name: 'Cartoonify', transformation: 'e_cartoonify', hasIntensity: true, min: 1, max: 100, defaultValue: 50 },
      { name: 'Oil Painting', transformation: 'e_oil_paint', hasIntensity: true, min: 1, max: 100, defaultValue: 60 },
      { name: 'Outline', transformation: 'e_outline', hasIntensity: true, min: 1, max: 100, defaultValue: 50 },
      { name: 'Sharpen', transformation: 'e_sharpen', hasIntensity: true, min: 1, max: 2000, defaultValue: 400 },
      { name: 'Pixelate', transformation: 'e_pixelate', hasIntensity: true, min: 1, max: 200, defaultValue: 20 },
    ];
    this.selectedEffect = this.allCloudinaryEffects[0];
  }

  // --- TEXT LAYER MANAGEMENT ---

  addTextLayer(): void {
    const newLayer: TextLayer = { id: Date.now(), text: 'New Text', fontSize: 100, color: '#000000', fontFamily: "'Inter', sans-serif", opacity: 100, rotation: 0, vPos: 50, hPos: 50, align: 'center', isBold: true, isItalic: false, isUnderlined: false };
    this.textLayers.push(newLayer);
    this.selectTextLayer(newLayer.id);
  }

  selectTextLayer(id: number): void {
    this.activeLayerId = id;
  }

  deleteTextLayer(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.textLayers = this.textLayers.filter((l) => l.id !== id);
    if (this.activeLayerId === id) {
      this.activeLayerId = this.textLayers.length > 0 ? this.textLayers[0].id : null;
    }
  }

  // --- IMAGE UPLOAD & PROCESSING ---

  onDragOver(event: DragEvent): void { event.preventDefault(); event.stopPropagation(); if (!this.isImageUploaded) this.isDragging = true; }
  onDragLeave(event: DragEvent): void { event.preventDefault(); event.stopPropagation(); this.isDragging = false; }
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (!this.isImageUploaded) {
      const file = event.dataTransfer?.files[0];
      if (file && file.type.startsWith('image/')) this.processFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File): void {
    if (!this.cloudName || !this.uploadPreset) {
      alert('Cloudinary credentials are not configured.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        this.originalImageAspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
        this.uploadToCloudinary(file);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  private uploadToCloudinary(file: File): void {
    this.isLoading = true;
    this.isImageUploaded = false;
    this.messageText = 'Uploading image...';
    this.backgroundImageUrl = null;
    this.foregroundImageUrl = null;
    this.originalBackgroundImageUrl = null;
    this.originalForegroundImageUrl = null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    this.http.post<any>(uploadUrl, formData).subscribe({
      next: (response) => {
        this.messageText = 'Processing background removal...';
        const publicId = response.public_id;
        const version = response.version;
        
        this.originalBackgroundImageUrl = response.secure_url;
        this.originalForegroundImageUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload/e_background_removal,f_png/v${version}/${publicId}.png`;

        this.rebuildImageUrls();
        
        this.isImageUploaded = true;
      },
      error: (err) => {
        console.error('Cloudinary API Error:', err);
        this.isLoading = false;
        this.messageText = `Error: ${err.error?.error?.message || 'Failed to upload image.'}`;
        this.backgroundImageUrl = null;
      },
    });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  discardImage(): void {
    this.backgroundImageUrl = null;
    this.foregroundImageUrl = null;
    this.isImageUploaded = false;
    this.isDragging = false;
    this.messageText = '';
    this.textLayers = [];
    this.activeLayerId = null;
    this.aspectRatioSelection = 'original';
    this.originalImageAspectRatio = null;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    this.resetEffects();
    this.isEffectLoading = false;
    this.isLoading = false;
  }

  // --- EFFECTS ENGINE ---
  
  applyCloudinaryEffect(effect: CloudinaryEffect): void {
    this.selectedEffect = effect;
    if (this.selectedEffect) {
      this.effectIntensity = this.selectedEffect.defaultValue;
    }
    this.rebuildImageUrls(true);
  }

  onIntensityChange(): void {
    this.rebuildImageUrls(false);
  }

  rebuildImageUrls(showLoader: boolean = false): void {
    if (!this.originalBackgroundImageUrl) return;
    
    if (showLoader) {
      this.isEffectLoading = true;
    }

    const bgTransforms: string[] = [];
    
    if (this.selectedEffect && this.selectedEffect.transformation !== 'none') {
      let effectTransform = this.selectedEffect.transformation;
      if (this.selectedEffect.hasIntensity) {
        effectTransform += `:${this.effectIntensity}`;
      }
      bgTransforms.push(effectTransform);
    }
    
    const buildUrl = (originalUrl: string, transforms: string[]): string => {
      if (transforms.length === 0) return originalUrl;
      const urlParts = originalUrl.split('/upload/');
      const publicIdWithVersion = urlParts[1].substring(urlParts[1].indexOf('v'));
      return `${urlParts[0]}/upload/${transforms.join(',')}/${publicIdWithVersion}`;
    };

    this.backgroundImageUrl = buildUrl(this.originalBackgroundImageUrl, bgTransforms);
    this.foregroundImageUrl = this.originalForegroundImageUrl;
  }
  
  onImageLoad(): void {
    this.isLoading = false;
    if (this.isEffectLoading){
      setTimeout(() => {
        this.isEffectLoading = false;
      }, 4000);
    }
    this.messageText = '';
  }

  resetEffects(): void {
    this.brightness = 100;
    this.contrast = 100;
    this.blur = 0;
    this.hdr = 0;
    this.selectedEffect = this.allCloudinaryEffects[0];
    this.rebuildImageUrls(false);
  }

  // --- IMAGE DOWNLOAD ---

  downloadImage(): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.backgroundImageUrl) return;

    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.onload = () => {
      const previewEl = document.getElementById('previewContainer');
      if (!previewEl) return;
      const aspectRatio = previewEl.clientWidth / previewEl.clientHeight;
      canvas.width = bgImg.naturalWidth;
      canvas.height = bgImg.naturalWidth / aspectRatio;
      ctx.filter = this.backgroundCssFilters;
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';

      this.textLayers.forEach((layer) => {
        const scale = canvas.width / previewEl.clientWidth;
        ctx.font = `${layer.isItalic ? 'italic ' : ''}${layer.isBold ? '900 ' : '400 '}${layer.fontSize * scale}px ${layer.fontFamily}`;
        ctx.fillStyle = layer.color;
        ctx.globalAlpha = layer.opacity / 100;
        ctx.textAlign = layer.align;
        const xPos = canvas.width * (layer.hPos / 100);
        const yPos = canvas.height * (layer.vPos / 100);
        ctx.save();
        ctx.translate(xPos, yPos);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        const lines = layer.text.split('\n');
        const lineHeight = layer.fontSize * 1.2 * scale;
        lines.forEach((line, index) => {
          ctx.fillText(line, 0, index * lineHeight + (lineHeight / 4));
        });
        ctx.restore();
      });

      const fgImg = new Image();
      fgImg.crossOrigin = 'anonymous';
      fgImg.onload = () => {
        ctx.globalAlpha = 1;
        ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height);
        const link = document.createElement('a');
        link.download = `${this.fileName || 'Cool TBI'}.${this.downloadFormat}`;
        const mimeType = this.downloadFormat === 'jpg' ? 'image/jpeg' : 'image/png';
        const quality = this.downloadFormat === 'jpg' ? 0.9 : 1.0;
        link.href = canvas.toDataURL(mimeType, quality);
        link.click();
      };
      if (this.foregroundImageUrl) fgImg.src = this.foregroundImageUrl;
    };
    bgImg.src = this.backgroundImageUrl;
  }


//upload the image

  saveImage(): void {
    // 1. Create a canvas, just like in the download function
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.backgroundImageUrl) {
      console.error('Canvas or background image not available.');
      return;
    }

    // This logic is copied from your downloadImage() function
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.onload = () => {
      const previewEl = document.getElementById('previewContainer');
      if (!previewEl) return;

      const aspectRatio = previewEl.clientWidth / previewEl.clientHeight;
      canvas.width = bgImg.naturalWidth;
      canvas.height = bgImg.naturalWidth / aspectRatio;
      ctx.filter = this.backgroundCssFilters;
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';

      // Draw text layers
      this.textLayers.forEach((layer) => {
        const scale = canvas.width / previewEl.clientWidth;
        ctx.font = `${layer.isItalic ? 'italic ' : ''}${layer.isBold ? '900 ' : '400 '}${layer.fontSize * scale}px ${layer.fontFamily}`;
        ctx.fillStyle = layer.color;
        ctx.globalAlpha = layer.opacity / 100;
        ctx.textAlign = layer.align;
        const xPos = canvas.width * (layer.hPos / 100);
        const yPos = canvas.height * (layer.vPos / 100);
        ctx.save();
        ctx.translate(xPos, yPos);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        const lines = layer.text.split('\n');
        const lineHeight = layer.fontSize * 1.2 * scale;
        lines.forEach((line, index) => {
          ctx.fillText(line, 0, index * lineHeight + (lineHeight / 4));
        });
        ctx.restore();
      });

      // Draw foreground image
      const fgImg = new Image();
      fgImg.crossOrigin = 'anonymous';
      fgImg.onload = () => {
        ctx.globalAlpha = 1;
        ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height);

        // 2. Convert the final canvas to a Blob
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('Failed to create blob from canvas.');
            return;
          }

          // 3. Use the Blob to upload the image via your service
          const formData = new FormData();
          // Append the blob as a file with the user-defined filename
          formData.append('image', blob, `${this.fileName || 'Cool-TBI'}.png`);
          formData.append('description', 'Created with the TBI tool'); // Or any other description

          console.log('Uploading final image...');
          // This assumes you have an 'imageService' injected
          
          this.imageService.uploadImage(formData).subscribe({
            next: (response) => {
              this.toast.show('Image uploaded successfully!', 'success');
              console.log('File uploaded successfully', response);
              // Add any success message for the user
            },
            error: (error) => {
              this.toast.show('Error uploading file:', 'error');
              console.error('Error uploading file:', error);
            }
          });
          
        }, 'image/png', 1.0); // Use PNG for high quality
      };
      // Make sure to handle the case where there is no foreground image
      if (this.foregroundImageUrl) {
        fgImg.src = this.foregroundImageUrl;
      } else {
        // If there's no foreground, trigger the blob conversion directly
        fgImg.onload(new Event('load'));
      }
    };
    bgImg.src = this.backgroundImageUrl;
  }


  //ui
  steps = [
    {
      number: '1',
      Image: 'upload-h.svg',
      title: 'Upload Photo',
      description: 'Upload any image from your device',
    },

    {
      number: '2',
      Image: 'edit-h.svg',
      title: 'Add Text',
      description: 'Make any adjustments you need',
    },
    {
      number: '3',
      Image: 'service-h.svg',
      title: 'Settings',
      description: 'Select brightness and contrast & aspect ratio',
    },
    {
      number: '4',
      Image: 'download-h.svg',
      title: 'Download',
      description: 'Export in high quality format',
    },
  ];

}
