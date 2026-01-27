import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendNotificationEmail(to: string, hawkName: string, items: any[]) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Skipping email.')
        return
    }

    const { data, error } = await resend.emails.send({
        from: 'Trace Motorsports <onboarding@resend.dev>', // Using default domain until you verify your own
        to: [to],
        subject: `🦅 Found ${items.length} new items for "${hawkName}"`,
        html: `
            <h1>Trace Motorsports Alert</h1>
            <p>Your agent <strong>"${hawkName}"</strong> just found ${items.length} new listings:</p>
            <table style="width:100%; border-collapse: collapse;">
                ${items.map(item => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #333;">
                            <img src="${item.imageUrl}" width="100" style="border-radius: 4px;" />
                        </td>
                        <td style="padding: 10px; border-bottom: 1px solid #333;">
                            <a href="${item.url}" style="color: #de1f1f; font-weight: bold; text-decoration: none; font-size: 16px;">
                                ${item.title}
                            </a>
                            <p style="margin: 5px 0 0; color: #666;">$${item.price}</p>
                        </td>
                    </tr>
                `).join('')}
            </table>
            <br/>
            <a href="https://tracemotorsports.vercel.app/dashboard" style="background: #de1f1f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View in Command Center</a>
        `
    })

    if (error) {
        console.error('Email failed:', error)
    } else {
        console.log('Email sent:', data)
    }
}
