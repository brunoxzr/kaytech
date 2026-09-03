<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOwner;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Budget extends Model
{
    
    use BelongsToOwner;
protected $fillable = ['owner_id', 'category_id', 'year', 'month', 'amount'];

    protected $casts = [
        'amount' => 'integer',
        'year' => 'integer',
        'month' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(FinancialCategory::class, 'category_id');
    }
}
