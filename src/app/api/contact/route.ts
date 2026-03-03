import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
    try {
        const { name, email, subject, message } = await req.json();

        // 1. Validation
        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
        }

        // 2. Save to Database (contact_submissions)
        if (!supabaseAdmin) {
            console.error('CRITICAL: supabaseAdmin is NULL');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const { error: dbError } = await supabaseAdmin
            .from('contact_submissions')
            .insert({
                name,
                email,
                subject: subject || 'No Subject',
                message
            });

        if (dbError) {
            console.error('DATABASE ERROR (contact_submissions):', dbError);
            return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
        }

        // 3. Fetch SMTP Settings from system_settings
        const { data: settings, error: settingsError } = await supabaseAdmin
            .from('system_settings')
            .select('value')
            .eq('key', 'smtp_config')
            .single();

        if (settingsError || !settings) {
            console.warn('SMTP CONFIG NOT FOUND or ERROR FETCHING:', settingsError);
            // We return success to the user because we saved the submission, 
            // but log that email failed.
            return NextResponse.json({
                success: true,
                message: 'Submission saved, but notification failed (internal config error)'
            });
        }

        const smtp = settings.value;

        // 4. Send Email using Nodemailer
        try {
            const transporter = nodemailer.createTransport({
                host: smtp.host,
                port: smtp.port,
                secure: smtp.port === 465, // true for 465, false for others (587)
                auth: {
                    user: smtp.user,
                    pass: smtp.pass
                },
                tls: {
                    // Do not fail on invalid certs
                    rejectUnauthorized: false
                }
            });

            await transporter.sendMail({
                from: smtp.from || `"LiAuthority" <${smtp.user}>`,
                to: smtp.to,
                subject: `New Contact Submission: ${subject || 'No Subject'}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #7c3aed;">New Contact Submission</h2>
                        <p><strong>From:</strong> ${name} (${email})</p>
                        <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="white-space: pre-wrap;">${message}</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #999;">Sent from LiAuthority Landing Page</p>
                    </div>
                `
            });

            console.log('EMAIL SENT SUCCESSFULLY to:', smtp.to);

        } catch (emailError) {
            console.error('EMAIL SENDING FAILED:', emailError);
            // Still return success as the message is in the database
            return NextResponse.json({
                success: true,
                message: 'Submission saved, but notification failed. Please check the dashboard.'
            });
        }

        return NextResponse.json({ success: true, message: 'Message sent successfully' });

    } catch (error: any) {
        console.error('CONTACT API GLOBAL ERROR:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
