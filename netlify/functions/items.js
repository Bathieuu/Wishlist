const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!supabase) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, errors: ['Supabase not configured'] }),
    };
  }

  try {
    // Extract user from Authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ ok: false, errors: ['Authentication required'] }),
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ ok: false, errors: ['Invalid authentication'] }),
      };
    }

    // Handle different HTTP methods
    switch (event.httpMethod) {
      case 'GET':
        return await getItems(user.id, headers);
      case 'POST':
        return await createItem(user.id, JSON.parse(event.body), headers);
      case 'DELETE':
        const deleteParams = new URLSearchParams(event.queryStringParameters);
        const itemId = deleteParams.get('id');
        return await deleteItem(user.id, itemId, headers);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ ok: false, errors: ['Method not allowed'] }),
        };
    }

  } catch (error) {
    console.error('Error in items function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        ok: false, 
        errors: ['Internal server error: ' + error.message] 
      }),
    };
  }
};

async function getItems(userId, headers) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, errors: [error.message] }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, data }),
  };
}

async function createItem(userId, itemData, headers) {
  const { url, domain, title, imageUrl, priceCents, currency } = itemData;

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert([{
      user_id: userId,
      url,
      domain,
      title,
      image_url: imageUrl,
      price_cents: priceCents,
      currency
    }])
    .select()
    .single();

  if (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, errors: [error.message] }),
    };
  }

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({ ok: true, data }),
  };
}

async function deleteItem(userId, itemId, headers) {
  if (!itemId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, errors: ['Item ID is required'] }),
    };
  }

  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, errors: [error.message] }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true }),
  };
}
