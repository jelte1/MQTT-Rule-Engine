using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class LoggingSentData2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rules_Topics_ActionTopicId",
                table: "Rules");

            migrationBuilder.DropForeignKey(
                name: "FK_Rules_Topics_ConditionTopicId",
                table: "Rules");

            migrationBuilder.DropForeignKey(
                name: "FK_Rules_Topics_ElseActionTopicId",
                table: "Rules");

            migrationBuilder.AddForeignKey(
                name: "FK_Rules_Topics_ActionTopicId",
                table: "Rules",
                column: "ActionTopicId",
                principalTable: "Topics",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Rules_Topics_ConditionTopicId",
                table: "Rules",
                column: "ConditionTopicId",
                principalTable: "Topics",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Rules_Topics_ElseActionTopicId",
                table: "Rules",
                column: "ElseActionTopicId",
                principalTable: "Topics",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rules_Topics_ActionTopicId",
                table: "Rules");

            migrationBuilder.DropForeignKey(
                name: "FK_Rules_Topics_ConditionTopicId",
                table: "Rules");

            migrationBuilder.DropForeignKey(
                name: "FK_Rules_Topics_ElseActionTopicId",
                table: "Rules");

            migrationBuilder.AddForeignKey(
                name: "FK_Rules_Topics_ActionTopicId",
                table: "Rules",
                column: "ActionTopicId",
                principalTable: "Topics",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Rules_Topics_ConditionTopicId",
                table: "Rules",
                column: "ConditionTopicId",
                principalTable: "Topics",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Rules_Topics_ElseActionTopicId",
                table: "Rules",
                column: "ElseActionTopicId",
                principalTable: "Topics",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
