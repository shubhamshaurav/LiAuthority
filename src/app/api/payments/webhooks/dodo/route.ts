import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        // Dodo Payments Webhook Pattern
        // Check for payload structure, e.g., payload.type === 'order.paid'
        const eventType = payload.type;
        const data = payload.data;

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server error' }, { status: 500 });
        }

        if (eventType === 'order.paid' || eventType === 'payment.succeeded') {
            const orderId = data.order_id || data.id;
            // Similar logic to Cashfree
            await handleSuccessfulPayment(orderId, data);
        }

        return NextResponse.json({ status: 'received' });

    } catch (error) {
        console.error('Dodo Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

async function handleSuccessfulPayment(orderId: string, paymentData: any) {
    if (!supabaseAdmin) return;

    const { data: transaction } = await supabaseAdmin
        .from('transactions')
        .update({
            status: 'success',
            metadata: { webhook_data: paymentData }
        })
        .eq('order_id', orderId)
        .select()
        .single();

    if (transaction) {
        await supabaseAdmin
            .from('user_profiles')
            .update({ current_plan_id: transaction.plan_id })
            .eq('id', transaction.user_id);

        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() + 30);

        await supabaseAdmin
            .from('subscriptions')
            .upsert({
                user_id: transaction.user_id,
                plan_id: transaction.plan_id,
                status: 'active',
                current_period_end: periodEnd.toISOString(),
                provider_name: 'dodopayments',
                last_transaction_id: transaction.id
            }, { onConflict: 'user_id' });
    }
}
