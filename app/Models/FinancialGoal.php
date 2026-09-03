<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOwner;
use Illuminate\Database\Eloquent\Model;

class FinancialGoal extends Model
{
    
    use BelongsToOwner;
protected $fillable = [
        'owner_id', 'name', 'target_amount', 'current_amount', 'target_date', 'color', 'achieved',
    ];

    protected $casts = [
        'target_amount' => 'integer',
        'current_amount' => 'integer',
        'target_date' => 'date:Y-m-d',
        'achieved' => 'boolean',
    ];
}
