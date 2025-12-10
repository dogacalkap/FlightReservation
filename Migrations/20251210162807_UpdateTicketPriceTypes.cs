using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlightReservation.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTicketPriceTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "BaggagePrice",
                table: "Tickets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ExtrasTotal",
                table: "Tickets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SeatPrice",
                table: "Tickets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BaggagePrice",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ExtrasTotal",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "SeatPrice",
                table: "Tickets");
        }
    }
}
