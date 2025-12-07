<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // SQLite doesn't support MODIFY COLUMN, so we need to handle it differently
        if (DB::getDriverName() === 'sqlite') {
            // For SQLite, we can't modify the column, but the application will handle the 'egyeb_tavollet' category
            // The column is already a string type in SQLite, so no migration needed
            return;
        }
        
        // For MySQL/MariaDB, update the enum to include 'egyeb_tavollet'
        DB::statement("ALTER TABLE leaves MODIFY COLUMN category ENUM('szabadsag', 'betegszabadsag', 'tappenzt', 'egyeb_tavollet') DEFAULT 'szabadsag'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }
        
        // Revert back to original enum values (remove egyeb_tavollet)
        DB::statement("ALTER TABLE leaves MODIFY COLUMN category ENUM('szabadsag', 'betegszabadsag', 'tappenzt') DEFAULT 'szabadsag'");
    }
};

