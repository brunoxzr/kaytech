<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialGoal extends Model
{
    protected $fillable = [
        'name', 'target_amount', 'current_amount', 'target_date', 'color', 'achieved',
    ];

    protected $casts = [
        'target_amount' => 'integer',
        'current_amount' => 'integer',
        'target_date' => 'date',
        'achieved' => 'boolean',
    ];
}
