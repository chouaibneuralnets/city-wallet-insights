import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BookOpen, MessageCircle, Mail, Search, Sparkles, Zap, ShieldCheck, Brain, ExternalLink } from "lucide-react";

const faqs = [
  {
    q: "How does the AI Strategist (Mia) decide which offers to launch?",
    a: "Mia continuously fuses three live signals: weather (Stuttgart real-time API), foot traffic & payment density (Payone), and your historical revenue patterns. When the composite state matches a pre-trained pattern (e.g. rainy + low-traffic afternoon), it generates a contextual offer using the Lovable AI Gateway and pushes it to the Mia app within seconds.",
  },
  {
    q: "Can I cap the maximum discount Mia is allowed to offer?",
    a: "Yes. Go to Settings → AI Strategist and set the Maximum discount allowed (%). Mia will never propose offers above this threshold, even if its model predicts a higher uplift.",
  },
  {
    q: "What happens if I disable AI Autopilot?",
    a: "Mia will continue analyzing signals and generating recommendations, but each offer will require your manual approval before being pushed to customers.",
  },
  {
    q: "How are payments processed?",
    a: "All transactions are processed through Payone with a 1.4% fee on the Merchant Pro plan. Funds are settled to your bank account within 1-2 business days.",
  },
  {
    q: "Can I export my transactions and analytics?",
    a: "Yes. Visit the Finance & Payone page and use the Export button to download CSV reports for any date range.",
  },
  {
    q: "Is my customer data secure?",
    a: "Absolutely. All data is encrypted in transit and at rest. We are GDPR compliant and never share your customer information with third parties.",
  },
];

const Help = () => {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }
    toast.success("Message sent", {
      description: "Our team will reply within 24 hours.",
    });
    setSubject("");
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="font-serif italic font-normal">Help</span> Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Guides, FAQs and direct support for City-Wallet merchants.
        </p>
      </header>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Sparkles, title: "Getting started", desc: "Setup in 5 min", color: "from-primary/20 to-primary/5", iconColor: "text-primary" },
          { icon: Brain, title: "AI Strategist", desc: "How Mia thinks", color: "from-accent/20 to-accent/5", iconColor: "text-accent-foreground" },
          { icon: Zap, title: "Live signals", desc: "Weather & traffic", color: "from-peach/20 to-peach/5", iconColor: "text-peach" },
          { icon: ShieldCheck, title: "Security", desc: "GDPR & privacy", color: "from-success/20 to-success/5", iconColor: "text-success" },
        ].map((c) => (
          <Card key={c.title} className="cursor-pointer hover:shadow-elegant transition-all hover:-translate-y-0.5 group">
            <CardContent className="p-5">
              <div className={`size-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <c.icon className={`size-5 ${c.iconColor}`} />
              </div>
              <div className="font-semibold text-sm">{c.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{c.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* FAQ */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" />
                  Frequently asked questions
                </CardTitle>
                <CardDescription>Find answers to the most common questions.</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {filtered.length} articles
              </Badge>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search the help center..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No results for "{search}". Try different keywords or contact support.
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filtered.map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="size-5 text-accent-foreground" />
                Contact support
              </CardTitle>
              <CardDescription>We typically reply within 24 hours.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Textarea
                placeholder="Describe your issue..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button onClick={handleSubmit} className="w-full gap-2">
                <Mail className="size-4" /> Send message
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="size-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Quick links</span>
              </div>
              <div className="space-y-2">
                {["API documentation", "Status page", "Changelog", "Community Discord"].map((l) => (
                  <a
                    key={l}
                    href="#"
                    className="flex items-center justify-between text-sm font-medium hover:text-primary transition-colors group"
                  >
                    {l}
                    <ExternalLink className="size-3 opacity-60 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
