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
        // Update the enum to include 'egyeb_tavollet'
        DB::statement("ALTER TABLE leaves MODIFY COLUMN category ENUM('szabadsag', 'betegszabadsag', 'tappenzt', 'egyeb_tavollet') DEFAULT 'szabadsag'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values (remove egyeb_tavollet)
        DB::statement("ALTER TABLE leaves MODIFY COLUMN category ENUM('szabadsag', 'betegszabadsag', 'tappenzt') DEFAULT 'szabadsag'");
    }
};

