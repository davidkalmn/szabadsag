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
        Schema::table('leaves', function (Blueprint $table) {
            // Use string for SQLite compatibility, enum validation is handled in the model
            if (DB::getDriverName() === 'sqlite') {
                $table->string('category')->default('szabadsag');
            } else {
                $table->enum('category', ['szabadsag', 'betegszabadsag', 'tappenzt', 'egyeb_tavollet'])->default('szabadsag')->after('user_id');
            }
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leaves', function (Blueprint $table) {
            $table->dropIndex(['category']);
            $table->dropColumn('category');
        });
    }
};


