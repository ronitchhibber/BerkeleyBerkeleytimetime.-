/**
 * Privacy Policy. Specific to what this app actually collects + stores.
 * Updated when product behavior changes — keep in sync with reality.
 */

const LAST_UPDATED = 'April 22, 2026'
const CONTACT_EMAIL = 'ronitchhibber@berkeley.edu'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="eyebrow">{title}</h2>
      <div className="serif text-[15px] leading-[1.75] text-text-primary/90 space-y-3">
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-8 py-12 md:px-12 md:py-16">
        {/* Hero */}
        <header className="mb-12">
          <span className="eyebrow">Berkeleytime · Legal</span>
          <h1 className="mt-4 display text-[44px] text-text-primary md:text-[56px]">
            Privacy <span className="serif-italic text-cal-gold">policy</span>
          </h1>
          <div className="mt-5 flex items-center gap-3">
            <span className="h-px w-12 bg-cal-gold/50" />
            <span className="mono text-[10.5px] uppercase tracking-[0.18em] text-text-muted">
              Last updated · {LAST_UPDATED}
            </span>
          </div>
          <p className="mt-6 serif text-[16px] italic leading-relaxed text-text-secondary">
            Berkeleytime is an independent student project — not affiliated with, endorsed by,
            or operated by UC Berkeley. This page covers what data we collect when you use the
            site, why we collect it, and how to delete it.
          </p>
        </header>

        <div className="space-y-10">
          <Section title="What we collect">
            <p>
              <strong className="text-cal-gold">If you sign in with Google:</strong> your email
              address, full name, and profile picture, as provided by Google's OpenID Connect
              identity service. We use Google's <code className="mono text-[13px]">openid</code>,{' '}
              <code className="mono text-[13px]">email</code>, and{' '}
              <code className="mono text-[13px]">profile</code> scopes — no access to Gmail, Drive,
              Calendar, or any other Google service.
            </p>
            <p>
              <strong className="text-cal-gold">When you build a plan or schedule:</strong> the
              programs you select, the courses you log to your degree audit, the classes and custom
              events on your weekly timetable, and the discussion / lab sections you pick. Stored
              against your account so they survive across devices.
            </p>
            <p>
              <strong className="text-cal-gold">If you use the app anonymously:</strong> we generate
              a random opaque user ID stored in your browser's localStorage. No personal data is
              attached. The ID is the only thing tying your synced state to you.
            </p>
            <p>
              <strong className="text-cal-gold">What we don't collect:</strong> we do not record
              your browsing history, search queries, IP address, or any behavioral analytics in the
              current build. If we add error monitoring (Sentry) or product analytics (PostHog) in
              the future, we will update this policy and surface the change before turning them on.
            </p>
          </Section>

          <Section title="Where it's stored">
            <p>
              All sync data lives in{' '}
              <a className="text-cal-gold underline-offset-2 hover:underline" href="https://developers.cloudflare.com/kv/" target="_blank" rel="noreferrer">Cloudflare Workers KV</a>,
              a globally-replicated key-value store. Cloudflare is our hosting provider and
              processes data on our behalf. The Cloudflare Worker that mediates reads and writes is
              source-available at <a className="text-cal-gold underline-offset-2 hover:underline" href="https://github.com/ronitchhibber/BerkeleyBerkeleytimetime.-" target="_blank" rel="noreferrer">our GitHub repository</a>.
            </p>
            <p>
              Your Google profile information is verified once per sign-in by sending the Google
              ID token to <code className="mono text-[13px]">oauth2.googleapis.com/tokeninfo</code> for
              signature validation. We never store your Google password and never receive your
              Google session cookies.
            </p>
            <p>
              Course catalog data (titles, instructors, times, grade history, enrollment snapshots)
              is sourced from Berkeley's public class schedule API and from{' '}
              <a className="text-cal-gold underline-offset-2 hover:underline" href="https://berkeleytime.com" target="_blank" rel="noreferrer">berkeleytime.com</a>.
              No personal data flows in either direction with these sources — they only provide
              static catalog information.
            </p>
          </Section>

          <Section title="How we use it">
            <p>
              The sole purpose of the data we hold is to render your degree plan, schedule, and
              account UI on whichever device you sign in from. We do not sell, rent, share, or
              otherwise hand off your data to third parties for marketing, advertising, or any
              other purpose.
            </p>
            <p>
              Aggregated, non-identifying course statistics (how many users have a given class on
              their schedule, etc.) may be surfaced anonymously in product features in the future.
              No individual user would ever be identifiable from such aggregates.
            </p>
          </Section>

          <Section title="Your rights">
            <p>
              <strong className="text-cal-gold">Sign out</strong> at any time from the user menu in
              the top-right of the navbar. Signing out removes your session locally; your synced
              data remains on the server so you can sign back in on any device.
            </p>
            <p>
              <strong className="text-cal-gold">Delete your account</strong> from the user menu in
              the top-right of the navbar (under <em>Sign out</em>). The button immediately
              purges every KV record keyed to your account — your profile, your plans, and your
              schedule — and signs you out. Deletion is permanent and cannot be undone.
            </p>
            <p>
              <strong className="text-cal-gold">Revoke Google access</strong> at{' '}
              <a className="text-cal-gold underline-offset-2 hover:underline" href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">myaccount.google.com/permissions</a>.
              Search for "Berkeleytime" and click Remove. This stops Berkeleytime from being able
              to issue new sign-in tokens for your account; it does not delete your previously
              synced data, which still requires the email above.
            </p>
          </Section>

          <Section title="Children">
            <p>
              Berkeleytime is intended for UC Berkeley students. Most undergraduates are 18 or
              older; we do not knowingly collect data from anyone under 13. If you believe a
              minor under 13 has signed in, contact the email above and we will delete the
              account.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              When we change what we collect or how we use it, we update this page and bump the
              "Last updated" date at the top. Material changes (new types of data, new third-party
              processors) will be announced via a banner on the site for at least seven days
              before taking effect.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions, concerns, or data-deletion requests:{' '}
              <a className="mono text-cal-gold underline-offset-2 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </Section>

          <div className="mt-16 border-t border-border pt-8 text-center">
            <p className="serif text-[12.5px] italic text-text-muted">
              Berkeleytime is a personal project by a Cal student.
              Not officially affiliated with the University of California.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
