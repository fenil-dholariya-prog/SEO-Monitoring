import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/forms/change-password-form";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-gray-950">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Environment-backed export, storage, and integration settings.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-gray-950">Website access password</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            The whole website is protected before Google login. The current default password is set from `SITE_ACCESS_PASSWORD`.
          </p>
          <ChangePasswordForm />
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-gray-950">Storage abstraction</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">Local storage is enabled for Phase 1 exports and uploaded logo URLs. The provider interface is isolated so UploadThing, Cloudflare R2, or S3 can replace it without touching report logic.</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-gray-950">Next integration placeholders</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">The remaining extension points are PageSpeed Insights, technical audits, client portal, approvals, scheduled generation, competitor tracking, rank tracking, and email delivery.</p>
        </Card>
      </div>
    </div>
  );
}
