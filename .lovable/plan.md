Plan to make the app stable and usable:

1. Fix Google sign-in end-to-end
- Reconfigure managed Google authentication for Lovable Cloud.
- Update the Google sign-in flow so it uses Lovable Cloud auth correctly and does not manually break the session.
- After Google login, ensure the app creates/fills a user profile if one does not exist, then redirects to the dashboard.
- Keep email/password login working.

2. Stop the preview from getting stuck or blank
- Add a safe app-level fallback so auth/profile/database errors show a clear screen instead of crashing the preview.
- Harden auth loading so it always finishes, even if profile creation/fetch fails.
- Guard backend calls when env/session values are missing so pages do not crash during preview reloads.
- Verify `/`, `/login`, `/signup`, and `/dashboard` render without console errors.

3. Fix language support properly
- Standardize the app to exactly 6 supported study languages: English, Hindi, Tamil, Telugu, Kannada, Marathi.
- Add language selection during signup/profile creation.
- Store the selected language on the user profile.
- Pass the selected language to chapter generation and doubt chat.
- Strengthen Gemini prompts so the generated notes and doubt answers are written fully in the selected language, not just lightly translated.

4. Make profile creation reliable for all auth methods
- Email signup will create a profile with name, class, and language.
- Google signup/login will auto-create a default profile from the Google account if missing.
- Defaults will stay Class 9 + English if the user has not chosen yet.

5. Validate after implementation
- Test the public pages and protected redirect flow.
- Test login/signup screen buttons.
- Test Google button behavior as far as the preview environment allows.
- Check for console/runtime errors after the changes.

Technical details:
- I will not edit auto-generated backend client files.
- I will avoid changing OAuth redirect URLs to protected routes.
- If the preview environment itself blocks OAuth popups/fetches, the code will still fail gracefully instead of blanking the app, and the published app flow will use the correct managed Google auth path.