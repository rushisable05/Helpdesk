import { useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import { MailCheck, Send, Sparkles, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ErrorAlert from "@/components/ErrorAlert";

interface SubmittedTicket {
  id: number;
  subject: string;
  senderEmail: string;
  replies?: { body: string }[];
}

export default function SubmitTicketPage() {
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<SubmittedTicket | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/tickets/public-book", {
        senderName,
        senderEmail,
        subject,
        body,
      });
      setSubmitted(data.ticket);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "Failed to submit ticket. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6 animate-in-page">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-xl">H</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Helpdesk Support
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Apna issue ya error submit karein — AI Assistant turant email par reply bhejega
          </p>
        </div>

        {submitted ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <MailCheck className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  Ticket #{submitted.id} Booked!
                </span>
              </div>
              <CardTitle>{submitted.subject}</CardTitle>
              <CardDescription>
                AI reply aapke email (<strong>{submitted.senderEmail}</strong>) par bhej diya gaya hai (Inbox & Spam check karein).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submitted.replies?.[0]?.body && (
                <div className="rounded-lg border bg-muted/40 p-3.5 text-sm whitespace-pre-line">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Support Reply
                  </div>
                  {submitted.replies[0].body}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setSubmitted(null);
                    setSubject("");
                    setBody("");
                  }}
                >
                  Submit Another Issue
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/login">Agent Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Ticket</CardTitle>
              <CardDescription>
                Fill in your details below for an instant AI response via email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <ErrorAlert message={error} />}
                <div className="space-y-2">
                  <Label htmlFor="pub-name">Your Name</Label>
                  <Input
                    id="pub-name"
                    placeholder="Rushikesh Sable"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pub-email">Your Email</Label>
                  <Input
                    id="pub-email"
                    type="email"
                    placeholder="rushikeshsable9714@gmail.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pub-subject">Subject / Error Title</Label>
                  <Input
                    id="pub-subject"
                    placeholder="e.g. Login issue or Payment error"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pub-body">Describe Your Issue</Label>
                  <Textarea
                    id="pub-body"
                    rows={4}
                    placeholder="Explain the error you are facing..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? "Sending & Generating AI Reply..." : "Submit Ticket"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Staff / Agent Login
          </Link>
        </div>
      </div>
    </div>
  );
}
