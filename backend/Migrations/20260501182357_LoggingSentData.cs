using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class LoggingSentData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rules_Topics_ElseActionTopicId",
                table: "Rules");

            migrationBuilder.CreateTable(
                name: "SentData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    SentAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Payload = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ErrorMessage = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SentTopicId = table.Column<int>(type: "int", nullable: false),
                    RuleId = table.Column<int>(type: "int", nullable: false),
                    TriggerSensorDataId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SentData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SentData_Rules_RuleId",
                        column: x => x.RuleId,
                        principalTable: "Rules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SentData_SensorData_TriggerSensorDataId",
                        column: x => x.TriggerSensorDataId,
                        principalTable: "SensorData",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SentData_Topics_SentTopicId",
                        column: x => x.SentTopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_SentData_RuleId",
                table: "SentData",
                column: "RuleId");

            migrationBuilder.CreateIndex(
                name: "IX_SentData_SentTopicId",
                table: "SentData",
                column: "SentTopicId");

            migrationBuilder.CreateIndex(
                name: "IX_SentData_TriggerSensorDataId",
                table: "SentData",
                column: "TriggerSensorDataId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Rules_Topics_ElseActionTopicId",
                table: "Rules",
                column: "ElseActionTopicId",
                principalTable: "Topics",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rules_Topics_ElseActionTopicId",
                table: "Rules");

            migrationBuilder.DropTable(
                name: "SentData");

            migrationBuilder.AddForeignKey(
                name: "FK_Rules_Topics_ElseActionTopicId",
                table: "Rules",
                column: "ElseActionTopicId",
                principalTable: "Topics",
                principalColumn: "Id");
        }
    }
}
