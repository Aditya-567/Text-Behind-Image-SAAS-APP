import { Component } from '@angular/core';

@Component({
  selector: 'app-about-us',
  standalone: false,
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss',
})
export class AboutUsComponent {


  
  steps = [
    {
      number: '1',
      Image: 'service-h.svg',
      title: 'Select Service',
      description: 'Add and style your text layers',
    },
    {
      number: '2',
      Image: 'upload-h.svg',
      title: 'Upload Photo',
      description: 'Upload any image from your device',
    },

    {
      number: '3',
      Image: 'edit-h.svg',
      title: 'Edit the Image',
      description: 'Place text behind image elements',
    },
    {
      number: '4',
      Image: 'download-h.svg',
      title: 'Download',
      description: 'Export in high quality PNG format',
    },
  ];
}
