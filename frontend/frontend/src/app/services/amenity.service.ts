import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AmenityService {
  private http = inject(HttpClient);
  
  // Everything goes through the port 5000 gateway now!
  private gatewayUrl = 'http://localhost:5000/api'; 

  hotelAmenities = signal<any[]>([]);
  roomAmenities = signal<any[]>([]);

  // Hits: http://localhost:5000/api/HotelAmenities
  getHotelAmenities(): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/HotelAmenities`).pipe(
      tap(res => {
        const data = res.success ? res.data : res;
        const cleanArray = data?.$values || data || [];
        this.hotelAmenities.set(cleanArray);
      }),
      catchError(err => {
        console.error('Failed to load hotel service amenities pool via Gateway', err);
        return throwError(() => err);
      })
    );
  }

  // Hits: http://localhost:5000/api/RoomAmenities
  getRoomAmenities(): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/RoomAmenities`).pipe(
      tap(res => {
        const data = res.success ? res.data : res;
        const cleanArray = data?.$values || data || [];
        this.roomAmenities.set(cleanArray);
      }),
      catchError(err => {
        console.error('Failed to load room service amenities pool via Gateway', err);
        return throwError(() => err);
      })
    );
  }
}