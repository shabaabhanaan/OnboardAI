import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"
import { encodeHex } from "https://deno.land/std@0.168.0/encoding/hex.ts"

const MERCHANT_ID = Deno.env.get("PAYHERE_MERCHANT_ID") || "121XXXX";
const MERCHANT_SECRET = Deno.env.get("PAYHERE_MERCHANT_SECRET") || "4515XXX";
const CURRENCY = "LKR";

async function md5(text: string) {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("MD5", msgUint8);
    return encodeHex(hashBuffer).toUpperCase();
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
    }

    try {
        const { amount, order_id } = await req.json();
        const amount_formatted = Number(amount).toFixed(2);

        const secret_hash = await md5(MERCHANT_SECRET);
        const hash_string = `${MERCHANT_ID}${order_id}${amount_formatted}${CURRENCY}${secret_hash}`;
        const final_hash = await md5(hash_string);

        return new Response(
            JSON.stringify({
                hash: final_hash,
                merchant_id: MERCHANT_ID,
                currency: CURRENCY,
                amount_formatted: amount_formatted
            }),
            {
                headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
                status: 200
            },
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
            status: 400,
        })
    }
})
