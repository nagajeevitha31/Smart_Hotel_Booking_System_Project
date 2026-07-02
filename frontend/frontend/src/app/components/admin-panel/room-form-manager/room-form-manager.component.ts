import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-form-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-form-manager.component.html',
  styleUrl: './room-form-manager.component.css'
})
export class RoomFormManagerComponent {
  hotels = input<any[]>([]); // Receives pool list from parent
  amenitiesList = input<any[]>([]); // Receives roomAmenities signal from parent
  submitting = input<boolean>(false);
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