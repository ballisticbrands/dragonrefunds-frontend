// Full-page onboarding shown to a Dragon Refunds user who has zero
// connected Amazon Seller Central accounts. Nothing else on the
// dashboard is relevant until they connect — no tabs, no Available
// Data card, no marketing chrome — because the whole product
// (refund recovery) requires SP-API access.
//
// Once at least one SP-API connection lands, Dashboard.tsx switches
// to the full tabbed layout.

import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useBrand } from "@ballisticbrands/frontend-shared";
import { trackAccountConnected } from "@ballisticbrands/frontend-shared";
import { ConnectAmazonButton } from "./ConnectionButtons";

export function ConnectSellerPrompt({ onConnected }: { onConnected: () => void }) {
  const brand = useBrand();
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Connect your Amazon Seller Central account</CardTitle>
          <CardDescription className="mt-2">
            {brand.displayName} needs read access to your Seller Central
            account via Amazon's official SP-API to audit your account and
            find reimbursements you're owed. Read-only. Two minutes to
            connect.
          </CardDescription>
        </CardHeader>
        <CardBody className="flex justify-center">
          <ConnectAmazonButton
            label="Connect Amazon Seller Central account"
            onConnected={() => {
              trackAccountConnected("amazon_seller");
              onConnected();
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
