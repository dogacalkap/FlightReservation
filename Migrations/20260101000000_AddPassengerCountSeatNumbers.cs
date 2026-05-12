using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlightReservation.Migrations
{
    public partial class AddPassengerCountSeatNumbers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PassengerCount",
                table: "Tickets",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "SeatNumbers",
                table: "Tickets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PassengerCount",
                table: "Reservations",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "SeatNumbers",
                table: "Reservations",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PassengerCount",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "SeatNumbers",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "PassengerCount",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "SeatNumbers",
                table: "Reservations");
        }
    }
}
