<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE wa_messages ALTER COLUMN media_url TYPE text');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE wa_messages ALTER COLUMN media_url TYPE varchar(255)');
    }
};
