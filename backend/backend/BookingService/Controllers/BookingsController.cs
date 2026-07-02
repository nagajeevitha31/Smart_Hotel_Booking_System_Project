using BookingService.DTOs;
using BookingService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookingService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingManagementService _bookingService;

        public BookingsController(IBookingManagementService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetAllBookings()
        {
            var result = await _bookingService.GetAllBookingsAsync();
            return Ok(result);
        }

        [HttpGet("my-bookings")]
        [Authorize]
        public async Task<IActionResult> GetMyBookings()
        {
            var userId = GetCurrentUserId();
            var result = await _bookingService.GetUserBookingsAsync(userId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetBookingById(int id)
        {
            var result = await _bookingService.GetBookingByIdAsync(id);
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto request)
        {
            var userId = GetCurrentUserId();
            var result = await _bookingService.CreateBookingAsync(request, userId);

            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetBookingById), new { id = result.Data?.BookingId }, result);
        }

        [HttpPost("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelBooking(int id, [FromBody] CancelBookingDto request)
        {
            var userId = GetCurrentUserId();
            var role = GetCurrentUserRole();
            var result = await _bookingService.CancelBookingAsync(id, request, userId, role);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }


        [HttpPost("check-availability")]
        public async Task<IActionResult> CheckRoomAvailability([FromBody] CheckAvailabilityDto request)
        {
            var result = await _bookingService.CheckRoomAvailabilityAsync(request);
            return Ok(result);
        }

        [HttpPut("{id}/payment")]
        public async Task<IActionResult> UpdateBookingPayment(int id, [FromBody] UpdateBookingPaymentDto request)
        {
            var result = await _bookingService.UpdateBookingPaymentAsync(id, request.PaymentId);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
        }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }

    public class UpdateBookingPaymentDto
    {
        public int PaymentId { get; set; }
    }
}
