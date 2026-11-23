<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_contents', function (Blueprint $table) {
            $table->id();
            $table->string('key', 60)->unique();
            $table->json('draft')->nullable();
            $table->json('published')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('draft_updated_at')->nullable();
            $table->foreignId('draft_updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('site_content_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_content_id')->constrained()->cascadeOnDelete();
            $table->json('content');
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['site_content_id', 'created_at']);
        });

        Schema::create('site_media', function (Blueprint $table) {
            $table->id();
            $table->string('disk', 40);
            $table->string('path');
            $table->string('url', 2048);
            $table->string('original_name');
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('size');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_media');
        Schema::dropIfExists('site_content_revisions');
        Schema::dropIfExists('site_contents');
    }
};
