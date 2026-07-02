using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Migrations
{
    /// <inheritdoc />
    public partial class service_migration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MyUsers",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Guest"),
                    ApprovalStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ContactNumber = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MyUsers", x => x.UserId);
                });

            migrationBuilder.InsertData(
                table: "MyUsers",
                columns: new[] { "UserId", "ApprovalStatus", "ContactNumber", "CreatedAt", "Email", "IsActive", "Name", "PasswordHash", "Role", "UpdatedAt" },
                values: new object[] { 1, "Approved", "9999999999", new DateTime(2026, 6, 26, 11, 34, 33, 734, DateTimeKind.Utc).AddTicks(7040), "admin@smarthotel.com", true, "System Admin", "$2a$11$RpBUO6OR5QPW.lYsugPJl.ZqzMPmU7BCqSj4SA1Gky5JTsycpGpp2", "Admin", null });

            migrationBuilder.CreateIndex(
                name: "IX_MyUsers_Email",
                table: "MyUsers",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MyUsers");
        }
    }
}
