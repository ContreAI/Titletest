# Contre Email Templates for Supabase Auth

These are on-brand email templates for Supabase authentication flows. They use the Contre brand colors and styling.

## Brand Colors Used

| Color | Hex | Usage |
|-------|-----|-------|
| Spruce | `#264E36` | Primary brand, headers, buttons |
| Storm Gray | `#37474F` | Body text |
| River Stone | `#78909C` | Secondary text |
| Mist | `#F5F7F7` | Background |
| Fern | `#607D3B` | Links, accents |
| Amber | `#F59E0B` | Warnings |

## Templates

1. **confirm-signup.html** - "Confirm Your Signup" email
2. **magic-link.html** - "Your Magic Link" email (includes OTP code)
3. **reset-password.html** - "Reset Your Password" email
4. **invite-user.html** - "You've Been Invited" email
5. **change-email.html** - "Confirm Email Change" email

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Go to the Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (Dev: `eekztqpmktnjxssfvueu`)
3. Navigate to **Authentication** > **Email Templates**
4. For each template type:
   - Copy the HTML content from the corresponding file
   - Paste it into the template body
   - Update the subject line if desired
   - Save changes

### Template Mapping

| Supabase Template | File | Subject Line |
|-------------------|------|--------------|
| Confirm signup | `confirm-signup.html` | Welcome to Contre - Confirm Your Email |
| Magic Link | `magic-link.html` | Sign In to Contre |
| Reset Password | `reset-password.html` | Reset Your Contre Password |
| Invite user | `invite-user.html` | You're Invited to Join Contre |
| Change Email Address | `change-email.html` | Confirm Your Email Change |

### Option 2: Supabase Management API

```bash
# Set your access token and project ref
export SUPABASE_ACCESS_TOKEN="your-access-token"
export PROJECT_REF="eekztqpmktnjxssfvueu"

# Update templates via API
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mailer_subjects_confirmation": "Welcome to Contre - Confirm Your Email",
    "mailer_templates_confirmation_content": "<paste-html-here>",
    "mailer_subjects_magic_link": "Sign In to Contre",
    "mailer_templates_magic_link_content": "<paste-html-here>",
    "mailer_subjects_recovery": "Reset Your Contre Password",
    "mailer_templates_recovery_content": "<paste-html-here>",
    "mailer_subjects_invite": "You are Invited to Join Contre",
    "mailer_templates_invite_content": "<paste-html-here>",
    "mailer_subjects_email_change": "Confirm Your Email Change",
    "mailer_templates_email_change_content": "<paste-html-here>"
  }'
```

## Template Variables

These templates use standard Supabase Auth template variables:

- `{{ .ConfirmationURL }}` - The confirmation/action URL
- `{{ .Token }}` - 6-digit OTP code (magic link only)
- `{{ .Email }}` - User's email address
- `{{ .NewEmail }}` - New email address (email change only)
- `{{ .SiteURL }}` - Your application's Site URL

## Preview

The templates feature:
- Responsive design (works on mobile and desktop)
- Contre brand header with logo text
- Primary CTA button in brand green
- Security notices where appropriate
- Alternative URL for copy/paste
- Professional footer

## Testing

After applying templates, test each flow:
1. Sign up with a new email to test confirm-signup
2. Request a magic link to test magic-link
3. Request password reset to test reset-password
4. Invite a user (if applicable) to test invite-user
5. Change email in settings to test change-email
