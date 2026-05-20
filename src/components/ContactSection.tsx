import { FormEvent, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type ContactStatus = "idle" | "loading" | "success" | "error";

type Props = {
  /** Styling preset for landing vs legacy home page */
  variant?: "landing" | "home";
};

export function ContactSection({ variant = "landing" }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedMsg = message.trim();
    if (!email.trim() || trimmedMsg.length < 10 || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    const { data, error } = await supabaseBrowser.functions.invoke("send-contact", {
      body: {
        name: name.trim() || undefined,
        email: email.trim(),
        message: trimmedMsg,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message || "Something went wrong. Please try again.");
      return;
    }

    const payload = data as { success?: boolean; error?: string } | null;
    if (payload?.error) {
      setStatus("error");
      setErrorMessage(payload.error);
      return;
    }

    if (!payload?.success) {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
    setName("");
    setEmail("");
    setMessage("");
  };

  const isHome = variant === "home";

  return (
    <section
      id="contact"
      className={
        isHome
          ? "relative w-full bg-way-white py-16 md:py-20 z-35 border-t border-way-border"
          : "relative w-full py-16 md:py-20 border-t border-way-border"
      }
      style={isHome ? undefined : { backgroundColor: "#FAFAF8" }}
    >
      <div className={isHome ? "px-6 md:px-10 lg:px-[8vw] max-w-2xl mx-auto" : "px-6 md:px-10 lg:px-[8vw] max-w-2xl mx-auto"}>
        <p className="eyebrow text-way-sage mb-3">CONTACT</p>
        <h2 className="font-serif text-[28px] md:text-[36px] font-medium leading-tight text-way-text mb-3">
          Say hello
        </h2>
        <p className="font-sans text-sm text-way-gray mb-8">
          Send a note to{" "}
          <a href="mailto:hello@proverbs31way.com" className="text-way-sage hover:text-way-rose transition-colors">
            hello@proverbs31way.com
          </a>
          . We read every message.
        </p>

        {status === "success" ? (
          <p
            className="font-serif text-xl md:text-2xl italic text-way-text leading-relaxed"
          >
            Thank you. Your message is on its way.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="sr-only">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                autoComplete="name"
                disabled={status === "loading"}
                className="w-full px-5 py-3.5 rounded-xl bg-way-white border border-way-border font-sans text-base text-way-text placeholder:text-way-gray/50 focus:outline-none focus:border-way-rose focus:ring-2 focus:ring-way-rose/10 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="sr-only">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                disabled={status === "loading"}
                className="w-full px-5 py-3.5 rounded-xl bg-way-white border border-way-border font-sans text-base text-way-text placeholder:text-way-gray/50 focus:outline-none focus:border-way-rose focus:ring-2 focus:ring-way-rose/10 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="sr-only">
                Message
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message"
                required
                minLength={10}
                rows={5}
                disabled={status === "loading"}
                className="w-full px-5 py-3.5 rounded-xl bg-way-white border border-way-border font-sans text-base text-way-text placeholder:text-way-gray/50 focus:outline-none focus:border-way-rose focus:ring-2 focus:ring-way-rose/10 transition-all resize-y min-h-[120px] disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-pill-primary px-8 py-3.5 text-base disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Sending..." : "Send message"}
            </button>
            {status === "error" && errorMessage ? (
              <p className="text-sm text-way-gray" role="alert">
                {errorMessage}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </section>
  );
}
