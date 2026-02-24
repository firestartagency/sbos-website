/* ─────────────────────────────────────────────────
   WEBHOOK SERVICE — single POST to N8N
   Handles all execution layer payloads.
───────────────────────────────────────────────── */

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
const STATUS_URL = import.meta.env.VITE_N8N_STATUS_URL;

/**
 * Send an execution payload to the N8N webhook.
 *
 * @param {string} module — "health-diagnostic" | "money-leaks" | "growth-plan" | "sop-delivery" | "lead-email"
 * @param {string} recipientEmail — email address for the recipient
 * @param {Object} branding — { primaryColor, accentColor, companyName }
 * @param {Object} data — module-specific payload (emailHtml, subject, etc.)
 * @returns {Object} — response JSON from N8N
 */
export async function sendExecutionPayload(module, recipientEmail, branding, data) {
    if (!WEBHOOK_URL) {
        console.warn('[webhookService] No VITE_N8N_WEBHOOK_URL configured');
        return { success: false, error: 'Webhook URL not configured' };
    }

    try {
        const res = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                module,
                recipientEmail,
                branding,
                data,
            }),
        });

        // N8N test webhooks may return various status codes
        if (!res.ok) {
            console.warn(`[webhookService] Non-OK response: ${res.status}`);
        }

        // Try to parse JSON, fall back to text
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return await res.json();
        }
        const text = await res.text();
        return { success: res.ok, raw: text };
    } catch (err) {
        console.error('[webhookService] POST failed:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Poll the N8N status webhook for a Gamma embed URL.
 * Polls every 30 seconds for up to 4 minutes.
 *
 * @param {Function} onStatusUpdate — optional callback(status) for UI updates
 * @param {number} intervalMs — polling interval in ms (default: 30000)
 * @param {number} timeoutMs — max polling duration in ms (default: 240000 = 4 min)
 * @returns {string|null} — embed URL if found, null on timeout
 */
export async function pollForGammaEmbed(onStatusUpdate, intervalMs = 30000, timeoutMs = 240000) {
    if (!STATUS_URL) {
        console.warn('[webhookService] No VITE_N8N_STATUS_URL configured');
        return null;
    }

    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        try {
            const res = await fetch(STATUS_URL);
            const data = await res.json();

            if (data?.url) {
                return data.url;
            }

            if (onStatusUpdate) {
                onStatusUpdate({
                    status: 'processing',
                    elapsed: Math.round((Date.now() - start) / 1000),
                });
            }
        } catch (e) {
            // No data yet or network blip — continue polling
        }

        await new Promise(r => setTimeout(r, intervalMs));
    }

    // Timeout reached
    if (onStatusUpdate) {
        onStatusUpdate({ status: 'timeout' });
    }
    return null;
}

/**
 * Check if webhook URLs are configured.
 */
export function isWebhookConfigured() {
    return !!WEBHOOK_URL;
}

export function isStatusWebhookConfigured() {
    return !!STATUS_URL;
}
