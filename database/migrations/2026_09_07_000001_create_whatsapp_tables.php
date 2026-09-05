<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wa_chats', function (Blueprint $table) {
            $table->id();
            $table->string('remote_jid')->unique();      // 55439xxxx@s.whatsapp.net ou ...@g.us
            $table->string('phone', 30)->nullable();      // só dígitos, quando individual
            $table->string('name')->nullable();          // pushName / nome do grupo
            $table->boolean('is_group')->default(false);
            $table->string('profile_pic_url')->nullable();
            $table->text('last_message')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->unsignedInteger('unread')->default(0);
            $table->boolean('archived')->default(false);
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->timestamps();

            $table->index('last_message_at');
        });

        Schema::create('wa_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wa_chat_id')->constrained('wa_chats')->cascadeOnDelete();
            $table->string('wamid')->nullable()->index();   // id da mensagem na Evolution
            $table->boolean('from_me')->default(false);
            $table->string('type', 30)->default('text');    // text, image, audio, document, ...
            $table->text('body')->nullable();
            $table->string('media_url')->nullable();
            $table->string('status', 20)->nullable();        // sent, delivered, read, failed
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->unique(['wa_chat_id', 'wamid']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wa_messages');
        Schema::dropIfExists('wa_chats');
    }
};
