import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const transactionId = searchParams.get('id');

        if (!transactionId) {
            return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!supabaseAdmin) return NextResponse.json({ error: 'Server error' }, { status: 500 });

        const { data: tx, error } = await supabaseAdmin
            .schema('liauthority')
            .from('transactions')
            .select('*, payment_gateways(name)')
            .eq('id', transactionId)
            .eq('user_id', user.id)
            .single();

        if (error || !tx) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        const invoiceNumber = `INV-${tx.id.slice(0, 8).toUpperCase()}`;
        const date = new Date(tx.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://liauthority.com';

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Invoice ${invoiceNumber} — LiAuthority</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #1a1a2e; padding: 0; }
        .page { max-width: 800px; margin: 0 auto; padding: 48px; }
        
        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; border-bottom: 2px solid #e5e7eb; padding-bottom: 32px; }
        .brand { display: flex; align-items: center; gap: 12px; }
        .logo { width: 48px; height: 48px; background: linear-gradient(135deg, #7c3aed, #ec4899); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .logo-text { color: white; font-size: 20px; font-weight: 900; }
        .brand-name { font-size: 22px; font-weight: 900; color: #1a1a2e; letter-spacing: -0.5px; }
        .brand-sub { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; }
        .invoice-label { text-align: right; }
        .invoice-label h1 { font-size: 32px; font-weight: 900; color: #7c3aed; letter-spacing: -1px; }
        .invoice-label .number { font-size: 13px; color: #6b7280; margin-top: 4px; font-family: monospace; }
        .invoice-label .date { font-size: 12px; color: #6b7280; margin-top: 2px; }

        /* Status badge */
        .status { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 6px; }
        .status.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .status.pending { background: #fefce8; color: #ca8a04; border: 1px solid #fde68a; }
        .status.failed { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        /* Billing info */
        .billing { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
        .billing-box h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 10px; }
        .billing-box p { font-size: 14px; color: #374151; line-height: 1.6; }
        .billing-box .email { font-size: 13px; color: #7c3aed; }

        /* Table */
        table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
        thead tr { background: #f9fafb; }
        th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
        td { padding: 16px; font-size: 14px; color: #374151; border-bottom: 1px solid #f3f4f6; }
        tr:last-child td { border-bottom: none; }
        td.amount, th.amount { text-align: right; }

        /* Totals */
        .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
        .totals-box { width: 280px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6; }
        .totals-row.total { font-weight: 900; font-size: 18px; color: #1a1a2e; border-bottom: none; padding-top: 16px; }
        .totals-row.total span:last-child { color: #7c3aed; }

        /* Footer */
        .footer { text-align: center; padding-top: 32px; border-top: 1px solid #e5e7eb; }
        .footer p { font-size: 12px; color: #9ca3af; line-height: 1.8; }
        .footer a { color: #7c3aed; text-decoration: none; }

        /* Print */
        @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
        }

        /* Actions */
        .actions { display: flex; gap: 12px; justify-content: center; margin-bottom: 32px; }
        .btn { padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; }
        .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
    </style>
</head>
<body>
<div class="page">
    <!-- Header -->
    <div class="header">
        <div class="brand">
            <div class="logo"><span class="logo-text">L</span></div>
            <div>
                <div class="brand-name">LiAuthority</div>
                <div class="brand-sub">LinkedIn Content OS</div>
            </div>
        </div>
        <div class="invoice-label">
            <h1>INVOICE</h1>
            <div class="number">${invoiceNumber}</div>
            <div class="date">${date}</div>
            <div><span class="status ${tx.status}">${tx.status}</span></div>
        </div>
    </div>

    <!-- Billing Info -->
    <div class="billing">
        <div class="billing-box">
            <h3>From</h3>
            <p><strong>LiAuthority Inc.</strong><br/>LinkedIn Content OS Platform<br/><a href="${appUrl}">${appUrl}</a></p>
        </div>
        <div class="billing-box">
            <h3>Billed To</h3>
            <p class="email">${user.email}</p>
            <p>User ID: ${user.id.slice(0, 8)}...</p>
        </div>
    </div>

    <!-- Line Items -->
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Plan</th>
                <th>Gateway</th>
                <th class="amount">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>${tx.plan_id} Plan Subscription</strong><br/><span style="font-size:12px;color:#6b7280;">Monthly Subscription — LiAuthority</span></td>
                <td>${tx.plan_id}</td>
                <td>${tx.payment_gateways?.name || tx.gateway_id}</td>
                <td class="amount"><strong>$${Number(tx.amount).toFixed(2)} USD</strong></td>
            </tr>
        </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
        <div class="totals-box">
            <div class="totals-row"><span>Subtotal</span><span>$${Number(tx.amount).toFixed(2)}</span></div>
            <div class="totals-row"><span>Tax (0%)</span><span>$0.00</span></div>
            <div class="totals-row total"><span>Total</span><span>$${Number(tx.amount).toFixed(2)} USD</span></div>
        </div>
    </div>

    <!-- Order Details -->
    <table>
        <thead><tr><th>Payment Details</th><th></th></tr></thead>
        <tbody>
            <tr><td style="color:#6b7280">Order ID</td><td style="font-family:monospace;font-size:12px">${tx.order_id || '—'}</td></tr>
            <tr><td style="color:#6b7280">Provider Tx ID</td><td style="font-family:monospace;font-size:12px">${tx.provider_tx_id || '—'}</td></tr>
            <tr><td style="color:#6b7280">Payment Method</td><td>${tx.payment_gateways?.name || tx.gateway_id}</td></tr>
            <tr><td style="color:#6b7280">Transaction Date</td><td>${date}</td></tr>
            <tr><td style="color:#6b7280">Status</td><td><span class="status ${tx.status}">${tx.status}</span></td></tr>
        </tbody>
    </table>

    <!-- Actions -->
    <div class="actions no-print">
        <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <button class="btn btn-secondary" onclick="window.close()">Close</button>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>Thank you for your business!<br/>
        Questions? Contact us at <a href="mailto:support@liauthority.com">support@liauthority.com</a><br/>
        <a href="${appUrl}">${appUrl}</a></p>
    </div>
</div>
<script>
    // Auto-focus so user can Ctrl+P immediately
    window.focus();
</script>
</body>
</html>`;

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            }
        });

    } catch (err) {
        console.error('Invoice generation error:', err);
        return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
    }
}
