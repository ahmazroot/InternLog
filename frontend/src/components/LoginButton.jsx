import { useGoogleLogin } from '@react-oauth/google';

export function LoginButton({ onLoginSuccess, onLoginError }) {
  const login = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;

        if (!accessToken) {
          throw new Error('Access token tidak diterima dari Google');
        }

        console.log('Access Token:', accessToken);

        const data = await loginWithBackend(accessToken);

        if (onLoginSuccess) {
          onLoginSuccess(data);
        }
      } catch (error) {
        console.error('Login Failed:', error);
        if (onLoginError) {
          onLoginError(error);
        }
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      if (onLoginError) {
        onLoginError(error);
      }
    },
  });

  // 👉 fungsi integrasi API ke backend
  const loginWithBackend = async (accessToken) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Backend response error: ${response.status} ${errorBody}`);
      }

      const data = await response.json();

      // 👉 simpan ke localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('loggedIn', 'true');

      console.log('Login Success:', data);
      return data;
    } catch (error) {
      console.error('Backend Error:', error);
      throw error;
    }
  };

  return (
    <button className="google-login-button" onClick={() => login()}>
      Login dengan Google
    </button>
  );
}
