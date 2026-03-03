import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('order_id');

        if (!orderId) {
            return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch the transaction to get gateway info
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const { data: transaction, error: txError } = await supabaseAdmin
            .schema('liauthority')
            .from('transactions')
            .select('*, payment_gateways(*)')
            .or(`order_id.eq.${orderId},metadata->>internal_order_id.eq.${orderId}`)
            .eq('user_id', user.id)
            .single();

        if (txError || !transaction) {
            console.error('Transaction lookup error:', txError);
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        const gateway = transaction.payment_gateways;

        // Verify payment status with Cashfree
        if (gateway?.id === 'cashfree') {
            const isSandbox = gateway.environment === 'sandbox';
            const baseUrl = isSandbox
                ? 'https://sandbox.cashfree.com/pg/orders'
                : 'https://api.cashfree.com/pg/orders';

            const cfResponse = await fetch(`${baseUrl}/${transaction.order_id}`, {
                headers: {
                    'x-client-id': gateway.app_id,
                    'x-client-secret': gateway.secret_key,
                    'x-api-version': '2023-08-01'
                }
            });

            const cfData = await cfResponse.json();
            const paymentStatus = cfData.order_status; // PAID, ACTIVE, EXPIRED, etc.

            console.log('Cashfree Verification Response:', { paymentStatus, orderId });

            if (paymentStatus === 'PAID') {
                // Activate subscription
                await activateSubscription(user.id, transaction.plan_id, supabaseAdmin);

                // Update transaction with full Cashfree details
                const updatedMetadata = {
                    ...transaction.metadata,
                    cf_status: paymentStatus,
                    cf_order_id: cfData.order_id,
                    cf_payment_session_id: cfData.payment_session_id,
                    cf_order_amount: cfData.order_amount,
                    cf_order_currency: cfData.order_currency,   // INR (from CF)
                    cf_customer_email: cfData.customer_details?.customer_email,
                    cf_created_at: cfData.created_at,
                    cf_paid_at: new Date().toISOString(),
                };

                await supabaseAdmin
                    .schema('liauthority')
                    .from('transactions')
                    .update({
                        status: 'success',
                        currency: 'USD',        // Always USD in our DB
                        provider_tx_id: cfData.cf_order_id || transaction.order_id,
                        metadata: updatedMetadata,
                    })
                    .eq('id', transaction.id);

                return NextResponse.json({ status: 'success', plan_id: transaction.plan_id });
            } else if (['ACTIVE', 'EXPIRED', 'CANCELLED'].includes(paymentStatus)) {
                // Mark as failed
                await supabaseAdmin
                    .schema('liauthority')
                    .from('transactions')
                    .update({
                        status: 'failed',
                        currency: 'USD',
                        metadata: { ...transaction.metadata, cf_status: paymentStatus }
                    })
                    .eq('id', transaction.id);

                return NextResponse.json({ status: 'failed', cf_status: paymentStatus });
            } else {
                return NextResponse.json({ status: 'pending', cf_status: paymentStatus });
            }
        }

        return NextResponse.json({ status: transaction.status });

    } catch (error: any) {
        console.error('Verify Payment Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function activateSubscription(userId: string, planId: string, adminClient: any) {
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Update subscription record
    const { error: subError } = await adminClient
        .schema('liauthority')
        .from('subscriptions')
        .upsert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            current_period_end: periodEnd.toISOString()
        }, { onConflict: 'user_id' });

    if (subError) console.error('Subscription update error:', subError);

    // Update user profile with current plan
    const { error: profileError } = await adminClient
        .schema('liauthority')
        .from('user_profiles')
        .update({ current_plan_id: planId })
        .eq('id', userId);

    if (profileError) console.error('Profile update error:', profileError);
}
