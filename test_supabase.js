const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nvsoqclkhyryhayfqpju.supabase.co';
const supabaseAnonKey = 'sb_publishable_t2xH3sLsGiXK9kh_ab201A_EeZdWh4g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
    });

    if (error) {
        console.log('Auth test result (expected failure or key error):', error.message);
    } else {
        console.log('Auth test success (unexpected):', data);
    }
}

test();
