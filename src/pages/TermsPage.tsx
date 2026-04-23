/**
 * Terms of Service. Mirrors PrivacyPage styling — short, plain-English,
 * editorial. Covers the legally relevant ground without tortured legalese.
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

export default function TermsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-8 py-12 md:px-12 md:py-16">
        {/* Hero */}
        <header className="mb-12">
          <span className="eyebrow">Berkeleytime · Legal</span>
          <h1 className="mt-4 display text-[44px] text-text-primary md:text-[56px]">
            Terms of <span className="serif-italic text-cal-gold">service</span>
          </h1>
          <div className="mt-5 flex items-center gap-3">
            <span className="h-px w-12 bg-cal-gold/50" />
            <span className="mono text-[10.5px] uppercase tracking-[0.18em] text-text-muted">
              Last updated · {LAST_UPDATED}
            </span>
          </div>
          <p className="mt-6 serif text-[16px] italic leading-relaxed text-text-secondary">
            By using Berkeleytime, you agree to the terms below. They're short on purpose —
            there's nothing here that should surprise a thoughtful reader.
          </p>
        </header>

        <div className="space-y-10">
          <Section title="What this is">
            <p>
              Berkeleytime is an independent course-discovery and degree-planning tool built by a
              UC Berkeley student. It is <strong className="text-cal-gold">not affiliated with,
              endorsed by, or operated by the University of California</strong> or its Office of
              the Registrar. It is a personal project provided as a free service for the benefit
              of fellow students.
            </p>
            <p>
              Course catalog data, grade history, and enrollment snapshots are sourced from
              Berkeley's public Class Schedule API and from{' '}
              <a className="text-cal-gold underline-offset-2 hover:underline" href="https://berkeleytime.com" target="_blank" rel="noreferrer">berkeleytime.com</a>{' '}
              — both are external sources. We surface this data unchanged but do not guarantee
              its accuracy.
            </p>
          </Section>

          <Section title="Use it sensibly">
            <p>
              You may use Berkeleytime for personal academic planning. You may not:
            </p>
            <ul className="space-y-1.5 pl-6 list-disc marker:text-cal-gold/60">
              <li>Scrape the site or its API at high volume.</li>
              <li>Attempt to access other users' synced data, plans, or schedules.</li>
              <li>Use the site to harass, spam, or harm anyone.</li>
              <li>Reverse-engineer the auth flow to impersonate another user.</li>
              <li>Do anything that would violate UC Berkeley's Code of Student Conduct
                  if done within official systems.</li>
            </ul>
          </Section>

          <Section title="Don't trust this for graduation">
            <p>
              The degree-audit feature is a planning aid, not a substitute for{' '}
              <a className="text-cal-gold underline-offset-2 hover:underline" href="https://registrar.berkeley.edu/" target="_blank" rel="noreferrer">official advising</a>{' '}
              or your{' '}
              <a className="text-cal-gold underline-offset-2 hover:underline" href="https://degreeguide.berkeley.edu/" target="_blank" rel="noreferrer">official degree audit</a>.
              Requirements change. Catalog years matter. Substitutions and waivers happen.
              Programs add and drop courses every semester. Before you commit to a graduation
              plan, confirm with your major advisor and the College's official audit system.
            </p>
            <p>
              We make no warranty that the requirements shown on this site are current,
              complete, or correctly applied to your situation. Don't be the person who walks
              into senior year missing a breadth because Berkeleytime said you were fine.
            </p>
          </Section>

          <Section title="Course data accuracy">
            <p>
              Class times, instructors, locations, enrollment counts, grade distributions, and
              Rate My Professor scores are refreshed periodically from external sources. They
              can be incorrect, stale, or temporarily missing. Always verify time-sensitive
              decisions (whether a class is open, when an exam is) against{' '}
              <a className="text-cal-gold underline-offset-2 hover:underline" href="https://classes.berkeley.edu/" target="_blank" rel="noreferrer">classes.berkeley.edu</a>{' '}
              or your CalCentral.
            </p>
          </Section>

          <Section title="Your data, your account">
            <p>
              You own everything you put into Berkeleytime — your selected programs, your
              schedules, your custom events. We don't claim any rights over that content.
              See the <a className="text-cal-gold underline-offset-2 hover:underline" href="/privacy">Privacy Policy</a>{' '}
              for what we collect and how to delete it.
            </p>
            <p>
              We may suspend access for accounts that violate the rules above. We will tell
              you why and (if applicable) how to appeal.
            </p>
          </Section>

          <Section title="Trademarks">
            <p>
              "UC Berkeley", "California Golden Bears", "Cal", and the various Berkeley shields
              and seals are trademarks of The Regents of the University of California. We use
              the Berkeley color palette and refer to the University by name solely to identify
              the institution this tool serves; this site is not endorsed by, sponsored by, or
              affiliated with the University.
            </p>
          </Section>

          <Section title="No warranty">
            <p>
              The service is provided "as is" without warranties of any kind, express or
              implied. We do not warrant that the service will be uninterrupted, timely, secure,
              or error-free. Course data is provided without warranty of accuracy.
            </p>
          </Section>

          <Section title="Limitation of liability">
            <p>
              To the maximum extent permitted by law, the operator of this site (a single
              student) is not liable for any indirect, incidental, special, consequential, or
              punitive damages — including but not limited to lost academic progress, missed
              graduation deadlines, or schedule conflicts arising from your use of the site.
            </p>
          </Section>

          <Section title="Governing law">
            <p>
              These terms are governed by the laws of the State of California, USA, without
              regard to its conflict-of-laws principles. Any dispute will be resolved in the
              state or federal courts located in Alameda County, California.
            </p>
          </Section>

          <Section title="Changes to these terms">
            <p>
              We may update these terms over time. The "Last updated" date at the top reflects
              the most recent revision. Continued use after a change means you accept the
              new terms.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions:{' '}
              <a className="mono text-cal-gold underline-offset-2 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </Section>

          <div className="mt-16 border-t border-border pt-8 text-center">
            <p className="serif text-[12.5px] italic text-text-muted">
              Built with care, not warranty. Cal forever — but verify your audit.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
