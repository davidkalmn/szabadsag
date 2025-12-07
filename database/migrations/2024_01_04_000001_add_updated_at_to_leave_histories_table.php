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
        // Check if updated_at column already exists (it should if timestamps() was used in the initial migration)
        // This migration is only needed for databases created before timestamps() was added
        if (!Schema::hasColumn('leave_histories', 'updated_at')) {
            Schema::table('leave_histories', function (Blueprint $table) {
                if (DB::getDriverName() === 'sqlite') {
                    // SQLite doesn't support 'after', so we'll just add the column
                    $table->timestamp('updated_at')->nullable();
                } else {
                    $table->timestamp('updated_at')->nullable()->after('created_at');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Only drop if it exists and was added by this migration
        // Note: We can't easily determine if it was added by this migration or timestamps()
        // So we'll leave it in place to be safe
        // If you need to rollback, you can manually drop it
    }
};
