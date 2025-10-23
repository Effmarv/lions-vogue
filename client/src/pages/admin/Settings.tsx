import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Save, Mail, Phone, MessageCircle, Facebook, Instagram, Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [supportWhatsapp, setSupportWhatsapp] = useState("");
  const [supportFacebook, setSupportFacebook] = useState("");
  const [supportInstagram, setSupportInstagram] = useState("");
  const [supportTwitter, setSupportTwitter] = useState("");
  
  const utils = trpc.useUtils();

  const { data: settings } = trpc.settings.list.useQuery();

  const upsertMutation = trpc.settings.upsert.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully");
      utils.settings.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (settings) {
      const whatsapp = settings.find((s) => s.key === "whatsapp_number");
      if (whatsapp) setWhatsappNumber(whatsapp.value || "");
      
      const adminEmailSetting = settings.find((s) => s.key === "admin_email");
      if (adminEmailSetting) setAdminEmail(adminEmailSetting.value || "");
      
      const supportEmailSetting = settings.find((s) => s.key === "support_email");
      if (supportEmailSetting) setSupportEmail(supportEmailSetting.value || "");
      
      const supportPhoneSetting = settings.find((s) => s.key === "support_phone");
      if (supportPhoneSetting) setSupportPhone(supportPhoneSetting.value || "");
      
      const supportWhatsappSetting = settings.find((s) => s.key === "support_whatsapp");
      if (supportWhatsappSetting) setSupportWhatsapp(supportWhatsappSetting.value || "");
      
      const supportFacebookSetting = settings.find((s) => s.key === "support_facebook");
      if (supportFacebookSetting) setSupportFacebook(supportFacebookSetting.value || "");
      
      const supportInstagramSetting = settings.find((s) => s.key === "support_instagram");
      if (supportInstagramSetting) setSupportInstagram(supportInstagramSetting.value || "");
      
      const supportTwitterSetting = settings.find((s) => s.key === "support_twitter");
      if (supportTwitterSetting) setSupportTwitter(supportTwitterSetting.value || "");
    }
  }, [settings]);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    
    const settingsToSave = [
      { key: "whatsapp_number", value: whatsappNumber, description: "Admin WhatsApp number for order notifications" },
      { key: "admin_email", value: adminEmail, description: "Admin email for order and booking confirmations" },
      { key: "support_email", value: supportEmail, description: "Customer support email" },
      { key: "support_phone", value: supportPhone, description: "Customer support phone number" },
      { key: "support_whatsapp", value: supportWhatsapp, description: "Customer support WhatsApp number" },
      { key: "support_facebook", value: supportFacebook, description: "Facebook page URL" },
      { key: "support_instagram", value: supportInstagram, description: "Instagram profile URL" },
      { key: "support_twitter", value: supportTwitter, description: "Twitter profile URL" },
    ];

    let savedCount = 0;
    settingsToSave.forEach((setting) => {
      if (setting.value) {
        upsertMutation.mutate(setting, {
          onSuccess: () => {
            savedCount++;
            if (savedCount === settingsToSave.filter(s => s.value).length) {
              toast.success("All settings saved successfully");
            }
          }
        });
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your store and contact settings</p>
        </div>

        <form onSubmit={handleSaveAll} className="space-y-6">
          {/* Admin Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Notifications</CardTitle>
              <CardDescription>
                Configure how you receive order and booking notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsapp"
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="2348012345678"
                  className="max-w-md"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Include country code (no + or spaces). Example: 2348012345678
                </p>
              </div>

              <div>
                <Label htmlFor="adminEmail" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Admin Email
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@lionsvogue.com"
                  className="max-w-md"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Receive order confirmations and booking notifications via email
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Support Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Support Contact</CardTitle>
              <CardDescription>
                Contact information displayed to customers on the website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="supportEmail" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Support Email
                </Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@lionsvogue.com"
                  className="max-w-md"
                />
              </div>

              <div>
                <Label htmlFor="supportPhone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Support Phone
                </Label>
                <Input
                  id="supportPhone"
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+234 801 234 5678"
                  className="max-w-md"
                />
              </div>

              <div>
                <Label htmlFor="supportWhatsapp" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Support WhatsApp
                </Label>
                <Input
                  id="supportWhatsapp"
                  type="text"
                  value={supportWhatsapp}
                  onChange={(e) => setSupportWhatsapp(e.target.value)}
                  placeholder="2348012345678"
                  className="max-w-md"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Include country code (no + or spaces)
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Social Media Links</h4>
                
                <div>
                  <Label htmlFor="supportFacebook" className="flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook Page
                  </Label>
                  <Input
                    id="supportFacebook"
                    type="url"
                    value={supportFacebook}
                    onChange={(e) => setSupportFacebook(e.target.value)}
                    placeholder="https://facebook.com/lionsvogue"
                    className="max-w-md"
                  />
                </div>

                <div>
                  <Label htmlFor="supportInstagram" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram Profile
                  </Label>
                  <Input
                    id="supportInstagram"
                    type="url"
                    value={supportInstagram}
                    onChange={(e) => setSupportInstagram(e.target.value)}
                    placeholder="https://instagram.com/lionsvogue"
                    className="max-w-md"
                  />
                </div>

                <div>
                  <Label htmlFor="supportTwitter" className="flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter Profile
                  </Label>
                  <Input
                    id="supportTwitter"
                    type="url"
                    value={supportTwitter}
                    onChange={(e) => setSupportTwitter(e.target.value)}
                    placeholder="https://twitter.com/lionsvogue"
                    className="max-w-md"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={upsertMutation.isPending} className="gap-2">
            <Save className="w-4 h-4" />
            Save All Settings
          </Button>
        </form>

        {/* Information Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Order Notification Flow</CardTitle>
            <CardDescription>How order notifications work</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                  1
                </div>
                <div>
                  <p className="font-semibold">Customer places an order</p>
                  <p className="text-gray-600">Order details are collected including delivery information</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                  2
                </div>
                <div>
                  <p className="font-semibold">Notifications sent to admin</p>
                  <p className="text-gray-600">You receive notifications via WhatsApp link and email with order details</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                  3
                </div>
                <div>
                  <p className="font-semibold">Process the order</p>
                  <p className="text-gray-600">Update order status and communicate with customer</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

