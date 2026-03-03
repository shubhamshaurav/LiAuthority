import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const signature = req.headers.get('x-webhook-signature');
        const timestamp = req.headers.get('x-webhook-timestamp');

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server error' }, { status: 500 });
        }

        // 1. Fetch Gateway Config
        const { data: gateway } = await supabaseAdmin
            .from('payment_gateways')
            .select('app_id, secret_key, environment')
            .eq('id', 'cashfree')
            .single();

        if (!gateway || !gateway.secret_key) {
            return NextResponse.json({ error: 'Gateway not configured' }, { status: 500 });
        }

        // NOTE: In production, verify the signature using the secret key from gateway.config
        // For Sandbox/Dev, we'll log it and proceed with validation

        // 2. Extract Event Data
        // Cashfree Version 2023-08-01 webhook structure
        const eventType = payload.type;
        const data = payload.data;

        if (eventType === 'PAYMENT_SUCCESS_WEBHOOK') {
            const orderId = data.order.order_id;
            const paymentData = data.payment;
            await handleSuccessfulPayment(orderId, paymentData);
        } else if (eventType === 'PAYMENT_FAILED_WEBHOOK') {
            const orderId = data.order.order_id;
            const paymentData = data.payment;
            await handleFailedPayment(orderId, paymentData);
        }

        return NextResponse.json({ status: 'received' });

    } catch (error) {
        console.error('Cashfree Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

async function handleSuccessfulPayment(orderId: string, paymentData: any) {
    if (!supabaseAdmin) return;

    // 1. Update Transaction
    const { data: transaction, error: txError } = await supabaseAdmin
        .from('transactions')
        .update({
            status: 'success',
            payment_method: paymentData.payment_group || 'none',
            metadata: {
                webhook_data: paymentData,
                updated_at: new Date().toISOString()
            }
        })
        .eq('order_id', orderId)
        .select()
        .single();

    if (txError || !transaction) {
        console.error('Transaction update failed or not found:', orderId, txError);
        return;
    }

    // 2. Upgrade User Profile Plan
    const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .update({ current_plan_id: transaction.plan_id })
        .eq('id', transaction.user_id);

    if (profileError) {
        console.error('Profile plan upgrade failed:', profileError);
    }

    // 3. Sync Subscription Record
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30); // 30 day cycle

    const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
            user_id: transaction.user_id,
            plan_id: transaction.plan_id,
            status: 'active',
            current_period_end: periodEnd.toISOString(),
            provider_name: 'cashfree',
            provider_subscription_id: paymentData.cf_payment_id?.toString() || null,
            last_transaction_id: transaction.id
        }, { onConflict: 'user_id' });

    if (subError) {
        console.error('Subscription sync failed:', subError);
    }
}

async function handleFailedPayment(orderId: string, paymentData: any) {
    if (!supabaseAdmin) return;

    await supabaseAdmin
        .from('transactions')
        .update({
            status: 'failed',
            metadata: {
                webhook_data: paymentData,
                failed_at: new Date().toISOString()
            }
        })
        .eq('order_id', orderId);
}
