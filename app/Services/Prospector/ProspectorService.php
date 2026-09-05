<?php

namespace App\Services\Prospector;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Encontra empresas de um nicho numa cidade via Apify (scraper de Google Maps).
 * Dados reais e estruturados: nome, telefone, endereço, site, nº de avaliações, Instagram.
 * Foco em leads sem site próprio — bons alvos para vender landing page.
 */
class ProspectorService
{
    private const SOCIAL_HOSTS = [
        'instagram.com', 'facebook.com', 'fb.com', 'linktr.ee', 'linktree',
        'ifood.com.br', 'wa.me', 'api.whatsapp.com', 'goo.gl', 'bit.ly',
        'tiktok.com', 'twitter.com', 'x.com', 'youtube.com',
    ];

    /**
     * @return array{leads: array<int, array>, sources: array, note: ?string}
     */
    public function search(string $city, string $niche, int $limit = 15): array
    {
        $token = (string) config('services.apify.token');
        if ($token === '') {
            throw new RuntimeException('APIFY_TOKEN não configurado no servidor.');
        }

        $limit = max(3, min(60, $limit));
        $actor = (string) config('services.apify.places_actor', 'compass~crawler-google-places');

        $input = [
            'searchStringsArray' => ["{$niche} em {$city}"],
            'maxCrawledPlacesPerSearch' => $limit,
            'language' => 'pt-BR',
            'countryCode' => 'br',
            // reduz o que é raspado → mais barato/rápido
            'scrapePlaceDetailPage' => true,
            'skipClosedPlaces' => true,
            'maximumLeadsEnrichmentRecords' => 0,
        ];

        // run-sync: executa e devolve o dataset direto (bom p/ até ~1-2 min).
        $res = Http::timeout(180)->post(
            "https://api.apify.com/v2/acts/{$actor}/run-sync-get-dataset-items?token={$token}&clean=true",
            $input
        );

        if ($res->failed()) {
            throw new RuntimeException('Apify erro ' . $res->status() . ': ' . substr($res->body(), 0, 300));
        }

        $items = $res->json() ?: [];
        $leads = $this->mapLeads($items);

        return [
            'leads' => $leads,
            'sources' => [],
            'note' => $leads ? null : 'Nenhum resultado. Tente outro termo de nicho ou uma cidade maior.',
        ];
    }

    private function mapLeads(array $items): array
    {
        $out = [];
        foreach ($items as $it) {
            $name = trim((string) ($it['title'] ?? $it['name'] ?? ''));
            if ($name === '') {
                continue;
            }

            $website = trim((string) ($it['website'] ?? $it['url'] ?? ''));
            $website = str_contains($website, 'google.com/maps') ? '' : $website;

            [$temSite, $siteLimpo, $instagram, $facebook] = $this->classifySite($website, $it);

            $phone = (string) ($it['phone'] ?? $it['phoneUnformatted'] ?? '');
            $reviews = (int) ($it['reviewsCount'] ?? $it['reviews'] ?? 0);
            $rating = $it['totalScore'] ?? $it['rating'] ?? null;

            $addr = trim((string) ($it['address'] ?? implode(', ', array_filter([
                $it['street'] ?? null, $it['neighborhood'] ?? null, $it['city'] ?? null, $it['state'] ?? null,
            ]))));

            $out[] = [
                'nome' => $name,
                'telefone' => preg_replace('/\s+/', ' ', $phone),
                'whatsapp' => '',
                'endereco' => $addr,
                'instagram' => $instagram,
                'facebook' => $facebook,
                'site' => $siteLimpo,
                'tem_site' => $temSite,
                'avaliacoes' => $reviews,
                'nota' => $rating !== null ? (float) $rating : null,
                'categoria' => (string) ($it['categoryName'] ?? ($it['categories'][0] ?? '')),
                'maps_url' => (string) ($it['url'] ?? ''),
                'resumo' => trim((string) ($it['description'] ?? '')),
            ];
        }

        // ordena: sem site primeiro, depois por nº de avaliações desc
        usort($out, function ($a, $b) {
            $rank = ['nao' => 0, 'rede_social' => 1, 'sim' => 2];
            return [$rank[$a['tem_site']], -$a['avaliacoes']] <=> [$rank[$b['tem_site']], -$b['avaliacoes']];
        });

        return $out;
    }

    /** @return array{0:string,1:string,2:string,3:string} [tem_site, site, instagram, facebook] */
    private function classifySite(string $website, array $it): array
    {
        $instagram = '';
        $facebook = '';

        // alguns atores trazem redes em campos próprios
        foreach (['additionalInfo', 'socialProfiles', 'links'] as $k) {
            foreach ((array) ($it[$k] ?? []) as $v) {
                $v = is_array($v) ? ($v['url'] ?? '') : $v;
                if (is_string($v) && str_contains($v, 'instagram.com')) {
                    $instagram = $v;
                }
                if (is_string($v) && str_contains($v, 'facebook.com')) {
                    $facebook = $v;
                }
            }
        }

        if ($website === '') {
            return ['nao', '', $instagram, $facebook];
        }

        $host = strtolower((string) parse_url($website, PHP_URL_HOST));
        foreach (self::SOCIAL_HOSTS as $s) {
            if (str_contains($host, $s)) {
                if (str_contains($s, 'instagram') && ! $instagram) {
                    $instagram = $website;
                }
                if (str_contains($s, 'facebook') && ! $facebook) {
                    $facebook = $website;
                }
                return ['rede_social', '', $instagram, $facebook];
            }
        }

        return ['sim', $website, $instagram, $facebook];
    }
}
