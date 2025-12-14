export async function POST(request) {
  try {
    const body = await request.json();

    // Extract user info from Clerk webhook payload
    const email = body.data.email_addresses[0]?.email_address;
    const firstName = body.data.first_name || '';
    const lastName = body.data.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0];

    console.log('[Clerk Webhook] Creating user:', { email, fullName });

    // Call backend to create/get user
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}';
    const createUserUrl = `${backendUrl}/auth/create`;
    
    console.log('[Backend] POST URL:', createUserUrl);
    
    const response = await fetch(createUserUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        full_name: fullName,
      }),
    });

    console.log('[Backend] Response status:', response.status);

    // Get response text for debugging
    const responseText = await response.text();
    console.log('[Backend] Response text:', responseText);

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        console.error('[Backend] Error:', errorData);
        return new Response(
          JSON.stringify({ 
            message: 'Failed to create user', 
            error: errorData.detail || JSON.stringify(errorData) 
          }),
          { status: response.status, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (parseError) {
        console.error('[Backend] Failed to parse error:', parseError);
        return new Response(
          JSON.stringify({ 
            message: 'Failed to create user', 
            error: responseText || 'Backend error' 
          }),
          { status: response.status, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    try {
      const userData = JSON.parse(responseText);
      console.log('[Backend] User created/fetched:', userData);

      // Determine redirect URL based on user role
      let redirectUrl = '/user/dashboard'; // Default for MEMBER
      
      if (userData.role === 'ADMIN') {
        redirectUrl = '/admin/dashboard';
      } else if (userData.role === 'LIBRARIAN') {
        redirectUrl = '/librarian/dashboard';
      }
      // MEMBER role uses default /user/dashboard

      console.log('[Redirect] Role:', userData.role, '→ URL:', redirectUrl);
      
      return new Response(
        JSON.stringify({ 
          message: 'User created successfully',
          user: userData,
          redirect: redirectUrl,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('[Parse Error] Failed to parse success response:', parseError);
      return new Response(
        JSON.stringify({ 
          message: 'User creation response parsing error', 
          error: parseError.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('[Server Error] Error in POST /api/createuser:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Internal Server Error', 
        error: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
