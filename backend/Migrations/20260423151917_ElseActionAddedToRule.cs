using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ElseActionAddedToRule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ElseActionField",
                table: "Rules",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "ElseActionTopicId",
                table: "Rules",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ElseActionValue",
                table: "Rules",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Rules_ElseActionTopicId",
                table: "Rules",
                column: "ElseActionTopicId");

            migrationBuilder.AddForeignKey(
                name: "FK_Rules_Topics_ElseActionTopicId",
                table: "Rules",
                column: "ElseActionTopicId",
                principalTable: "Topics",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rules_Topics_ElseActionTopicId",
                table: "Rules");

            migrationBuilder.DropIndex(
                name: "IX_Rules_ElseActionTopicId",
                table: "Rules");

            migrationBuilder.DropColumn(
                name: "ElseActionField",
                table: "Rules");

            migrationBuilder.DropColumn(
                name: "ElseActionTopicId",
                table: "Rules");

            migrationBuilder.DropColumn(
                name: "ElseActionValue",
                table: "Rules");
        }
    }
}
