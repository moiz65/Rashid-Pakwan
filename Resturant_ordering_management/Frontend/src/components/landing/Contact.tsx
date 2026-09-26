import { Mail, MapPin, Phone, Send } from "lucide-react";
import { SectionHeader } from "./HotDeals";

export function Contact() {
  return (
    <section id="contact" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
        <div>
          <SectionHeader
            eyebrow="Contact"
            title="Let's talk"
            subtitle="Questions, partnerships, or just craving a chat? We respond within 24 hours."
          />
          <div className="mt-10 space-y-4">
            {[
              { icon: Mail, label: "hello@Studio 7teas.app" },
              { icon: Phone, label: "+1 (555) 010-0123" },
              { icon: MapPin, label: "221B Flame Street, NY" },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-4">
                <div className="grid place-items-center h-11 w-11 rounded-xl bg-primary/15 border border-primary/30 text-primary shrink-0">
                  <c.icon className="h-5 w-5" />
                </div>
                <span className="text-sm">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name" placeholder="Jane Doe" />
            <Field label="Email" placeholder="jane@example.com" type="email" />
          </div>
          <Field label="Subject" placeholder="How can we help?" />
          <div>
            <label className="text-xs font-medium text-muted-foreground">Message</label>
            <textarea
              rows={5}
              placeholder="Tell us more..."
              className="mt-1.5 w-full rounded-xl bg-background border border-input px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <button className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-transform w-full sm:w-auto">
            <Send className="h-4 w-4" />
            Send message
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl bg-background border border-input px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
