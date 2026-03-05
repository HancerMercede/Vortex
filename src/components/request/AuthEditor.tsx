import { useRequestStore } from '../../application/stores/requestStore';

const AUTH_TYPES = ["NO AUTH", "BEARER TOKEN", "API KEY", "BASIC AUTH"];

export function AuthEditor() {
  const { authType, authData, setAuthType, setAuthData } = useRequestStore();

  const updateAuthData = (key: string, value: unknown) => {
    setAuthData({ ...authData, [key]: value });
  };

  const updateApiKey = (key: string, value: unknown) => {
    setAuthData({
      ...authData,
      apiKey: { ...authData.apiKey, [key]: value },
    });
  };

  const updateBasicAuth = (key: string, value: unknown) => {
    setAuthData({
      ...authData,
      basicAuth: { ...authData.basicAuth, [key]: value },
    });
  };

  const renderAuthFields = () => {
    switch (authType) {
      case 'BEARER TOKEN':
        return (
          <div className="auth-fields">
            <label className="auth-label">TOKEN</label>
            <input
              type="text"
              className="kv-input"
              placeholder="Enter bearer token..."
              value={authData.bearerToken}
              onChange={(e) => updateAuthData('bearerToken', e.target.value)}
            />
          </div>
        );

      case 'API KEY':
        return (
          <div className="auth-fields">
            <label className="auth-label">KEY</label>
            <input
              type="text"
              className="kv-input"
              placeholder="X-API-Key"
              value={authData.apiKey.key}
              onChange={(e) => updateApiKey('key', e.target.value)}
            />
            <label className="auth-label">VALUE</label>
            <input
              type="text"
              className="kv-input"
              placeholder="Your API key..."
              value={authData.apiKey.value}
              onChange={(e) => updateApiKey('value', e.target.value)}
            />
            <label className="auth-label">ADD TO</label>
            <div className="auth-toggle-group">
              {(['header', 'query'] as const).map((type) => (
                <button
                  key={type}
                  className={`auth-toggle${authData.apiKey.addTo === type ? ' active' : ''}`}
                  onClick={() => updateApiKey('addTo', type)}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        );

      case 'BASIC AUTH':
        return (
          <div className="auth-fields">
            <label className="auth-label">USERNAME</label>
            <input
              type="text"
              className="kv-input"
              placeholder="Username"
              value={authData.basicAuth.username}
              onChange={(e) => updateBasicAuth('username', e.target.value)}
            />
            <label className="auth-label">PASSWORD</label>
            <input
              type="password"
              className="kv-input"
              placeholder="Password"
              value={authData.basicAuth.password}
              onChange={(e) => updateBasicAuth('password', e.target.value)}
            />
          </div>
        );

      default:
        return (
          <div className="auth-fields auth-empty">
            No authentication configured
          </div>
        );
    }
  };

  return (
    <div className="panel-body">
      <div className="section-header"><span>◇ AUTH TYPE</span></div>
      <div className="auth-tabs">
        {AUTH_TYPES.map((type) => (
          <button
            key={type}
            className={`auth-tab${authType === type ? ' active' : ''}`}
            onClick={() => setAuthType(type)}
          >
            {type}
          </button>
        ))}
      </div>
      {renderAuthFields()}
    </div>
  );
}
