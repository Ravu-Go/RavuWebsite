<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartnerBenefitReviewHistory extends Model
{
    protected $table = 'partner_benefit_review_history';

    protected $fillable = ['proposed_partner_benefit_id', 'previous_status', 'new_status', 'changed_by', 'comment'];
}
