import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ItemsGetResponse {
  ok: boolean;
  data?: any[];
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

interface ItemsPostRequest {
  url: string;
  title: string;
  price?: string | null;
  imageUrl?: string | null;
  domain?: string | null;
}

/**
 * Get user from JWT token
 */
async function getUser(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Handle GET /items - Get user's wishlist items
 */
async function handleGet(event: HandlerEvent, userId: string) {
  const url = new URL(`https://example.com${event.path}?${new URLSearchParams(event.queryStringParameters || {}).toString()}`);
  
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
  const domain = url.searchParams.get('domain');
  const sortBy = url.searchParams.get('sort') || 'created_at';
  const sortOrder = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  try {
    let query = supabase
      .from('items')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (domain) {
      query = query.eq('domain', domain);
    }

    // Add sorting
    if (['created_at', 'updated_at', 'title'].includes(sortBy)) {
      query = query.order(sortBy as any, { ascending: sortOrder === 'asc' });
    }

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Convert to expected format for compatibility
    const formattedData = (data || []).map(item => ({
      ...item,
      // Add fields for compatibility with WishlistItem interface
      price_cents: null,
      currency: null,
      last_checked_at: null,
      status: 'active'
    }));

    const response: ItemsGetResponse = {
      ok: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > page * limit,
      },
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Get items error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        ok: false, 
        errors: ['Failed to fetch items'] 
      }),
    };
  }
}

/**
 * Handle POST /items - Add new item to wishlist
 */
async function handlePost(event: HandlerEvent, userId: string) {
  try {
    const itemData: ItemsPostRequest = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!itemData.url || !itemData.title) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          ok: false, 
          errors: ['URL and title are required'] 
        }),
      };
    }

    // Check if item already exists
    const { data: existing } = await supabase
      .from('items')
      .select('id')
      .eq('user_id', userId)
      .eq('url', itemData.url)
      .single();

    if (existing) {
      return {
        statusCode: 409,
        body: JSON.stringify({ 
          ok: false, 
          errors: ['Item already exists in wishlist'] 
        }),
      };
    }

    // Insert new item
    const { data, error } = await supabase
      .from('items')
      .insert({
        user_id: userId,
        url: itemData.url,
        title: itemData.title,
        price: itemData.price || null,
        image_url: itemData.imageUrl || null,
        domain: itemData.domain || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      statusCode: 201,
      body: JSON.stringify({ ok: true, data }),
    };
  } catch (error) {
    console.error('Post item error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        ok: false, 
        errors: ['Failed to add item'] 
      }),
    };
  }
}

/**
 * Handle DELETE /items/:id - Delete item from wishlist
 */
async function handleDelete(event: HandlerEvent, userId: string) {
  try {
    const pathParts = event.path.split('/');
    const itemId = pathParts[pathParts.length - 1];

    if (!itemId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          ok: false, 
          errors: ['Item ID is required'] 
        }),
      };
    }

    // Delete the item
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    console.error('Delete item error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        ok: false, 
        errors: ['Failed to delete item'] 
      }),
    };
  }
}

/**
 * Main handler
 */
export const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Get and validate user
    const user = await getUser(event.headers.authorization);
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          ok: false, 
          errors: ['Unauthorized'] 
        }),
      };
    }

    // Route to appropriate handler
    switch (event.httpMethod) {
      case 'GET':
        const getResult = await handleGet(event, user.id);
        return { ...getResult, headers };
      
      case 'POST':
        const postResult = await handlePost(event, user.id);
        return { ...postResult, headers };
      
      case 'DELETE':
        const deleteResult = await handleDelete(event, user.id);
        return { ...deleteResult, headers };
      
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ 
            ok: false, 
            errors: ['Method not allowed'] 
          }),
        };
    }
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        ok: false, 
        errors: ['Internal server error'] 
      }),
    };
  }
};
