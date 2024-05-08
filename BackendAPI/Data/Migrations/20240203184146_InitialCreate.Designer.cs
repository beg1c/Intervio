﻿// <auto-generated />
using API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace API.Data.Migrations
{
    [DbContext(typeof(DataContext))]
    [Migration("20240203184146_InitialCreate")]
    partial class InitialCreate
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "7.0.9");

            modelBuilder.Entity("API.Entities.Room", b =>
                {
                    b.Property<string>("name")
                        .HasColumnType("TEXT");

                    b.Property<string>("editor")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("language_id")
                        .HasColumnType("INTEGER");

                    b.Property<string>("question")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("name");

                    b.ToTable("Rooms");
                });
#pragma warning restore 612, 618
        }
    }
}