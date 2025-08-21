import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

// Interface for a Text Layer's properties
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

@Component({
  selector: 'app-tbi',
  templateUrl: './tbi.component.html',
  standalone: false,
  styleUrl: './tbi.component.scss',
})
export class TbiComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  cloudName = environment.cloudinary.cloudName;
  uploadPreset = environment.cloudinary.uploadPreset;

  textLayers: TextLayer[] = [];
  activeLayerId: number | null = null;
  activeTab: 'text' | 'image' | 'settings' = 'text';
  isDragging = false;

  backgroundImageUrl: string | null = null;
  foregroundImageUrl: string | null = null;

  isLoading = false;
  messageText = '';
  isImageUploaded = false;
  brightness = 100;
  contrast = 100;

  aspectRatioSelection = 'original';
  originalImageAspectRatio: string | null = null;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
    if (
      !this.cloudName ||
      !this.uploadPreset ||
      this.cloudName === 'YOUR_CLOUD_NAME'
    ) {
      this.messageText =
        'Please configure your Cloudinary credentials in the environment file.';
    }
  }

  get safeBackgroundImage(): SafeUrl | null {
    return this.backgroundImageUrl
      ? this.sanitizer.bypassSecurityTrustUrl(this.backgroundImageUrl)
      : null;
  }

  get safeForegroundImage(): SafeUrl | null {
    return this.foregroundImageUrl
      ? this.sanitizer.bypassSecurityTrustUrl(this.foregroundImageUrl)
      : null;
  }

  get activeLayer(): TextLayer | undefined {
    return this.textLayers.find((l) => l.id === this.activeLayerId);
  }

  addTextLayer(): void {
    const newLayer: TextLayer = {
      id: Date.now(),
      text: 'New Text',
      fontSize: 100,
      color: '#000000',
      fontFamily: "'Inter', sans-serif",
      opacity: 100,
      rotation: 0,
      vPos: 50,
      hPos: 50,
      align: 'center',
      isBold: true,
      isItalic: false,
      isUnderlined: false,
    };
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
      this.activeLayerId =
        this.textLayers.length > 0 ? this.textLayers[0].id : null;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isImageUploaded) this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

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

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    this.http.post<any>(uploadUrl, formData).subscribe({
      next: (response) => {
        this.messageText = 'Processing background removal...';

        const originalUrl = response.secure_url;
        this.backgroundImageUrl = originalUrl;

        const publicId = response.public_id;
        const version = response.version;
        this.foregroundImageUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload/e_background_removal,f_png/v${version}/${publicId}.png`;

        this.isLoading = false;
        this.isImageUploaded = true;
        this.messageText = '';
      },
      error: (err) => {
        console.error('Cloudinary API Error:', err);
        this.isLoading = false;
        this.messageText = `Error: ${
          err.error?.error?.message || 'Failed to upload image.'
        }`;
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
    this.brightness = 100;
    this.contrast = 100;
    this.aspectRatioSelection = 'original';
    this.originalImageAspectRatio = null;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

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
      ctx.filter = `brightness(${this.brightness}%) contrast(${this.contrast}%)`;
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';
      this.textLayers.forEach((layer) => {
        const scale = canvas.width / previewEl.clientWidth;
        ctx.font = `${layer.isItalic ? 'italic ' : ''}${
          layer.isBold ? '900 ' : '400 '
        }${layer.fontSize * scale}px ${layer.fontFamily}`;
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
          ctx.fillText(line, 0, index * lineHeight + lineHeight / 4);
        });
        ctx.restore();
      });
      const fgImg = new Image();
      fgImg.crossOrigin = 'anonymous';
      fgImg.onload = () => {
        ctx.globalAlpha = 1;
        ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height);
        const link = document.createElement('a');
        link.download = 'layered-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      if (this.foregroundImageUrl) fgImg.src = this.foregroundImageUrl;
    };
    bgImg.src = this.backgroundImageUrl;
  }

  //ui
  featureCards = [
    {
      icon: 'ifc.svg',
      title: 'Enhance Profile Pic',
      description: 'Write, edit, and execute code effortlessly.',
    },
    {
      icon: 'dfc.svg',
      title: 'Access it AnyTime',
      description: 'Invite team members and set up roles in just a few clicks.',
    },
    {
      icon: 'sfc.svg',
      title: 'AI',
      description:
        'Powered by OnceHub, CodeOnce ensures lightning-fast execution.',
    },
    {
      icon: 'tfc.svg',
      title: 'Add Text',
      description: 'Visualize user progress and detailed reports.',
    },
  ];
}



