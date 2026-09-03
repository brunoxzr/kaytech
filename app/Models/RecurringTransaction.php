<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOwner;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringTransaction extends Model
{
    
    use BelongsToOwner;
protected $fillable = [
        'owner_id', 'account_id', 'category_id', 'type', 'amount', 'description',
        'frequency', 'day_of_month', 'starts_on', 'ends_on', 'last_generated_on', 'active',
    ];

    protected $casts = [
        'amount' => 'integer',
        'starts_on' => 'date',
        'ends_on' => 'date',
        'last_generated_on' => 'date',
        'active' => 'boolean',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'account_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(FinancialCategory::class, 'category_id');
    }
}
