<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One portal-wide activity log: partner events, website publishing, media,
     * settings, account changes and sign-ins.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('partner_id')->nullable()->constrained()->nullOnDelete();
            $table->string('category', 20);
            $table->string('action', 100);
            $table->string('subject_type', 100)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamps();
            $table->index('created_at');
            $table->index(['category', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        // Bring the existing history along so the log starts complete.
        DB::table('partner_audit_logs')->orderBy('id')->chunk(500, function ($rows) {
            DB::table('activity_logs')->insert($rows->map(fn ($row) => [
                'user_id' => $row->user_id,
                'partner_id' => $row->partner_id,
                'category' => 'partner',
                'action' => $row->action,
                'subject_type' => $row->subject_type,
                'subject_id' => $row->subject_id,
                'details' => $row->details,
                'ip_address' => $row->ip_address,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ])->all());
        });

        DB::table('site_content_revisions')
            ->join('site_contents', 'site_contents.id', '=', 'site_content_revisions.site_content_id')
            ->orderBy('site_content_revisions.id')
            ->select(['site_content_revisions.id', 'site_content_revisions.published_by', 'site_content_revisions.created_at', 'site_contents.key'])
            ->chunk(500, function ($rows) {
                DB::table('activity_logs')->insert($rows->map(fn ($row) => [
                    'user_id' => $row->published_by,
                    'category' => 'content',
                    'action' => 'content_published',
                    'subject_type' => 'App\\Models\\SiteContentRevision',
                    'subject_id' => $row->id,
                    'details' => json_encode(['page' => $row->key]),
                    'created_at' => $row->created_at,
                    'updated_at' => $row->created_at,
                ])->all());
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
