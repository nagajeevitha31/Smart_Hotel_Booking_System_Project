import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hotel-form-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotel-form-manager.component.html',
  styleUrl: './hotel-form-manager.component.css'
})
export class HotelFormManagerComponent {
  submitting = input<boolean>(false);
  amenitiesList = input<any[]>([]); 
  formModel = model.required<any>();
  submit = output<void>();

  onAmenityToggle(id: number) {
    const currentModel = this.formModel();
    if (!currentModel.amenityIds) {
      currentModel.amenityIds = [];
    }

    if (currentModel.amenityIds.includes(id)) {
      currentModel.amenityIds = currentModel.amenityIds.filter((aId: number) => aId !== id);
    } else {
      currentModel.amenityIds = [...currentModel.amenityIds, id];
    }
    
    this.formModel.set({ ...currentModel });
  }

  onSubmit() {
    this.submit.emit();
  }
}