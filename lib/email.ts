import { Resend } from 'resend'

export async function sendNotificationEmail(to: string, hawkName: string, items: Record<string, unknown>[]) {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
        console.warn('RESEND_API_KEY is missing. Skipping email.')
        return
    }

    const resend = new Resend(apiKey)

    const { data, error } = await resend.emails.send({
        from: 'Trace Motorsports <alerts@tracemotorsports.com>',
        to: [to],
        subject: `🦅 Found ${items.length} new items for "${hawkName}"`,
        html: `
            <h1>Trace Motorsports Alert</h1>
            <p>Your agent <strong>"${hawkName}"</strong> just found ${items.length} new listings:</p>
            <table style="width:100%; border-collapse: collapse;">
                ${items.map(item => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #333; width: 120px;">
                            <img src="${item.imageUrl}" style="width: 100%; max-width: 100px; border-radius: 4px; display: block;" alt="Item Image" />
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
