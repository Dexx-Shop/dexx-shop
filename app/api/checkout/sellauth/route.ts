import { getCurrentUser } from 'lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Lütfen önce giriş yapın.' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, productId, variantId, isTopup } = body;

    const shopId = process.env.SELLAUTH_SHOP_ID;
    const apiKey = process.env.SELLAUTH_API_KEY;

    if (!shopId || !apiKey) {
      return NextResponse.json({ error: 'SellAuth yapılandırması eksik.' }, { status: 500 });
    }

    // SellAuth Checkout API çağrısı
    // Müşteri bilgisi ve özel referans için metadata/custom field gönderiyoruz
    const response = await fetch(`https://api.sellauth.com/v1/shops/${shopId}/checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        custom_fields: {
          userId: user.id,
          userEmail: user.email,
          isTopup: isTopup ? 'true' : 'false',
          productId: productId || ''
        },
        cart: [
          {
            productId: productId ? Number(productId) : undefined,
            variantId: variantId ? Number(variantId) : undefined,
            quantity: 1
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      // Eğer özel ürün oluşturulmadıysa doğrudan mağaza checkout linkine yönlendirme fallback'i:
      const fallbackUrl = `https://dexx-shop.mysellauth.com`;
      return NextResponse.json({ url: fallbackUrl });
    }

    return NextResponse.json({ url: data.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ödeme başlatılamadı.' }, { status: 500 });
  }
}