<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])
                ->default('pending')
                ->change();
            $table->timestamp('refunded_at')->nullable()->after('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('payments')
            ->where('payment_status', 'refunded')
            ->update(['payment_status' => 'failed']);

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('refunded_at');
            $table->enum('payment_status', ['pending', 'paid', 'failed'])
                ->default('pending')
                ->change();
        });
    }
};
