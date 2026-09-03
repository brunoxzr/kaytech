<?php

namespace App\Models\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Database\Eloquent\Model;

/**
 * Escopa o modelo ao usuário logado (owner_id) e preenche owner_id ao criar.
 * Financeiro isolado por usuário: ninguém vê os dados do outro.
 */
trait BelongsToOwner
{
    public static function bootBelongsToOwner(): void
    {
        static::addGlobalScope(new class implements Scope {
            public function apply(Builder $builder, Model $model): void
            {
                if ($id = auth()->id()) {
                    $builder->where($model->getTable() . '.owner_id', $id);
                }
            }
        });

        static::creating(function (Model $model) {
            if (! $model->owner_id && ($id = auth()->id())) {
                $model->owner_id = $id;
            }
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /** Ignora o escopo de dono (uso administrativo/console). */
    public static function anyOwner(): Builder
    {
        return static::withoutGlobalScopes();
    }
}
