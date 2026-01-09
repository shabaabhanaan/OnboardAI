import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"
import { encodeHex } from "https://deno.land/std@0.168.0/encoding/hex.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MERCHANT_SECRET = Deno.env.get("PAYHERE_MERCHANT_SECRET") || "4515XXX";

async function md5(text: string) {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("MD5", msgUint8);
    return encodeHex(hashBuffer).toUpperCase();
}

serve(async (req) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
    }

    try {
        const formData = await req.formData();
        const merchant_id = formData.get('merchant_id');
        const order_id = formData.get('order_id');
        const payhere_amount = formData.get('payhere_amount');
        const payhere_currency = formData.get('payhere_currency');
        const status_code = formData.get('status_code');
        const md5sig = formData.get('md5sig');
        const user_id = formData.get('custom_1');

        // 1. Verify Signature
        const secret_hash = await md5(MERCHANT_SECRET);
        const sign_string = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secret_hash}`;
        const local_md5sig = await md5(sign_string);

        if (local_md5sig !== md5sig) {
            console.error(`Payment Signature Mismatch for Order ${order_id}`);
            return new Response(JSON.stringify({ status: "failed", message: "Invalid Signature" }), { status: 400 });
        }

        // 2. Check Payment Status (2 = Success)
        if (status_code === "2" && user_id) {
            const supabase = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            )

            const { error } = await supabase
                .from('profiles')
                .update({ plan: 'pro' })
                .eq('id', user_id);

            if (error) {
                console.error('Error upgrading user:', error);
                return new Response(JSON.stringify({ status: "error", message: error.message }), { status: 500 });
            }

            console.log(`User ${user_id} upgraded to Pro via PayHere`);
        }

        return new Response(JSON.stringify({ status: "ok" }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
        })
    }
})
