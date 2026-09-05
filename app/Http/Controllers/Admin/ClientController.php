<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\ClientNote;
use App\Models\ContactLead;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Clients', [
            'clients' => Client::with(['notes', 'project:id', 'lead:id,name'])
                ->orderBy('status')->orderBy('order')->orderByDesc('id')
                ->get()
                ->map(fn ($c) => array_merge($c->toArray(), [
                    'deal_value' => $c->deal_value / 100,
                    'project_title' => $c->project?->translations()->where('locale', 'pt-BR')->value('title'),
                ])),
            'projects' => Project::with('translations')->orderBy('order')->get()
                ->map(fn ($p) => ['id' => $p->id, 'title' => $p->translations->firstWhere('locale', 'pt-BR')?->title ?? "Projeto #{$p->id}"]),
            'leads' => ContactLead::latest()->take(50)->get(['id', 'name', 'email']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['order'] = Client::where('status', $data['status'])->max('order') + 1;
        $client = Client::create($data);

        if ($request->filled('first_note')) {
            $client->notes()->create(['body' => $request->first_note, 'kind' => 'note']);
        }

        return back()->with('success', 'Cliente adicionado.');
    }

    public function update(Request $request, Client $client)
    {
        $old = $client->status;
        $client->update($this->validated($request));

        if ($old !== $client->status) {
            $client->notes()->create([
                'body' => "Status alterado de \"{$old}\" para \"{$client->status}\".",
                'kind' => 'status_change',
            ]);
        }

        return back()->with('success', 'Cliente atualizado.');
    }

    /** Move no kanban (status + ordem). */
    public function move(Request $request, Client $client)
    {
        $data = $request->validate([
            'status' => 'required|in:' . implode(',', Client::STATUSES),
            'order' => 'required|integer|min:0',
        ]);

        $old = $client->status;
        $client->update($data);

        if ($old !== $data['status']) {
            $client->notes()->create([
                'body' => "Status alterado de \"{$old}\" para \"{$data['status']}\".",
                'kind' => 'status_change',
            ]);
        }

        return back(303);
    }

    public function destroy(Client $client)
    {
        $client->delete();

        return back()->with('success', 'Cliente removido.');
    }

    public function addNote(Request $request, Client $client)
    {
        $data = $request->validate([
            'body' => 'required|string|max:5000',
            'kind' => 'required|in:note,call,meeting,email',
        ]);

        $client->notes()->create($data);

        return back()->with('success', 'Anotação adicionada.');
    }

    public function destroyNote(Client $client, ClientNote $note)
    {
        abort_unless($note->client_id === $client->id, 404);
        $note->delete();

        return back()->with('success', 'Anotação removida.');
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => 'required|string|max:160',
            'company' => 'nullable|string|max:160',
            'email' => 'nullable|email|max:190',
            'phone' => 'nullable|string|max:40',
            'status' => 'required|in:' . implode(',', Client::STATUSES),
            'deal_value' => 'nullable|numeric|min:0',
            'source' => 'nullable|string|max:60',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:40',
            'qualification' => 'nullable|array',
            'qualification.*' => 'boolean',
            'next_action' => 'nullable|string|max:200',
            'next_action_at' => 'nullable|date',
            'project_id' => 'nullable|exists:projects,id',
            'lead_id' => 'nullable|exists:contact_leads,id',
        ]);

        $data['deal_value'] = (int) round(($data['deal_value'] ?? 0) * 100);
        // só mantém as chaves BANT válidas
        $data['qualification'] = collect($data['qualification'] ?? [])
            ->only(array_keys(Client::QUALIFICATION))->map(fn ($v) => (bool) $v)->all();

        return $data;
    }

    /** Resumo para a Visão Geral. */
    public static function overviewSummary(): array
    {
        $byStatus = Client::selectRaw('status, count(*) as c, coalesce(sum(deal_value),0) as v')
            ->groupBy('status')->get()->keyBy('status');

        $upcoming = Client::whereNotNull('next_action_at')
            ->whereIn('status', ['lead', 'prospect', 'contacted', 'proposal'])
            ->orderBy('next_action_at')
            ->take(8)
            ->get(['id', 'name', 'company', 'next_action', 'next_action_at'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'company' => $c->company,
                'next_action' => $c->next_action,
                'next_action_at' => $c->next_action_at?->toDateString(),
                'overdue' => $c->next_action_at && $c->next_action_at->isPast() && ! $c->next_action_at->isToday(),
                'today' => $c->next_action_at && $c->next_action_at->isToday(),
            ]);

        $count = fn ($s) => (int) ($byStatus[$s]->c ?? 0);
        $val = fn ($s) => (int) ($byStatus[$s]->v ?? 0);

        $won = $count('won');
        $lost = $count('lost');
        $closed = $won + $lost;
        $activeLeads = $count('lead');

        // leads em "lead" ainda não qualificados (nenhum item BANT marcado)
        $unqualified = Client::where('status', 'lead')->get('qualification')
            ->filter(fn ($c) => empty(array_filter((array) $c->qualification)))
            ->count();

        // últimos leads adicionados por prospecção
        $recentProspects = Client::where('source', 'like', 'Prospecção%')
            ->latest()->take(6)
            ->get(['id', 'name', 'phone', 'tags', 'status', 'created_at'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'phone' => $c->phone,
                'tags' => $c->tags,
                'status' => $c->status,
                'when' => $c->created_at?->diffForHumans(),
            ]);

        return [
            'total' => (int) Client::count(),
            'pipeline' => collect(Client::STATUSES)->map(fn ($s) => [
                'status' => $s,
                'count' => $count($s),
                'value' => $val($s),
            ]),
            'won_value' => $val('won'),
            'open_value' => (int) collect(['lead', 'prospect', 'contacted', 'proposal'])->sum($val),
            'active_leads' => $activeLeads,
            'unqualified' => $unqualified,
            'won_count' => $won,
            'conversion' => $closed > 0 ? round($won / $closed * 100) : 0,
            'overdue_count' => Client::whereNotNull('next_action_at')
                ->whereIn('status', ['lead', 'prospect', 'contacted', 'proposal'])
                ->whereDate('next_action_at', '<', now()->toDateString())->count(),
            'recent_prospects' => $recentProspects,
            'upcoming' => $upcoming,
        ];
    }
}
