import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { ReviewService } from '../../services/review.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { AmenityService } from '../../services/amenity.service';
import { AnalyticsStatsComponent } from './analytics-stats/analytics-stats.component';
import { HotelFormManagerComponent } from './hotel-form-manager/hotel-form-manager.component';
import { RoomFormManagerComponent } from './room-form-manager/room-form-manager.component';
import { ReviewModeratorComponent } from './review-moderator/review-moderator.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    AnalyticsStatsComponent, 
    HotelFormManagerComponent, 
    RoomFormManagerComponent, 
    ReviewModeratorComponent
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
  hotelService = inject(HotelService);
  reviewService = inject(ReviewService);
  bookingService = inject(BookingService);
  auth = inject(AuthService);
  amenityService = inject(AmenityService);

  activeTab = signal<'hotels' | 'reviews' | 'bookings' | 'approvals'>('hotels');
  roomFormHotels = signal<any[]>([]);
  
  isSubmittingHotel = signal(false);
  
  // Clean initialization with completely blank values instead of default mock texts
  hotelForm = {
    name: '',
    location: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    description: '',
    imageUrl: '',
    imageUrls: [] as string[],
    contactNumber: '',
    email: '',
    amenityIds: [] as number[]
  };

  isSubmittingRoom = signal(false);
  roomForm = {
    hotelId: 0,
    roomNumber: '',
    roomType: 'Double Room',
    description: '',
    pricePerNight: 5000,
    maxOccupancy: 2,
    bedCount: 1,
    bedType: 'Queen',
    floorNumber: 1,
    roomSize: 250,
    imageUrl: '',
    amenityIds: [] as number[]
  };

  selectedHotelIdForReviews = 0;
  reviewResponses: { [key: number]: string } = {};
  managers = signal<any[]>([]);
  selectedManagerForAssignment = signal<any | null>(null);
  assignedHotelIds = signal<number[]>([]);
  allHotels = signal<any[]>([]);
  selectedManagerForEdit = signal<any | null>(null);
  editManagerForm = { name: '', contactNumber: '' };
  editAssignedHotelIds = signal<number[]>([]);
  isSavingManagerEdit = signal(false);

  ngOnInit() {
    this.amenityService.getHotelAmenities().subscribe();
    this.amenityService.getRoomAmenities().subscribe();

    if (this.auth.isAdmin()) {
      this.hotelService.getAllHotels().subscribe({
        next: (res) => {
          const data = res.success ? res.data : res;
          this.roomFormHotels.set(data?.$values || data || []);
        }
      });
      this.bookingService.getAllBookings().subscribe();
      this.loadManagers();
      this.activeTab.set('approvals'); 
    } else if (this.auth.isManager()) {
      this.hotelService.getMyHotels().subscribe({
        next: (res) => {
          const data = res.success ? res.data : res;
          this.roomFormHotels.set(data?.$values || data || []);
        }
      });
      this.bookingService.getAllBookings().subscribe();
    }
  }

  loadManagers() {
    this.auth.getManagers().subscribe({
      next: (res) => {
        if (res.success) {
          this.managers.set(res.data || []);
        }
      }
    });
  }

  approveManager(id: number) {
    this.auth.updateManagerStatus(id, 'Approved').subscribe({
      next: (res) => {
        if (res.success) {
          this.loadManagers();
          this.openAssignmentModal(res.data);
        }
      }
    });
  }

  rejectManager(id: number) {
    if (confirm('Are you sure you want to reject this manager application?')) {
      this.auth.updateManagerStatus(id, 'Rejected').subscribe({
        next: () => this.loadManagers()
      });
    }
  }

  openAssignmentModal(manager: any) {
    this.selectedManagerForAssignment.set(manager);
    this.hotelService.getAllHotels().subscribe({
      next: (res) => {
        if (res.success) {
          this.allHotels.set(res.data || []);
        }
      }
    });
    this.hotelService.getHotelsByManager(manager.userId).subscribe({
      next: (res) => {
        if (res.success) {
          const list = res.data || [];
          this.assignedHotelIds.set(list.map((h: any) => h.hotelId));
        } else {
          this.assignedHotelIds.set([]);
        }
      }
    });
  }

  toggleHotelSelection(hotelId: number) {
    const current = this.assignedHotelIds();
    if (current.includes(hotelId)) {
      this.assignedHotelIds.set(current.filter(id => id !== hotelId));
    } else {
      this.assignedHotelIds.set([...current, hotelId]);
    }
  }

  saveAssignments() {
    const manager = this.selectedManagerForAssignment();
    if (!manager) return;

    this.hotelService.assignHotelsToManager(manager.userId, this.assignedHotelIds()).subscribe({
      next: (res) => {
        if (res.success) {
          this.selectedManagerForAssignment.set(null);
          this.loadManagers();
          this.refreshHotelsList();
        }
      }
    });
  }

  openEditManagerModal(manager: any) {
    this.selectedManagerForEdit.set(manager);
    this.editManagerForm.name = manager.name || '';
    this.editManagerForm.contactNumber = manager.contactNumber || '';

    this.hotelService.getAllHotels().subscribe({
      next: (res) => {
        if (res.success) {
          this.allHotels.set(res.data || []);
        }
      }
    });
    this.hotelService.getHotelsByManager(manager.userId).subscribe({
      next: (res) => {
        if (res.success) {
          const list = res.data || [];
          this.editAssignedHotelIds.set(list.map((h: any) => h.hotelId));
        } else {
          this.editAssignedHotelIds.set([]);
        }
      }
    });
  }

  toggleEditHotelSelection(hotelId: number) {
    const current = this.editAssignedHotelIds();
    if (current.includes(hotelId)) {
      this.editAssignedHotelIds.set(current.filter(id => id !== hotelId));
    } else {
      this.editAssignedHotelIds.set([...current, hotelId]);
    }
  }

  saveManagerEdits() {
    const manager = this.selectedManagerForEdit();
    if (!manager) return;
    if (this.isSavingManagerEdit()) return;

    this.isSavingManagerEdit.set(true);

    const profilePayload: any = {
      name: this.editManagerForm.name,
      contactNumber: this.editManagerForm.contactNumber
    };

    this.auth.updateProfile(manager.userId, profilePayload).subscribe({
      next: () => {
        this.hotelService.assignHotelsToManager(manager.userId, this.editAssignedHotelIds()).subscribe({
          next: (res) => {
            this.isSavingManagerEdit.set(false);
            if (res.success) {
              this.selectedManagerForEdit.set(null);
              this.loadManagers();
              this.hotelService.getAllHotels().subscribe();
            }
          },
          error: () => {
            this.isSavingManagerEdit.set(false);
          }
        });
      },
      error: () => {
        this.isSavingManagerEdit.set(false);
      }
    });
  }

  getManagerStatusClass(status: string): string {
    if (status === 'Approved') return 'badge-success';
    if (status === 'Pending') return 'badge-warning';
    return 'badge-danger';
  }

  submitHotel() {
    if(this.isSubmittingHotel()) return;
    this.isSubmittingHotel.set(true);

    // Formats single URL string input dynamically into the required string array format for backend
    const hotelPayload = {
      ...this.hotelForm,
      imageUrls: this.hotelForm.imageUrl ? [this.hotelForm.imageUrl] : [],
      amenityIds: this.hotelForm.amenityIds.map(id => Number(id))
    };

    this.hotelService.createHotel(hotelPayload).subscribe({
      next: () => {
        this.isSubmittingHotel.set(false);
        alert('Hotel registered successfully!');
        this.resetHotelForm();
        this.refreshHotelsList();
      },
      error: () => this.isSubmittingHotel.set(false)
    });
  }

  submitRoom() {
    if (this.roomForm.hotelId === 0) {
      alert('Please select a hotel first');
      return;
    }

    if(this.isSubmittingRoom()) return;
    this.isSubmittingRoom.set(true);

    // Maps the selected number IDs array into object array format expected by backend schema
    const mappedRoomAmenities = this.roomForm.amenityIds.map(id => ({
      amenityId: Number(id)
    }));

    const roomPayload = {
      hotelId: Number(this.roomForm.hotelId),
      roomNumber: String(this.roomForm.roomNumber),
      roomType: this.roomForm.roomType,
      description: this.roomForm.description || "Standard comfortable room setup",
      pricePerNight: Number(this.roomForm.pricePerNight),
      maxOccupancy: Number(this.roomForm.maxOccupancy),
      bedCount: Number(this.roomForm.bedCount),
      bedType: this.roomForm.bedType,
      floorNumber: Number(this.roomForm.floorNumber),
      roomSize: Number(this.roomForm.roomSize),
      imageUrl: this.roomForm.imageUrl || "",
      // Encapsulates single image input into collection list
      imageUrls: this.roomForm.imageUrl ? [this.roomForm.imageUrl] : [],
      amenities: mappedRoomAmenities 
    };

    this.hotelService.createRoom(roomPayload).subscribe({
      next: () => {
        this.isSubmittingRoom.set(false);
        alert('Room added successfully!');
        this.resetRoomForm();
      },
      error: (err) => {
        this.isSubmittingRoom.set(false);
        if (err.error && err.error.includes("duplicate key row")) {
          alert(`Room number ${this.roomForm.roomNumber} already exists in this hotel!`);
          return;
        }
        if (err.status === 201 || err.status === 200) {
          alert('Room added successfully!');
          this.resetRoomForm();
        } else {
          console.error(err);
          alert(`Server returned an error (${err.status}).`);
        }
      }
    });
  }

  private refreshHotelsList() {
    if (this.auth.isAdmin()) {
      this.hotelService.getAllHotels().subscribe();
    } else {
      this.hotelService.getMyHotels().subscribe();
    }
  }

  // Resets hotel properties to perfectly empty input targets
  resetHotelForm() {
    this.hotelForm = {
      name: '',
      location: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      description: '',
      imageUrl: '',
      imageUrls: [],
      contactNumber: '',
      email: '',
      amenityIds: []
    };
  }

 resetRoomForm() {
    this.roomForm = {
      hotelId: this.roomForm.hotelId, // Keeps the currently chosen hotel selected for faster room sequence entry
      roomNumber: '',
      roomType: 'Double Room',
      description: '',
      pricePerNight: 5000,
      maxOccupancy: 2,
      bedCount: 1,
      bedType: 'Queen',
      floorNumber: 1,
      roomSize: 250,
      imageUrl: '',
      amenityIds: []
    };
  }

  loadReviewsForHotel() {
    if (this.selectedHotelIdForReviews > 0) {
      this.reviewService.getHotelReviews(this.selectedHotelIdForReviews).subscribe();
    }
  }

  submitResponse(reviewId: number) {
    const text = this.reviewResponses[reviewId];
    if (!text || text.trim().length === 0) return;

    this.reviewService.respondToReview(reviewId, text, this.selectedHotelIdForReviews).subscribe({
      next: () => {
        delete this.reviewResponses[reviewId];
      }
    });
  }

  getBookingStatusClass(status: string): string {
    if (status === 'Confirmed' || status === 'Completed' || status === 'Paid') return 'badge-success';
    if (status === 'Pending') return 'badge-warning';
    return 'badge-danger';
  }
}