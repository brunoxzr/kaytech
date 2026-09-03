<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOwner;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialGoal extends Model
{
    use BelongsToOwner;

    protected $fillable = [
        'owner_id', 'name', 'target_amount', 'current_amount', 'account_id', 'target_date', 'color', 'achieved',
    ];

    protected $casts = [
        'target_amount' => 'integer',
        'current_amount' => 'integer',
        'target_date' => 'date:Y-m-d',
        'achieved' => 'boolean',
    ];

    protected $appends = ['saved'];

    public function account(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'account_id');
    }

    /**
     * Valor efetivamente guardado: se a meta está vinculada a uma conta,
     * usa o saldo atual dessa conta; senão, o valor manual.
     */
    public function getSavedAttribute(): int
    {
        if ($this->account_id) {
            $account = $this->relationLoaded('account') ? $this->account : $this->account()->first();

            return max(0, (int) ($account?->current_balance ?? 0));
        }

        return (int) $this->current_amount;
    }
}
