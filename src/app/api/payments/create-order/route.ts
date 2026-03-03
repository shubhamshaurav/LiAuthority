import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId, couponCode, billingCycle, gatewayId } = await req.json();

        if (!planId) {
            return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
        }

        console.log('DEBUG: Received Create Order Request:', { planId, billingCycle, gatewayId });

        // 1. Fetch Plan Details
        const { data: plan, error: planError } = await supabase
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (planError || !plan) {
            console.error('PLAN FETCH ERROR:', planError);
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        let amount = plan.price_monthly;
        if (billingCycle === 'annual') {
            amount = Math.round(plan.price_monthly * 0.8 * 12);
        }
        let couponId = null;

        // 2. Validate Coupon if provided
        if (couponCode) {
            const { data: coupon, error: couponError } = await supabase
                .from('coupons')
                .select('*')
                .eq('id', couponCode)
                .eq('is_active', true)
                .single();

            if (!couponError && coupon) {
                // Check expiry
                if (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) {
                    // Check limit
                    if (!coupon.usage_limit || coupon.used_count < coupon.usage_limit) {
                        if (coupon.discount_type === 'percentage') {
                            amount = amount * (1 - coupon.discount_value / 100);
                        } else if (coupon.discount_type === 'fixed') {
                            amount = Math.max(0, amount - coupon.discount_value);
                        }
                        couponId = coupon.id;
                    }
                }
            }
        }

        // 3. Fetch Active Payment Gateway
        if (!supabaseAdmin) {
            console.error('CRITICAL: supabaseAdmin is NULL');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        console.log('DEBUG: Fetching gateway for ID:', gatewayId);

        let query = supabaseAdmin
            .schema('liauthority')
            .from('payment_gateways')
            .select('*')
            .eq('is_active', true);

        if (gatewayId) {
            query = query.eq('id', gatewayId);
        }

        const { data: gateway, error: gatewayError } = await query
            .limit(1)
            .maybeSingle();

        if (gatewayError || !gateway) {
            console.error('GATEWAY FETCH ERROR:', {
                error: gatewayError,
                id: gatewayId,
                found: !!gateway
            });
            return NextResponse.json({
                error: 'No active payment gateway found',
                details: gatewayError ? `${gatewayError.message} (${gatewayError.code})` : `No entry found for ID: ${gatewayId}`,
                debug_id: gatewayId
            }, { status: 500 });
        }

        // 4. Generate Internal Order ID
        const internalOrderId = `ORDER_${Date.now()}_${user.id.slice(0, 8)}`;

        // 5. Initialize Provider & Create Order
        let providerResponse;
        let finalAmount = amount;

        if (gateway.id === 'cashfree') {
            // Fetch live USD→INR conversion rate
            const conversionRate = await getLiveUsdToInrRate();
            finalAmount = Math.round(amount * conversionRate);
            console.log(`DEBUG: Converting USD $${amount} → INR ₹${finalAmount} (Live Rate: ${conversionRate})`);
            providerResponse = await createCashfreeOrder(gateway, internalOrderId, finalAmount, user);
        } else if (gateway.id === 'dodopayments') {
            providerResponse = await createDodoOrder(gateway, internalOrderId, amount, user);
        } else {
            return NextResponse.json({ error: 'Unsupported gateway' }, { status: 500 });
        }

        // 6. Log Transaction (store in USD for consistent reporting)
        const { error: txError } = await supabaseAdmin
            .from('transactions')
            .insert({
                user_id: user.id,
                gateway_id: gateway.id,
                order_id: providerResponse.provider_order_id || internalOrderId,
                amount: amount,       // Always store original USD amount
                currency: 'USD',      // Always store in USD
                status: 'pending',
                coupon_id: couponId,
                plan_id: planId,
                metadata: {
                    internal_order_id: internalOrderId,
                    charged_amount: finalAmount,                          // e.g., ₹830
                    charged_currency: gateway.id === 'cashfree' ? 'INR' : 'USD',
                    conversion_rate: gateway.id === 'cashfree' ? await getLiveUsdToInrRate() : 1,
                    ...providerResponse.metadata
                }
            });

        if (txError) {
            console.error('Transaction Log Error:', txError);
        }

        return NextResponse.json({
            gateway: gateway.id,
            ...providerResponse
        });

    } catch (error: any) {
        console.error('Payment Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function createCashfreeOrder(gateway: any, internalOrderId: string, amount: number, user: any) {
    const isSandbox = gateway.environment === 'sandbox';
    const baseUrl = isSandbox
        ? 'https://sandbox.cashfree.com/pg/orders'
        : 'https://api.cashfree.com/pg/orders';

    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-client-id': gateway.app_id,
            'x-client-secret': gateway.secret_key,
            'x-api-version': '2023-08-01'
        },
        body: JSON.stringify({
            order_id: internalOrderId,
            order_amount: amount,
            order_currency: 'INR',
            customer_details: {
                customer_id: user.id,
                customer_email: user.email,
                customer_phone: '9999999999' // Placeholder as it's required by CF
            },
            order_meta: {
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/subscription/status?order_id={order_id}`
            }
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Cashfree Order Creation Failed');
    }

    return {
        payment_session_id: data.payment_session_id,
        provider_order_id: data.order_id,
        metadata: data
    };
}

async function createDodoOrder(gateway: any, internalOrderId: string, amount: number, user: any) {
    // Dodo Payments implementation placeholder
    return {
        checkout_url: `https://test.dodopayments.com/checkout?order=${internalOrderId}`,
        provider_order_id: internalOrderId,
        metadata: { info: 'Dodo Payments Integration Pending API Keys' }
    };
}

// Fetches the live USD to INR conversion rate from a free API.
// Falls back to 83 if the API call fails.
async function getLiveUsdToInrRate(): Promise<number> {
    const FALLBACK_RATE = 83;
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD', {
            next: { revalidate: 3600 } // Cache for 1 hour to avoid hitting rate limits
        });
        if (!response.ok) {
            console.warn('Currency API returned non-OK status, using fallback rate.');
            return FALLBACK_RATE;
        }
        const data = await response.json();
        const rate = data?.rates?.INR;
        if (typeof rate === 'number' && rate > 0) {
            console.log(`Live USD→INR Rate fetched: ${rate}`);
            return rate;
        }
        console.warn('Invalid rate in currency API response, using fallback.');
        return FALLBACK_RATE;
    } catch (err) {
        console.error('Failed to fetch live exchange rate, using fallback:', err);
        return FALLBACK_RATE;
    }
}
