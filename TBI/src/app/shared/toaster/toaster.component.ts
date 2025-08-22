import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToasterService } from '../../services/toaster.service';

@Component({
  selector: 'app-toaster',
  standalone: false,
  templateUrl: './toaster.component.html',
  styleUrl: './toaster.component.scss',
})
export class ToasterComponent implements OnInit {
  constructor(public toasterService: ToasterService) {}

  ngOnInit() {}

  removeToast(id: number) {
    this.toasterService.remove(id);
  }
}
