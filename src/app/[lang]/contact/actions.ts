"use server";

import { headers } from "next/headers";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { loadDictionary } from "@/i18n/load";
import { sendEmail } from "@/lib/email";
import { isRateLimited } from "@/lib/rate-limit";
import { adminInsert, adminSelect } from "@/lib/supabase/admin";
import type { ContactState, ContactValues } from "./state";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const slugPattern = /^[a-z0-9-]+$/;

// S3: a visitor sends a message. Writes a lead with the service role and notifies the teacher.
export async function submitContact(previous: ContactState, formData: FormData): Promise<ContactState> {
  const attempt = previous.attempt + 1;
  const field = (name: string, max: number) => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim().slice(0, max) : "";
  };

  // Honeypot: people never see this field. Answer as if it worked, save nothing.
  if (field("website", 200)) return { status: "success", attempt };

  const values: ContactValues = {
    name: field("name", 120),
    email: field("email", 254),
    phone: field("phone", 40),
    message: field("message", 5000),
    package: field("package", 80),
  };
  const submittedLocale = field("locale", 5);
  const locale: Locale = hasLocale(submittedLocale) ? submittedLocale : defaultLocale;

  const fieldErrors: NonNullable<ContactState["fieldErrors"]> = {};
  if (!values.name) fieldErrors.name = true;
  if (!emailPattern.test(values.email)) fieldErrors.email = true;
  if (!values.message) fieldErrors.message = true;
  if (Object.keys(fieldErrors).length > 0) return { status: "error", attempt, fieldErrors, values };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return { status: "error", attempt, formError: "rateLimited", values };
  }

  try {
    const [pkg] = slugPattern.test(values.package)
      ? await adminSelect<{ id: string; title: Record<Locale, string> }>("packages", {
          select: "id,title",
          slug: `eq.${values.package}`,
          is_published: "eq.true",
          limit: "1",
        })
      : [];

    // The same email writing again still gets a new lead; the panel groups them by email.
    const lead = await adminInsert<{ id: string }>(
      "leads",
      {
        source: "contact_form",
        full_name: values.name,
        email: values.email,
        phone: values.phone || null,
        message: values.message,
        locale,
        interested_package_id: pkg?.id ?? null,
      },
      "id",
    );

    // The notification goes to the teacher, so it uses the default language for now;
    // once accounts exist (Phase 3) it should follow the teacher's profiles.locale.
    const teacherEmail = process.env.TEACHER_EMAIL;
    if (teacherEmail) {
      const teacherLocale = defaultLocale;
      const t = (await loadDictionary(teacherLocale)).emails.leadNotification;
      await sendEmail({
        to: teacherEmail,
        subject: fill(t.subject, { name: values.name }),
        rows: [
          { label: t.name, value: values.name },
          { label: t.email, value: values.email },
          { label: t.phone, value: values.phone || t.none },
          { label: t.package, value: pkg?.title[teacherLocale] ?? t.none },
          { label: t.message, value: values.message },
        ],
        locale: teacherLocale,
        template: "lead_notification",
        replyTo: values.email,
        ref: { table: "leads", id: lead.id },
      });
    }

    return { status: "success", attempt };
  } catch (error) {
    console.error(error);
    return { status: "error", attempt, formError: "generic", values };
  }
}
