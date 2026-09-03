<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOwner;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinancialAccount extends Model
{
    
    use BelongsToOwner;
protected $fillable = [
        'owner_id', 'name', 'type', 'institution', 'opening_balance', 'color', 'archived', 'order',
    ];

    protected $casts = [
        'opening_balance' => 'integer',
        'archived' => 'boolean',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class, 'account_id');
    }

    /** Saldo atual em centavos, considerando apenas lançamentos pagos. */
    public function getCurrentBalanceAttribute(): int
    {
        $in = (int) $this->transactions()->where('paid', true)->where('type', 'income')->sum('amount');
        $out = (int) $this->transactions()->where('paid', true)->where('type', 'expense')->sum('amount');
        $transferOut = (int) $this->transactions()->where('paid', true)->where('type', 'transfer')->sum('amount');
        $transferIn = (int) FinancialTransaction::where('paid', true)
            ->where('type', 'transfer')
            ->where('transfer_account_id', $this->id)
            ->sum('amount');

        return $this->opening_balance + $in - $out - $transferOut + $transferIn;
    }
}
