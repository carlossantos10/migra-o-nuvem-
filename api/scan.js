export default async function handler(req, res) {
  const { store_id } = req.query;

  const cookies = Object.fromEntries(
    (req.headers.cookie || '').split('; ').filter(Boolean).map(c => {
      const [k, ...v] = c.split('=');
      return [k, v.join('=')];
    })
  );
  const token = cookies.ns_token;

  if (!store_id || !token) {
    return res.status(401).json({ error: 'store_id ou token ausente', hasToken: !!token });
  }

  try {
    const fetch = (await import('node-fetch')).default;

    const api = async (ep) => {
      const r = await fetch(`https://api.nuvemshop.com.br/v1/${store_id}/${ep}`, {
        headers: {
          'Authentication': `bearer ${token}`,
          'User-Agent': 'MigrationReportApp/1.0 (parceiros@nuvemshop.com.br)',
        },
      });
      if (!r.ok) return [];
      return r.json();
    };

    const [store, products, categories, customers, orders, paymentOptions, shippingCarriers] = await Promise.all([
      api('store'),
      api('products?per_page=50'),
      api('categories'),
      api('customers?per_page=50'),
      api('orders?per_page=50'),
      api('payment-options'),
      api('shipping_carriers'),
    ]);

    const productTotal = Array.isArray(products) ? products.length : 0;
    const categoryTotal = Array.isArray(categories) ? categories.length : 0;
    const customerTotal = Array.isArray(customers) ? customers.length : 0;
    const orderTotal = Array.isArray(orders) ? orders.length : 0;

    const activePayments = Array.isArray(paymentOptions) ? paymentOptions : [];
    const hasPayments = activePayments.length > 0;
    const paymentNames = activePayments.map(p => p.name).join(', ');
    const paymentMethods = activePayments.flatMap(p =>
      (p.checkout_payment_options || []).map(o => o.name)
    ).slice(0, 3).join(', ');

    const activeCarriers = Array.isArray(shippingCarriers)
      ? shippingCarriers.filter(c => c.active !== false)
      : [];
    const hasShipping = activeCarriers.length > 0;
    const carrierNames = activeCarriers.map(c => c.name).join(', ');

    const storeCountry = store?.country || '';
    const isNuvemPagoNative = storeCountry === 'BR' && !hasPayments;
    const isNuvemEnvioNative = storeCountry === 'BR' && !hasShipping;

    const cats = {
      products: {
        label: 'Produtos',
        icon: 'package',
        status: productTotal >= 10 ? 'done' : productTotal > 0 ? 'in_progress' : 'pending',
        detail: `${productTotal} produto(s) cadastrado(s)`,
      },
      categories: {
        label: 'Categorias',
        icon: 'folder',
        status: categoryTotal >= 3 ? 'done' : categoryTotal > 0 ? 'in_progress' : 'pending',
        detail: `${categoryTotal} categoria(s)`,
      },
      customers: {
        label: 'Clientes',
        icon: 'users',
        status: customerTotal >= 5 ? 'done' : customerTotal > 0 ? 'in_progress' : 'pending',
        detail: `${customerTotal} cliente(s)`,
      },
      orders: {
        label: 'Pedidos',
        icon: 'cart',
        status: orderTotal >= 5 ? 'done' : orderTotal > 0 ? 'in_progress' : 'pending',
        detail: `${orderTotal} pedido(s)`,
      },
      payments: {
        label: 'Pagamentos',
        icon: 'credit-card',
        status: (hasPayments || isNuvemPagoNative) ? 'done' : 'pending',
        detail: hasPayments
          ? `${paymentNames}${paymentMethods ? ' · ' + paymentMethods : ''}`
          : isNuvemPagoNative
            ? 'Nuvem Pago · nativo ativo'
            : 'Não configurado',
      },
      shipping: {
        label: 'Frete',
        icon: 'truck',
        status: (hasShipping || isNuvemEnvioNative) ? 'done' : 'pending',
        detail: hasShipping
          ? carrierNames
          : isNuvemEnvioNative
            ? 'Nuvem Envio · nativo ativo'
            : 'Não configurado',
      },
    };

    const values = Object.values(cats);
    const done = values.filter(c => c.status === 'done').length;
    const inProg = values.filter(c => c.status === 'in_progress').length;
    const pending = values.filter(c => c.status === 'pending').length;
    const total = values.length;
    const pct = Math.round((done / total) * 100);

    res.status(200).json({
      scannedAt: new Date().toISOString(),
      store: {
        name: store?.name?.pt || store?.name || 'Loja',
        country: store?.country,
        currency: store?.currency,
        domain: store?.original_domain,
      },
      counts: { productTotal, categoryTotal, customerTotal, orderTotal },
      categories: cats,
      summary: { total, done, inProg, pending, pct },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro na varredura', detail: error.message });
  }
}