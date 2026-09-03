<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOwner;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialTransaction extends Model
{
    
    use BelongsToOwner;
protected $fillable = [
        'owner_id', 'account_id', 'category_id', 'transfer_account_id', 'type', 'amount',
        'description', 'notes', 'date', 'paid', 'recurring_id',
    ];

    protected $casts = [
        'amount' => 'integer',
        'date' => 'date',
        'paid' => 'boolean',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'account_id');
    }

    public function transferAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'transfer_account_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(FinancialCategory::class, 'category_id');
    }

    public function scopePaid($query)
    {
        return $query->where('paid', true);
    }

    public function scopeInMonth($query, int $year, int $month)
    {
        return $query->whereYear('date', $year)->whereMonth('date', $month);
    }
}
