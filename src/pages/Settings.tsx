import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, Bell, Brain, Plug, Shield, CreditCard, Save } from "lucide-react";

const Settings = () => {
  const [businessName, setBusinessName] = useState("Müller Coffee");
  const [ownerName, setOwnerName] = useState("Maria Garcia");
  const [email, setEmail] = useState("maria@mullercoffee.de");
  const [city, setCity] = useState("Stuttgart");
  const [aiAutopilot, setAiAutopilot] = useState(true);
  const [maxDiscount, setMaxDiscount] = useState("40");
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [weatherSignals, setWeatherSignals] = useState(true);
  const [trafficSignals, setTrafficSignals] = useState(true);

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved`, {
      description: "Your changes are now live across the platform.",
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="font-serif italic font-normal">Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your business profile, AI behavior, integrations and notifications.
        </p>
      </header>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="glass p-1 h-auto flex-wrap">
          <TabsTrigger value="business" className="gap-2 data-[state=active]:bg-white">
            <Building2 className="size-4" /> Business
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2 data-[state=active]:bg-white">
            <Brain className="size-4" /> AI Strategist
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-white">
            <Bell className="size-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2 data-[state=active]:bg-white">
            <Plug className="size-4" /> Integrations
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2 data-[state=active]:bg-white">
            <CreditCard className="size-4" /> Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-white">
            <Shield className="size-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business profile</CardTitle>
              <CardDescription>Information shown to Mia users and on receipts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bn">Business name</Label>
                  <Input id="bn" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="on">Owner</Label>
                  <Input id="on" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="em">Contact email</Label>
                  <Input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ct">City</Label>
                  <Input id="ct" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => handleSave("Business")} className="gap-2">
                  <Save className="size-4" /> Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Strategist</CardTitle>
              <CardDescription>Control how the autonomous engine operates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 bg-white/40">
                <div>
                  <div className="font-semibold text-sm">AI Autopilot</div>
                  <div className="text-xs text-muted-foreground">Allow Mia to launch offers without manual approval.</div>
                </div>
                <Switch checked={aiAutopilot} onCheckedChange={setAiAutopilot} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 bg-white/40">
                <div>
                  <div className="font-semibold text-sm">Weather signals</div>
                  <div className="text-xs text-muted-foreground">Use Stuttgart real-time weather to trigger offers.</div>
                </div>
                <Switch checked={weatherSignals} onCheckedChange={setWeatherSignals} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 bg-white/40">
                <div>
                  <div className="font-semibold text-sm">Traffic & proximity signals</div>
                  <div className="text-xs text-muted-foreground">Use Payone density data to detect rush windows.</div>
                </div>
                <Switch checked={trafficSignals} onCheckedChange={setTrafficSignals} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="md">Maximum discount allowed (%)</Label>
                <Input id="md" type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
                <p className="text-xs text-muted-foreground">Mia will never propose offers above this threshold.</p>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("AI")} className="gap-2">
                  <Save className="size-4" /> Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose how you want to be alerted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 bg-white/40">
                <div>
                  <div className="font-semibold text-sm">Push notifications</div>
                  <div className="text-xs text-muted-foreground">Real-time alerts when Mia launches an offer.</div>
                </div>
                <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 bg-white/40">
                <div>
                  <div className="font-semibold text-sm">Email digest</div>
                  <div className="text-xs text-muted-foreground">Daily summary of revenue and activity.</div>
                </div>
                <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("Notifications")} className="gap-2">
                  <Save className="size-4" /> Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connected services powering your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Payone", desc: "Payment processing & traffic density", status: "Connected", color: "bg-success/10 text-success border-success/20" },
                { name: "Mia App", desc: "Customer-facing offer feed", status: "Connected", color: "bg-success/10 text-success border-success/20" },
                { name: "OpenWeather Stuttgart", desc: "Real-time weather signals", status: "Connected", color: "bg-success/10 text-success border-success/20" },
                { name: "Lovable AI Gateway", desc: "Generative offer engine", status: "Connected", color: "bg-success/10 text-success border-success/20" },
              ].map((i) => (
                <div key={i.name} className="flex items-center justify-between rounded-xl border border-border/60 p-4 bg-white/40">
                  <div>
                    <div className="font-semibold text-sm">{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.desc}</div>
                  </div>
                  <Badge variant="outline" className={i.color}>{i.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Your current City-Wallet plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15 border border-primary/15 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-primary font-bold">Current plan</div>
                    <div className="text-2xl font-bold mt-1">Merchant Pro</div>
                    <div className="text-xs text-muted-foreground mt-1">€89/month · billed monthly</div>
                  </div>
                  <Button variant="outline">Manage plan</Button>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-border/60 p-4 bg-white/40">
                  <div className="text-xs text-muted-foreground">AI offers / month</div>
                  <div className="text-xl font-bold mt-1">Unlimited</div>
                </div>
                <div className="rounded-xl border border-border/60 p-4 bg-white/40">
                  <div className="text-xs text-muted-foreground">Transaction fee</div>
                  <div className="text-xl font-bold mt-1">1.4%</div>
                </div>
                <div className="rounded-xl border border-border/60 p-4 bg-white/40">
                  <div className="text-xs text-muted-foreground">Next invoice</div>
                  <div className="text-xl font-bold mt-1">May 26</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Account access & authentication.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 bg-white/40">
                <div>
                  <div className="font-semibold text-sm">Two-factor authentication</div>
                  <div className="text-xs text-muted-foreground">Add an extra layer of security to your account.</div>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 bg-white/40">
                <div>
                  <div className="font-semibold text-sm">Change password</div>
                  <div className="text-xs text-muted-foreground">Last changed 3 months ago.</div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-destructive/20 p-4 bg-destructive/5">
                <div>
                  <div className="font-semibold text-sm text-destructive">Delete account</div>
                  <div className="text-xs text-muted-foreground">Permanently remove your business and data.</div>
                </div>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
