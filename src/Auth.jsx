import React, { useState } from 'react';
import './Auth.css';

export default function Auth({ onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [signupErrors, setSignupErrors] = useState({});

  const handleLogin = () => {
    let errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) errs.email = true;
    if (!loginPass) errs.pass = true;
    setLoginErrors(errs);
    if (Object.keys(errs).length === 0) onAuthSuccess();
  };

  const handleSignup = () => {
    let errs = {};
    if (!signupName.trim()) errs.name = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) errs.email = true;
    if (signupPass.length < 8) errs.pass = true;
    if (signupPass !== signupConfirm) errs.confirm = true;
    setSignupErrors(errs);
    if (Object.keys(errs).length === 0) onAuthSuccess();
  };

  const calcStrength = (val) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };
  const strength = calcStrength(signupPass);
  const colors = ['#e07070', '#e0a070', '#c8a96e', '#70c870'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="auth-root">
      <div className="auth-grain"></div>
      <div className="auth-container">
        <div className="auth-card">
          
          <div className="auth-logo">
            <div className="auth-logo-mark">🔥</div>
            <span className="auth-logo-name">FORGE</span>
          </div>

          <div className="auth-tabs">
            <div className={`auth-tab-slider ${tab === 'signup' ? 'right' : ''}`}></div>
            <div className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</div>
            <div className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Create Account</div>
          </div>

          {tab === 'login' && (
            <div className="auth-page active">
              <h1 className="auth-heading">Welcome to the Forge</h1>
              <p className="auth-subheading">Sign in to sync your pod, shield your streak, and build credibility.</p>
              
              <div className="auth-form">
                <div className="auth-field">
                  <label>Email address</label>
                  <div className="auth-input-wrap">
                    <input type="email" placeholder="you@example.com" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} />
                    <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                  </div>
                  {loginErrors.email && <span className="auth-err-msg show">Please enter a valid email.</span>}
                </div>

                <div className="auth-field">
                  <label>Password</label>
                  <div className="auth-input-wrap auth-pass-wrap">
                    <input type={showLoginPass ? "text" : "password"} placeholder="••••••••" value={loginPass} onChange={e=>setLoginPass(e.target.value)} />
                    <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <button className="auth-eye-btn" type="button" onClick={() => setShowLoginPass(!showLoginPass)}>
                      {showLoginPass ? (
                        <svg className="eye-icon" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg className="eye-icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                  {loginErrors.pass && <span className="auth-err-msg show">Password is required.</span>}
                </div>

                <div className="auth-row-between">
                  <label className="auth-remember">
                    <input type="checkbox" />
                    <span className="auth-check-box"><svg viewBox="0 0 12 12"><polyline points="1.5,6 4.5,9 10.5,3"/></svg></span>
                    <span className="auth-remember-label">Remember me</span>
                  </label>
                  <a href="#" className="auth-forgot">Forgot password?</a>
                </div>

                <button className="auth-btn" onClick={handleLogin}>Sign In</button>

                <div className="auth-divider"><span>or continue with</span></div>

                <div className="auth-social-row">
                  <button className="auth-social-btn" onClick={() => window.open('https://accounts.google.com/accountchooser','_blank')}>
                    <svg viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </button>
                  <button className="auth-social-btn">
                    <svg viewBox="0 0 24 24" fill="var(--text)"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                    GitHub
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'signup' && (
            <div className="auth-page active">
              <h1 className="auth-heading">Step into the Fire</h1>
              <p className="auth-subheading">Create an account. No excuses, just habits.</p>
              
              <div className="auth-form">
                <div className="auth-field">
                  <label>Full name</label>
                  <div className="auth-input-wrap">
                    <input type="text" placeholder="Jane Doe" value={signupName} onChange={e=>setSignupName(e.target.value)} />
                    <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </div>
                  {signupErrors.name && <span className="auth-err-msg show">Name is required.</span>}
                </div>

                <div className="auth-field">
                  <label>Email address</label>
                  <div className="auth-input-wrap">
                    <input type="email" placeholder="you@example.com" value={signupEmail} onChange={e=>setSignupEmail(e.target.value)} />
                    <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                  </div>
                  {signupErrors.email && <span className="auth-err-msg show">Please enter a valid email.</span>}
                </div>

                <div className="auth-field">
                  <label>Password</label>
                  <div className="auth-input-wrap auth-pass-wrap">
                    <input type={showSignupPass ? "text" : "password"} placeholder="Min. 8 characters" value={signupPass} onChange={e=>setSignupPass(e.target.value)} />
                    <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <button className="auth-eye-btn" type="button" onClick={() => setShowSignupPass(!showSignupPass)}>
                      {showSignupPass ? (
                        <svg className="eye-icon" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg className="eye-icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                  <div className="auth-strength-bar">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="auth-strength-seg" style={{ background: signupPass && i <= strength ? colors[strength - 1] : 'rgba(255,255,255,0.07)' }}></div>
                    ))}
                  </div>
                  {signupPass && <div className="auth-strength-label" style={{ color: colors[strength - 1] }}>{labels[strength - 1]}</div>}
                  {signupErrors.pass && <span className="auth-err-msg show">Password must be at least 8 characters.</span>}
                </div>

                <div className="auth-field">
                  <label>Confirm password</label>
                  <div className="auth-input-wrap auth-pass-wrap">
                    <input type={showConfirmPass ? "text" : "password"} placeholder="Re-enter password" value={signupConfirm} onChange={e=>setSignupConfirm(e.target.value)} />
                    <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <button className="auth-eye-btn" type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                      {showConfirmPass ? (
                        <svg className="eye-icon" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg className="eye-icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                  {signupErrors.confirm && <span className="auth-err-msg show">Passwords do not match.</span>}
                </div>

                <button className="auth-btn" onClick={handleSignup}>Create Account</button>

                <div className="auth-divider"><span>or sign up with</span></div>

                <div className="auth-social-row">
                  <button className="auth-social-btn" onClick={() => window.open('https://accounts.google.com/accountchooser','_blank')}>
                    <svg viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </button>
                  <button className="auth-social-btn">
                    <svg viewBox="0 0 24 24" fill="var(--text)"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                    GitHub
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
